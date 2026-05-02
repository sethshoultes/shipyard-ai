import React from 'react';
import { BaseNode, BaseNodeProps } from './BaseNode';

/**
 * Configuration specific to trigger nodes
 */
export interface TriggerConfig {
  triggerType?: 'manual' | 'schedule' | 'webhook' | 'event';
  schedule?: string;
  webhookUrl?: string;
  eventType?: string;
  description?: string;
}

/**
 * Properties for the TriggerNode component
 */
export interface TriggerNodeProps extends Omit<BaseNodeProps, 'type' | 'config'> {
  triggerConfig: TriggerConfig;
}

/**
 * Trigger node component — extends BaseNode with trigger-specific configuration
 * Represents the starting point of a workflow
 */
export function TriggerNode({
  id,
  position,
  triggerConfig,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onStartConnection,
  onEndConnection,
}: TriggerNodeProps): JSX.Element {
  const config: Record<string, unknown> = {
    type: triggerConfig.triggerType || 'manual',
    description: triggerConfig.description || 'No description',
  };

  if (triggerConfig.triggerType === 'schedule') {
    config.schedule = triggerConfig.schedule || 'Not configured';
  } else if (triggerConfig.triggerType === 'webhook') {
    config.webhookUrl = triggerConfig.webhookUrl || 'Not configured';
  } else if (triggerConfig.triggerType === 'event') {
    config.eventType = triggerConfig.eventType || 'Not configured';
  }

  return (
    <BaseNode
      id={id}
      type="trigger"
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
 * Creates a new trigger node with default configuration
 */
export function createTriggerNode(
  id: string,
  position: { x: number; y: number },
  config?: Partial<TriggerConfig>
): {
  id: string;
  type: 'trigger';
  position: { x: number; y: number };
  config: Record<string, unknown>;
} {
  return {
    id,
    type: 'trigger',
    position,
    config: {
      triggerType: config?.triggerType || 'manual',
      schedule: config?.schedule || '',
      webhookUrl: config?.webhookUrl || '',
      eventType: config?.eventType || '',
      description: config?.description || '',
    },
  };
}
