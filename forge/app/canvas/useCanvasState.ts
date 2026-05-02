import { useState, useCallback, useMemo } from 'react';

/**
 * Represents a node in the canvas workflow
 */
export interface CanvasNode {
  id: string;
  type: 'trigger' | 'agent';
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

/**
 * Represents a connection between two nodes
 */
export interface CanvasConnection {
  id: string;
  from: string; // source node id
  to: string;   // target node id
}

/**
 * Canvas state for managing the visual workflow
 */
export interface CanvasState {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  scale: number;
  offsetX: number;
  offsetY: number;
  selectedNodeId: string | null;
  isDragging: boolean;
  dragNodeId: string | null;
  isConnecting: boolean;
  connectionStartId: string | null;
}

/**
 * Actions available for canvas state management
 */
export interface CanvasActions {
  addNode: (node: CanvasNode) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  addConnection: (connection: CanvasConnection) => void;
  removeConnection: (id: string) => void;
  setScale: (scale: number) => void;
  setOffset: (offsetX: number, offsetY: number) => void;
  selectNode: (id: string | null) => void;
  startDrag: (nodeId: string) => void;
  endDrag: () => void;
  startConnection: (nodeId: string) => void;
  endConnection: () => void;
  resetView: () => void;
}

const initialState: CanvasState = {
  nodes: [],
  connections: [],
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  selectedNodeId: null,
  isDragging: false,
  dragNodeId: null,
  isConnecting: false,
  connectionStartId: null,
};

/**
 * Hook for managing canvas state
 * Provides state management for nodes, connections, and view transformations
 */
export function useCanvasState(): { state: CanvasState; actions: CanvasActions } {
  const [state, setState] = useState<CanvasState>(initialState);

  const addNode = useCallback((node: CanvasNode) => {
    setState((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  }, []);

  const updateNodePosition = useCallback((id: string, position: { x: number; y: number }) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    }));
  }, []);

  const removeNode = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((node) => node.id !== id),
      connections: prev.connections.filter(
        (conn) => conn.from !== id && conn.to !== id
      ),
      selectedNodeId: prev.selectedNodeId === id ? null : prev.selectedNodeId,
    }));
  }, []);

  const addConnection = useCallback((connection: CanvasConnection) => {
    setState((prev) => ({
      ...prev,
      connections: [...prev.connections, connection],
      isConnecting: false,
      connectionStartId: null,
    }));
  }, []);

  const removeConnection = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((conn) => conn.id !== id),
    }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(2, scale)),
    }));
  }, []);

  const setOffset = useCallback((offsetX: number, offsetY: number) => {
    setState((prev) => ({
      ...prev,
      offsetX,
      offsetY,
    }));
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedNodeId: id,
    }));
  }, []);

  const startDrag = useCallback((nodeId: string) => {
    setState((prev) => ({
      ...prev,
      isDragging: true,
      dragNodeId: nodeId,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      dragNodeId: null,
    }));
  }, []);

  const startConnection = useCallback((nodeId: string) => {
    setState((prev) => ({
      ...prev,
      isConnecting: true,
      connectionStartId: nodeId,
    }));
  }, []);

  const endConnection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnecting: false,
      connectionStartId: null,
    }));
  }, []);

  const resetView = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }));
  }, []);

  const actions: CanvasActions = useMemo(
    () => ({
      addNode,
      updateNodePosition,
      removeNode,
      addConnection,
      removeConnection,
      setScale,
      setOffset,
      selectNode,
      startDrag,
      endDrag,
      startConnection,
      endConnection,
      resetView,
    }),
    [
      addNode,
      updateNodePosition,
      removeNode,
      addConnection,
      removeConnection,
      setScale,
      setOffset,
      selectNode,
      startDrag,
      endDrag,
      startConnection,
      endConnection,
      resetView,
    ]
  );

  return { state, actions };
}
