import React from 'react';

/**
 * Properties for the ConnectionWire component
 */
export interface ConnectionWireProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
}

/**
 * Renders an SVG path connecting two nodes on the canvas
 * Uses a bezier curve for smooth visual connection
 */
export function ConnectionWire({
  from,
  to,
  color = '#666666',
  strokeWidth = 2,
  animated = false,
}: ConnectionWireProps): JSX.Element {
  // Calculate control points for bezier curve
  const dx = Math.abs(to.x - from.x) * 0.5;
  const controlPoint1 = { x: from.x + dx, y: from.y };
  const controlPoint2 = { x: to.x - dx, y: to.y };

  // Create bezier path
  const path = `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          animated
            ? {
                strokeDasharray: '5,5',
                animation: 'dashAnimation 1s linear infinite',
              }
            : undefined
        }
      />
      <style>
        {`
          @keyframes dashAnimation {
            to {
              stroke-dashoffset: -10;
            }
          }
        `}
      </style>
    </svg>
  );
}

/**
 * Renders a temporary wire being dragged during connection creation
 */
export function ConnectionWirePreview({
  from,
  to,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}): JSX.Element {
  return <ConnectionWire from={from} to={to} color="#999999" strokeWidth={1} animated />;
}
