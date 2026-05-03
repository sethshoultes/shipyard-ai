/**
 * Claude Parser
 *
 * Parses Claude conversation export JSON into structured Portfolio objects.
 * Wrapped in try/catch with graceful error handling for schema drift.
 */

import type {
  ClaudeExport,
  ClaudeConversationTurn,
  Portfolio,
  Prompt,
  ParseResult,
} from '@/types/aura';
import { validateClaudeExport } from './validators';

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extracts a title from prompt content
 * Takes first ~60 characters or first line, whichever is shorter
 */
function extractTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length <= 60) {
    return firstLine.replace(/[#*`]/g, '').trim();
  }
  return content.slice(0, 60).replace(/[#*`]/g, '').trim() + '...';
}

/**
 * Pairs human prompts with assistant responses
 */
function pairConversation(turns: ClaudeConversationTurn[]): Prompt[] {
  const prompts: Prompt[] = [];
  let currentHumanTurn: ClaudeConversationTurn | null = null;

  for (const turn of turns) {
    if (turn.role === 'human') {
      // If we have a pending human turn without a response, pair it anyway
      if (currentHumanTurn) {
        prompts.push({
          id: generateUUID(),
          content: currentHumanTurn.content,
          response: '[No response in export]',
          timestamp: currentHumanTurn.timestamp || new Date().toISOString(),
          title: extractTitle(currentHumanTurn.content),
          metadata: currentHumanTurn.metadata,
        });
      }
      currentHumanTurn = turn;
    } else if (turn.role === 'assistant' && currentHumanTurn) {
      // Pair this response with the previous human turn
      prompts.push({
        id: generateUUID(),
        content: currentHumanTurn.content,
        response: turn.content,
        timestamp: currentHumanTurn.timestamp || turn.timestamp || new Date().toISOString(),
        title: extractTitle(currentHumanTurn.content),
        metadata: {
          ...currentHumanTurn.metadata,
          ...turn.metadata,
        },
      });
      currentHumanTurn = null;
    }
  }

  // Handle any remaining human turn without a response
  if (currentHumanTurn) {
    prompts.push({
      id: generateUUID(),
      content: currentHumanTurn.content,
      response: '[No response in export]',
      timestamp: currentHumanTurn.timestamp || new Date().toISOString(),
      title: extractTitle(currentHumanTurn.content),
      metadata: currentHumanTurn.metadata,
    });
  }

  return prompts;
}

/**
 * Parses a Claude export JSON into a Portfolio
 */
export function parseClaudeExport(jsonData: unknown): ParseResult {
  try {
    // First, try to parse as string if it's a string
    let data: unknown = jsonData;
    if (typeof jsonData === 'string') {
      try {
        data = JSON.parse(jsonData);
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON format. Please ensure you uploaded a valid Claude export file.',
          errorDetails: parseError,
        };
      }
    }

    // Validate the structure
    const validation = validateClaudeExport(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid Claude export format: ${validation.error}`,
      };
    }

    const claudeExport = data as ClaudeExport;

    // Check for conversation array
    if (!Array.isArray(claudeExport.conversation)) {
      return {
        success: false,
        error:
          'This export format is not recognized. Please check you exported from Claude\'s Settings → Data → Export.',
      };
    }

    // Pair the conversation turns
    const prompts = pairConversation(claudeExport.conversation);

    if (prompts.length === 0) {
      return {
        success: false,
        error: 'No prompts found in this export. The conversation may be empty.',
      };
    }

    // Generate the portfolio
    const portfolio: Portfolio = {
      id: generateUUID(),
      title: claudeExport.title || extractTitle(prompts[0].content),
      prompts,
      createdAt: claudeExport.exportedAt || new Date().toISOString(),
    };

    return {
      success: true,
      portfolio,
    };
  } catch (error) {
    return {
      success: false,
      error:
        'This export format is not recognized. Please check you exported from Claude\'s Settings → Data → Export.',
      errorDetails: error,
    };
  }
}

/**
 * Validates if a file appears to be a Claude export
 * Quick check before full parsing
 */
export function isLikelyClaudeExport(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check for conversation array (required)
  if (!Array.isArray(obj.conversation)) {
    return false;
  }

  // Check for typical Claude export structure
  const hasConversation = obj.conversation.length > 0;
  const firstTurn = obj.conversation[0] as Record<string, unknown>;

  return hasConversation && firstTurn && typeof firstTurn.role === 'string';
}
