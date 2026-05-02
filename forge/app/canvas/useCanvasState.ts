/**
 * useCanvasState — Canvas state management hook
 * Manages nodes, connections, pan/zoom, and selection state
 */

import { useState, useCallback } from 'react';

export interface Node {
  id: string;
  type: 'agent' | 'trigger';
  x: number;
  y: number;
  label: string;
  config: Record<string, unknown>;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface CanvasState {
  nodes: Node[];
  connections: Connection[];
  scale: number;
  offsetX: number;
  offsetY: number;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  connectingFrom: string | null;
}

const initialState: CanvasState = {
  nodes: [],
  connections: [],
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  selectedNodeId: null,
  selectedConnectionId: null,
  isDragging: false,
  dragStart: null,
  connectingFrom: null,
};

export function useCanvasState() {
  const [state, setState] = useState<CanvasState>(initialState);

  const addNode = useCallback((node: Node) => {
    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  }, []);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === id ? { ...node, x, y } : node
      ),
    }));
  }, []);

  const removeNode = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== id),
      connections: prev.connections.filter(
        conn => conn.from !== id && conn.to !== id
      ),
      selectedNodeId: prev.selectedNodeId === id ? null : prev.selectedNodeId,
    }));
  }, []);

  const addConnection = useCallback((connection: Connection) => {
    setState(prev => ({
      ...prev,
      connections: [...prev.connections, connection],
    }));
  }, []);

  const removeConnection = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== id),
      selectedConnectionId: prev.selectedConnectionId === id ? null : prev.selectedConnectionId,
    }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setState(prev => ({ ...prev, scale: Math.max(0.1, Math.min(3, scale)) }));
  }, []);

  const setOffset = useCallback((offsetX: number, offsetY: number) => {
    setState(prev => ({ ...prev, offsetX, offsetY }));
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedNodeId: id,
      selectedConnectionId: null,
    }));
  }, []);

  const selectConnection = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedConnectionId: id,
      selectedNodeId: null,
    }));
  }, []);

  const startDrag = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x, y },
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null,
    }));
  }, []);

  const startConnecting = useCallback((nodeId: string) => {
    setState(prev => ({ ...prev, connectingFrom: nodeId }));
  }, []);

  const cancelConnecting = useCallback(() => {
    setState(prev => ({ ...prev, connectingFrom: null }));
  }, []);

  const getConnectingFrom = useCallback(() => state.connectingFrom, [state.connectingFrom]);

  return {
    state,
    addNode,
    updateNodePosition,
    removeNode,
    addConnection,
    removeConnection,
    setScale,
    setOffset,
    selectNode,
    selectConnection,
    startDrag,
    endDrag,
    startConnecting,
    cancelConnecting,
    getConnectingFrom,
  };
}
