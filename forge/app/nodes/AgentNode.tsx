import React from 'react';
import { BaseNode, BaseNodeProps } from './BaseNode';

/**
 * Configuration specific to agent nodes
 */
export interface AgentConfig {
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Properties for the AgentNode component
 */
export interface AgentNodeProps extends Omit<BaseNodeProps, 'type' | 'config'> {
  agentConfig: AgentConfig;
}

/**
 * Agent node component — extends BaseNode with agent-specific configuration
 * Represents a Claude agent in the workflow
 */
export function AgentNode({
  id,
  position,
  agentConfig,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onStartConnection,
  onEndConnection,
}: AgentNodeProps): JSX.Element {
  const config: Record<string, unknown> = {
    prompt: agentConfig.prompt || 'No prompt set',
    model: agentConfig.model || 'claude-sonnet-4-20250514',
    temperature: agentConfig.temperature ?? 0.7,
  };

  return (
    <BaseNode
      id={id}
      type="agent"
      position={position}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onStartConnection={onStartConnection}
      onEndConnection={onEndConnection}
    />
  );
}

/**
 * Creates a new agent node with default configuration
 */
export function createAgentNode(
  id: string,
  position: { x: number; y: number },
  config?: Partial<AgentConfig>
): {
  id: string;
  type: 'agent';
  position: { x: number; y: number };
  config: Record<string, unknown>;
} {
  return {
    id,
    type: 'agent',
    position,
    config: {
      prompt: config?.prompt || '',
      model: config?.model || 'claude-sonnet-4-20250514',
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 1024,
      systemPrompt: config?.systemPrompt || '',
    },
  };
}
