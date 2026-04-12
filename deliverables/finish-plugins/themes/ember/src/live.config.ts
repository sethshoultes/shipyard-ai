/**
 * Ember Theme - Live Configuration
 * Bold. Editorial. For people with something to say.
 */

import type { LiveConfig } from '@emdash/types';

export const config: LiveConfig = {
  name: 'Ember',
  version: '1.0.0',
  description: 'Magazine-style theme with serif headings, dark navy + burnt orange, asymmetric grids.',
  personality: 'Bold, Editorial',

  collections: {
    posts: {
      name: 'Posts',
      icon: 'newspaper',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'excerpt', type: 'textarea' },
        { name: 'content', type: 'richtext', required: true },
        { name: 'featuredImage', type: 'image' },
        { name: 'publishedAt', type: 'datetime' },
        { name: 'category', type: 'select', options: ['Editorial', 'Review', 'Feature', 'Opinion'] },
      ],
    },
    pages: {
      name: 'Pages',
      icon: 'document',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richtext', required: true },
        { name: 'featuredImage', type: 'image' },
      ],
    },
  },

  theme: {
    colors: {
      primary: '#1a2744',
      accent: '#d4622a',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      muted: '#94a3b8',
    },
    fonts: {
      heading: 'Playfair Display, Georgia, serif',
      body: 'Source Sans Pro, system-ui, sans-serif',
    },
    borderRadius: '2px',
  },
};

export default config;
