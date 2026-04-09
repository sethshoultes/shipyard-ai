/**
 * Standardized demo content for theme screenshots
 * Uses realistic content that showcases each theme's design philosophy
 */

export const demoContent = {
  // Blog post content to showcase typography and styling
  blogPosts: [
    {
      title: 'The Art of Simplicity',
      slug: 'the-art-of-simplicity',
      excerpt:
        'In a world of endless complexity, simplicity stands as a beacon of clarity. Discover how embracing minimalist principles can transform your digital presence.',
      content: `
        <h2>Finding Beauty in Simplicity</h2>
        <p>
          Simplicity is not the absence of features—it's the careful curation of what matters most.
          When you strip away the unnecessary, what remains is pure, intentional, and powerful.
        </p>
        <p>
          The best designs often go unnoticed because they work so seamlessly. They don't demand
          attention; they command it through their elegance and purposefulness.
        </p>
        <h3>The Principles</h3>
        <ul>
          <li>Remove everything that doesn't serve your message</li>
          <li>Let whitespace breathe and guide the eye</li>
          <li>Use typography as the primary design tool</li>
          <li>Build trust through clarity and directness</li>
        </ul>
      `,
      date: new Date('2024-03-15'),
      author: 'Design Team',
      category: 'Design',
    },
    {
      title: 'Building Community Through Design',
      slug: 'building-community-through-design',
      excerpt:
        'Design is not just about aesthetics. It\'s about creating spaces where people feel welcomed, heard, and valued.',
      content: `
        <h2>The Human Element</h2>
        <p>
          Every design decision is ultimately about people. When you design with empathy,
          you create something that resonates on a deeper level.
        </p>
        <p>
          Communities are built when people feel a genuine connection. Your design should
          reflect warmth, openness, and genuine care for your audience.
        </p>
        <h3>Creating Connection</h3>
        <ol>
          <li>Listen to your community's needs</li>
          <li>Design with inclusivity in mind</li>
          <li>Create space for authentic voices</li>
          <li>Build iteratively based on feedback</li>
        </ol>
      `,
      date: new Date('2024-02-28'),
      author: 'Design Team',
      category: 'Community',
    },
    {
      title: 'Why We Care About Performance',
      slug: 'why-we-care-about-performance',
      excerpt:
        'A beautiful site that loads slowly is like a well-written book printed on pages that never turn.',
      content: `
        <h2>Performance as Design</h2>
        <p>
          Performance is not a technical afterthought—it's a design requirement. Every millisecond counts
          when it comes to user experience.
        </p>
        <p>
          Fast, responsive experiences signal respect for the user's time. When your site performs well,
          users feel valued and are more likely to engage with your content.
        </p>
      `,
      date: new Date('2024-02-10'),
      author: 'Design Team',
      category: 'Performance',
    },
  ],

  // About page content
  aboutPage: {
    title: 'About Us',
    tagline: 'Crafted with care. Built with intention.',
    introduction: `
      We believe that design is more than pixels on a screen. It's about creating meaningful
      experiences that resonate with people. Every decision we make is guided by a simple principle:
      put the user first.
    `,
    mission: {
      title: 'Our Mission',
      description: `
        To empower creators and builders with beautiful, intuitive tools that let them focus on
        what matters most: their message and their community.
      `,
    },
    values: [
      {
        title: 'Simplicity',
        description: 'We believe in removing friction. Every feature should have a clear purpose.',
      },
      {
        title: 'Authenticity',
        description:
          'We celebrate individuality. Your story should be told in your voice, not ours.',
      },
      {
        title: 'Accessibility',
        description:
          'Good design works for everyone. We build with inclusion at the foundation.',
      },
      {
        title: 'Community',
        description:
          'We grow together. Your success is our success. We listen, iterate, and improve.',
      },
    ],
    team: [
      {
        name: 'Alex Chen',
        role: 'Lead Designer',
        bio: 'Passionate about creating experiences that feel natural and intuitive.',
      },
      {
        name: 'Jordan Smith',
        role: 'Creative Director',
        bio: 'Drives vision for how design and community intersect.',
      },
      {
        name: 'Casey Martinez',
        role: 'Developer',
        bio: 'Ensures that beautiful designs perform beautifully.',
      },
    ],
    cta: {
      text: 'Want to work with us? Get in touch.',
      link: '/contact',
    },
  },

  // Contact form content
  contact: {
    title: 'Get In Touch',
    description:
      'We love hearing from you. Whether you have a question, feedback, or just want to say hello, drop us a message.',
    fields: [
      {
        label: 'Name',
        name: 'name',
        type: 'text',
        placeholder: 'Your name',
        required: true,
      },
      {
        label: 'Email',
        name: 'email',
        type: 'email',
        placeholder: 'your@email.com',
        required: true,
      },
      {
        label: 'Subject',
        name: 'subject',
        type: 'text',
        placeholder: 'What is this about?',
        required: true,
      },
      {
        label: 'Message',
        name: 'message',
        type: 'textarea',
        placeholder: 'Tell us what\'s on your mind...',
        required: true,
      },
    ],
    submitText: 'Send Message',
  },

  // Homepage headline and tagline
  homepage: {
    headline: 'Beautiful Design. Powerful Tools.',
    tagline: 'Create stunning digital experiences without the complexity.',
    cta: {
      primary: 'Get Started',
      secondary: 'Learn More',
    },
    features: [
      {
        title: 'Elegant Simplicity',
        description: 'Clean, intuitive interfaces that get out of your way.',
      },
      {
        title: 'Fully Responsive',
        description: 'Works beautifully on mobile, tablet, and desktop.',
      },
      {
        title: 'Accessible',
        description: 'Designed for everyone. WCAG 2.1 AA compliant.',
      },
      {
        title: 'Performance First',
        description: 'Fast, optimized, and ready for the modern web.',
      },
    ],
  },
};

/**
 * HTML template for injecting demo content into a theme
 * This can be used to create a standardized demo page that all themes can render
 */
export const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Content</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
    }
    .header {
      padding: 2rem;
      text-align: center;
    }
    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .post {
      margin: 2rem 0;
      padding: 1.5rem;
      border-radius: 8px;
    }
    h1, h2, h3 {
      margin: 1.5rem 0 0.5rem;
    }
    p {
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${demoContent.homepage.headline}</h1>
    <p>${demoContent.homepage.tagline}</p>
  </header>

  <main class="content">
    <section>
      <h2>Featured Articles</h2>
      ${demoContent.blogPosts
        .map(
          (post) => `
        <article class="post">
          <h3>${post.title}</h3>
          <p><small>${post.date.toLocaleDateString()} • ${post.author}</small></p>
          <p>${post.excerpt}</p>
        </article>
      `
        )
        .join('')}
    </section>
  </main>
</body>
</html>
`;
