/**
 * Claude Export JSON Schema Definition
 *
 * Defines the expected structure of Claude conversation exports.
 * Used for validation and graceful degradation on schema drift.
 */

export const claudeExportSchema = {
  type: 'object',
  required: ['conversation'],
  properties: {
    conversation: {
      type: 'object',
      required: ['messages'],
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            required: ['role', 'content'],
            properties: {
              role: {
                type: 'string',
                enum: ['user', 'assistant', 'system']
              },
              content: {
                oneOf: [
                  { type: 'string' },
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        text: { type: 'string' },
                        source: {
                          type: 'object',
                          properties: {
                            type: { type: 'string' },
                            media_type: { type: 'string' },
                            data: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                ]
              },
              attachments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    name: { type: 'string' },
                    data: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Validates that an object matches the expected schema structure
 * @param {any} obj - Object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateClaudeExport(obj) {
  const errors = [];

  if (!obj || typeof obj !== 'object') {
    errors.push('Export must be a valid object');
    return { valid: false, errors };
  }

  if (!obj.conversation) {
    errors.push('Missing "conversation" root property');
    return { valid: false, errors };
  }

  if (!obj.conversation.messages || !Array.isArray(obj.conversation.messages)) {
    errors.push('Missing or invalid "messages" array');
    return { valid: false, errors };
  }

  // Validate message structure
  obj.conversation.messages.forEach((msg, idx) => {
    if (!msg.role) {
      errors.push(`Message ${idx}: missing "role"`);
    }
    if (msg.content === undefined) {
      errors.push(`Message ${idx}: missing "content"`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
