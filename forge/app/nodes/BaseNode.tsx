import React, { useCallback } from 'react';

/**
 * Types of nodes available in the canvas
 */
export type NodeType = 'trigger' | 'agent';

/**
 * Properties for the BaseNode component
 */
export interface BaseNodeProps {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onStartConnection: () => void;
  onEndConnection: () => void;
}

/**
 * Base node component for the canvas
 * Provides draggable, selectable node with connection points
 */
export function BaseNode({
  id,
  type,
  position,
  config,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onStartConnection,
  onEndConnection,
}: BaseNodeProps): JSX.Element {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect();
      onDragStart();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.preventDefault();
        onDragEnd();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onSelect, onDragStart, onDragEnd]
  );

  const handleOutputMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartConnection();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.preventDefault();
        onEndConnection();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onStartConnection, onEndConnection]
  );

  const nodeStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: '240px',
    minHeight: '80px',
    background: '#ffffff',
    border: isSelected ? '2px solid #0066cc' : '1px solid #cccccc',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'grab',
    userSelect: 'none',
    zIndex: isSelected ? 10 : 1,
  };

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: type === 'trigger' ? '#f0f7ff' : '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#333333',
    cursor: 'grab',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '12px',
    color: '#666666',
  };

  const connectionPointStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    background: '#ffffff',
    border: '2px solid #666666',
    borderRadius: '50%',
    cursor: 'crosshair',
    position: 'absolute',
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
  };

  const inputPointStyle: React.CSSProperties = {
    ...connectionPointStyle,
    left: '-6px',
    right: 'auto',
  };

  const typeLabel = type === 'trigger' ? 'Trigger' : 'Agent';
  const configPreview = Object.keys(config).length > 0
    ? Object.entries(config).slice(0, 2).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '4px' }}>
          <strong>{key}:</strong> {String(value)}
        </div>
      ))
    : <div style={{ fontStyle: 'italic', color: '#999999' }}>No configuration</div>;

  return (
    <div
      style={nodeStyle}
      onMouseDown={handleMouseDown}
      data-node-id={id}
      data-node-type={type}
    >
      {/* Input connection point */}
      {type === 'agent' && (
        <div style={inputPointStyle} title="Input" />
      )}

      <div style={headerStyle}>
        <span>{typeLabel}</span>
        <span style={{ fontSize: '10px', color: '#999999' }}>{id.slice(0, 8)}</span>
      </div>

      <div style={bodyStyle}>
        {configPreview}
      </div>

      {/* Output connection point */}
      <div
        style={connectionPointStyle}
        onMouseDown={handleOutputMouseDown}
        title="Drag to connect"
      />
    </div>
  );
}
