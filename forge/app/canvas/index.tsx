/**
 * Canvas — Root canvas component for Forge
 * White infinite surface for building multi-agent workflows
 */

import React, { useRef, useCallback } from 'react';
import { useCanvasState, Node, Connection } from './useCanvasState.js';
import { BaseNode } from '../nodes/BaseNode.js';
import { ConnectionWire } from './ConnectionWire.js';

export interface CanvasProps {
  initialNodes?: Node[];
  initialConnections?: Connection[];
  onWorkflowChange?: (nodes: Node[], connections: Connection[]) => void;
}

export default function Canvas({
  initialNodes = [],
  initialConnections = [],
  onWorkflowChange,
}: CanvasProps): JSX.Element {
  const {
    state,
    addNode,
    updateNodePosition,
    selectNode,
    startConnecting,
    cancelConnecting,
    addConnection,
  } = useCanvasState();

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with demo state on mount
  React.useEffect(() => {
    initialNodes.forEach(node => addNode(node));
    initialConnections.forEach(conn => addConnection(conn));
  }, []);

  // Handle canvas pan on middle mouse or space+drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
  }, []);

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    updateNodePosition(id, x, y);
  }, [updateNodePosition]);

  const handleNodeSelect = useCallback((id: string | null) => {
    selectNode(id);
  }, [selectNode]);

  const handleOutputClick = useCallback((nodeId: string) => {
    startConnecting(nodeId);
  }, [startConnecting]);

  const handleInputClick = useCallback((targetNodeId: string) => {
    if (state.connectingFrom && state.connectingFrom !== targetNodeId) {
      const connection: Connection = {
        id: `${state.connectingFrom}-${targetNodeId}`,
        from: state.connectingFrom,
        to: targetNodeId,
      };
      addConnection(connection);
      cancelConnecting();
      if (onWorkflowChange) {
        onWorkflowChange(state.nodes, [...state.connections, connection]);
      }
    }
  }, [state.connectingFrom, state.nodes, state.connections, addConnection, cancelConnecting, onWorkflowChange]);

  // Get node center position for connection rendering
  const getNodeCenter = useCallback((nodeId: string): { x: number; y: number } => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: (state.offsetX + node.x * state.scale) + 100,
      y: (state.offsetY + node.y * state.scale) + 40,
    };
  }, [state.nodes, state.scale, state.offsetX, state.offsetY]);

  return (
    <div
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
      }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      {/* Connection wires layer */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {state.connections.map(conn => (
          <ConnectionWire
            key={conn.id}
            from={getNodeCenter(conn.from)}
            to={getNodeCenter(conn.to)}
            isSelected={state.selectedConnectionId === conn.id}
            onClick={() => {}}
          />
        ))}
      </svg>

      {/* Nodes layer */}
      <div
        style={{
          transform: `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {state.nodes.map(node => (
          <BaseNode
            key={node.id}
            id={node.id}
            type={node.type}
            x={node.x}
            y={node.y}
            label={node.label}
            isSelected={state.selectedNodeId === node.id}
            isConnecting={state.connectingFrom === node.id}
            onSelect={handleNodeSelect}
            onMove={handleNodeMove}
            onOutputClick={handleOutputClick}
            onInputClick={handleInputClick}
          />
        ))}
      </div>

      {/* Connecting indicator */}
      {state.connectingFrom && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 100,
          }}
        >
          Click on a node to connect
        </div>
      )}
    </div>
  );
}
