// Docs navigation + card data. Taken from the rendered /docs HTML (RSC payload).

export const DOCS_SECTIONS = [
  {
    title: 'Getting started',
    titleStyle: 'mono',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Installation', href: '/docs/getting-started/installation' },
      { title: 'Quick start', href: '/docs/getting-started/quick-start' },
    ],
  },
  {
    title: 'Guides',
    titleStyle: 'mono',
    items: [
      { title: 'Customization', href: '/docs/guides/customization' },
      { title: 'Performance & accessibility', href: '/docs/guides/production' },
      { title: 'MCP server', href: '/docs/guides/mcp' },
      { title: 'Webflow', href: '/docs/guides/webflow' },
    ],
  },
];

export const DOC_CARDS = {
  'Getting started': [
    {
      href: '/docs/getting-started/installation',
      figure: 'doc-installation',
      title: 'Installation',
      line: "Install GSAP, then copy any component. That's the whole setup.",
    },
    {
      href: '/docs/getting-started/quick-start',
      figure: 'doc-quick-start',
      title: 'Quick start',
      line: 'Copy your first component and have it running in about two minutes.',
    },
  ],
  Guides: [
    {
      href: '/docs/guides/customization',
      figure: 'doc-customization',
      title: 'Customizing a component',
      line: 'The data-anm-* attributes and props every component is tuned with.',
    },
    {
      href: '/docs/guides/production',
      figure: 'doc-production',
      title: 'Performance and accessibility',
      line: 'Reduced-motion behavior and the performance budget every component ships within.',
    },
    {
      href: '/docs/guides/mcp',
      figure: 'doc-mcp',
      title: 'Using Annnimate with AI agents',
      line: 'Connect Cursor, Claude Code or any MCP client, and your agent finds components and pulls their code for you.',
    },
    {
      href: '/docs/guides/webflow',
      figure: 'doc-webflow',
      title: 'Using Annnimate in Webflow',
      line: 'Paste older components into the Designer as JSON. New ones ship for React, Vue and HTML.',
    },
  ],
};
