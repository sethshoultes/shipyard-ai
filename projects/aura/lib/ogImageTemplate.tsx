/**
 * OG Image Template
 *
 * React component for generating OG images using @vercel/og (Satori).
 * Creates typographic social cards with tasteful Aura branding.
 */

import type { OGImageProps } from '@/types/aura';

/**
 * Truncates text to a maximum length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * OG Image Template Component
 *
 * Renders a React element that can be converted to PNG via Satori.
 * Design: Dark mode, midnight palette, typography-forward.
 */
export function OGImageTemplate({ title, promptPreview, createdAt, branding }: OGImageProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        backgroundColor: '#0a0a0f',
        padding: '60px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top bar with branding */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#7c7cff',
            letterSpacing: '-0.02em',
          }}
        >
          {branding}
        </div>
        <div
          style={{
            fontSize: '20px',
            color: '#606070',
          }}
        >
          {formattedDate}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: '700',
            color: '#fafafa',
            lineHeight: 1.1,
            marginBottom: '32px',
            letterSpacing: '-0.03em',
          }}
        >
          {truncate(title, 60)}
        </div>

        {/* Prompt preview */}
        <div
          style={{
            fontSize: '28px',
            color: '#a0a0b0',
            lineHeight: 1.5,
            backgroundColor: '#1a1a25',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid #2a2a35',
          }}
        >
          {truncate(promptPreview, 200)}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '1px solid #2a2a35',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#7c7cff',
            marginRight: '12px',
          }}
        />
        <div
          style={{
            fontSize: '20px',
            color: '#606070',
          }}
        >
          Portfolio generated with Aura
        </div>
      </div>
    </div>
  );
}

/**
 * Generates OG image metadata for a portfolio
 */
export function generateOGImageMetadata(title: string, promptPreview: string, createdAt: string): OGImageProps {
  return {
    title,
    promptPreview: promptPreview.replace(/[#*`]/g, '').trim(),
    createdAt,
    branding: 'Aura',
  };
}
