/**
 * ConnectionWire — SVG wire rendering for node connections
 * Renders bezier curves between node output and input ports
 */

import React from 'react';

export interface ConnectionWireProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isSelected?: boolean;
  onClick?: () => void;
}

export function ConnectionWire({ from, to, isSelected = false, onClick }: ConnectionWireProps): JSX.Element {
  // Calculate control points for bezier curve
  const dx = Math.abs(to.x - from.x) * 0.5;
  const control1X = from.x + dx;
  const control2X = to.x - dx;

  const path = `M ${from.x} ${from.y} C ${control1X} ${from.y}, ${control2X} ${to.y}, ${to.x} ${to.y}`;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Invisible thick path for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
      />
      {/* Visible wire */}
      <path
        d={path}
        stroke={isSelected ? '#3b82f6' : '#94a3b8'}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
      />
      {/* Animated flow indicator */}
      <circle r={4} fill={isSelected ? '#3b82f6' : '#64748b'}>
        <animateMotion
          dur="1.5s"
          repeatCount="indefinite"
          path={path}
        />
      </circle>
    </g>
  );
}

export default ConnectionWire;
