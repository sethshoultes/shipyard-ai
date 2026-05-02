import React, { useRef, useCallback, useEffect } from 'react';
import { useCanvasState, CanvasNode, CanvasConnection } from './useCanvasState';
import { BaseNode } from '../nodes/BaseNode';
import { ConnectionWire, ConnectionWirePreview } from './ConnectionWire';

/**
 * Properties for the Canvas component
 */
export interface CanvasProps {
  initialNodes?: CanvasNode[];
  initialConnections?: CanvasConnection[];
  onWorkflowChange?: (nodes: CanvasNode[], connections: CanvasConnection[]) => void;
}

/**
 * Canvas root component — infinite white surface for building workflows
 * Users can add, drag, and connect nodes to create multi-agent workflows
 */
export default function Canvas({
  initialNodes = [],
  initialConnections = [],
  onWorkflowChange,
}: CanvasProps): JSX.Element {
  const { state, actions } = useCanvasState();
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Initialize with provided nodes/connections
  useEffect(() => {
    if (initialNodes.length > 0 || initialConnections.length > 0) {
      initialNodes.forEach((node) => actions.addNode(node));
      initialConnections.forEach((conn) => actions.addConnection(conn));
    }
  }, []);

  // Notify parent of workflow changes
  useEffect(() => {
    if (onWorkflowChange) {
      onWorkflowChange(state.nodes, state.connections);
    }
  }, [state.nodes, state.connections]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      actions.setScale(state.scale * delta);
    },
    [state.scale, actions]
  );

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only pan if clicking on canvas background (not a node)
      if (e.target === canvasRef.current) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX - state.offsetX, y: e.clientY - state.offsetY };
      }
    },
    [state.offsetX, state.offsetY]
  );

  // Handle pan/drag
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        actions.setOffset(e.clientX - panStartRef.current.x, e.clientY - panStartRef.current.y);
      }

      if (state.isDragging && state.dragNodeId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - state.offsetX) / state.scale;
          const y = (e.clientY - rect.top - state.offsetY) / state.scale;
          actions.updateNodePosition(state.dragNodeId, { x, y });
        }
      }
    },
    [state.isDragging, state.dragNodeId, state.offsetX, state.offsetY, state.scale, actions]
  );

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    actions.endDrag();
  }, [actions]);

  // Transform canvas coordinates based on pan/zoom
  const transformStyle: React.CSSProperties = {
    transform: `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`,
    transformOrigin: '0 0',
    width: '100%',
    height: '100%',
  };

  // Get node center position for connection rendering
  const getNodeCenter = (nodeId: string): { x: number; y: number } | null => {
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    return {
      x: node.position.x + 120, // half node width
      y: node.position.y + 40,  // half node height
    };
  };

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        background: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        cursor: isPanningRef.current ? 'grabbing' : 'grab',
      }}
    >
      <div style={transformStyle}>
        {/* Render connection wires */}
        {state.connections.map((conn) => {
          const fromPos = getNodeCenter(conn.from);
          const toPos = getNodeCenter(conn.to);
          if (!fromPos || !toPos) return null;
          return (
            <ConnectionWire
              key={conn.id}
              from={fromPos}
              to={toPos}
              color="#666666"
              strokeWidth={2}
            />
          );
        })}

        {/* Render preview wire when connecting */}
        {state.isConnecting && state.connectionStartId && (
          <ConnectionWirePreview
            from={getNodeCenter(state.connectionStartId) || { x: 0, y: 0 }}
            to={{ x: 0, y: 0 }}
          />
        )}

        {/* Render nodes */}
        {state.nodes.map((node) => (
          <BaseNode
            key={node.id}
            id={node.id}
            type={node.type}
            position={node.position}
            config={node.config}
            isSelected={state.selectedNodeId === node.id}
            onSelect={() => actions.selectNode(node.id)}
            onDragStart={() => actions.startDrag(node.id)}
            onDragEnd={actions.endDrag}
            onStartConnection={() => actions.startConnection(node.id)}
            onEndConnection={actions.endConnection}
          />
        ))}
      </div>
    </div>
  );
}
