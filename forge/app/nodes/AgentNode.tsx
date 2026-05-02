/**
 * AgentNode — AI agent node component
 * Extends BaseNode with agent-specific configuration
 */

import React from 'react';
import { BaseNode } from './BaseNode.js';

export interface AgentConfig {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
}

export interface AgentNodeProps {
  id: string;
  x: number;
  y: number;
  label: string;
  agentConfig: AgentConfig;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onOutputClick: (nodeId: string) => void;
  onInputClick: (nodeId: string) => void;
}

export function AgentNode({
  id,
  x,
  y,
  label,
  agentConfig,
  isSelected,
  isConnecting,
  onSelect,
  onMove,
  onOutputClick,
  onInputClick,
}: AgentNodeProps): JSX.Element {
  return (
    <BaseNode
      id={id}
      type="agent"
      x={x}
      y={y}
      label={label}
      isSelected={isSelected}
      isConnecting={isConnecting}
      onSelect={onSelect}
      onMove={onMove}
      onOutputClick={onOutputClick}
      onInputClick={onInputClick}
    />
  );
}

export default AgentNode;
