const routeGroups = {
  marketing: [
    '/',
    '/pricing',
    '/faq',
    '/blog',
    '/privacy-policy',
    '/tos',
    '/built-with',
    '/platform',
    '/starter-pack',
    '/vue',
    '/learn',
    '/patterns',
    '/tools',
    '/compare',
    '/alternatives',
    '/docs',
    '/developers',
    '/affiliate',
    '/packs/landing',
  ],
  auth: [
    '/login',
    '/auth',
    '/welcome',
    '/checkout',
    '/checkout-success',
    '/checkout-canceled',
    '/forgot-password',
    '/oauth/consent',
    '/confirmed',
    '/unsubscribe',
  ],
  app: [
    '/animations',
    '/roadmap',
    '/settings',
    '/help',
    '/onboarding',
    '/discord',
    '/changelog',
    '/account/kits',
  ],
  admin: ['/admin'],
  standalone: ['/newsletter'],
};

const routeConfig = {
  '/animations': {
    public: true,
    edgeToEdge: (subpath) =>
      subpath === null || subpath.split('/').length === 1,
    movesTransitionContent: (subpath) =>
      subpath !== null &&
      subpath !== 'saved' &&
      subpath.split('/').length === 1,
  },
  '/roadmap': {
    public: true,
    edgeToEdge: 'exact',
  },
  '/changelog': {
    public: true,
    edgeToEdge: 'exact',
    sidebar: true,
  },
  '/help': {
    edgeToEdge: 'exact',
  },
  '/account/kits': {
    edgeToEdge: 'subtree',
  },
};

export function getRouteConfig(pathname) {
  for (const [basePath, options] of Object.entries(routeConfig)) {
    if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
      continue;
    }

    const subpath =
      pathname === basePath
        ? null
        : pathname.slice(basePath.length + 1).replace(/\/$/, '');

    const edgeToEdge =
      typeof options.edgeToEdge === 'function'
        ? Boolean(options.edgeToEdge(subpath))
        : options.edgeToEdge === 'subtree' ||
          (options.edgeToEdge === 'exact' && subpath === null);

    return {
      public: Boolean(options.public),
      edgeToEdge,
      sidebar: Boolean(options.sidebar) && subpath === null,
      movesTransitionContent:
        typeof options.movesTransitionContent === 'function' &&
        Boolean(options.movesTransitionContent(subpath)),
    };
  }

  return {
    public: false,
    edgeToEdge: false,
    sidebar: false,
    movesTransitionContent: false,
  };
}

export function getRouteGroup(pathname) {
  for (const [group, basePaths] of Object.entries(routeGroups)) {
    for (const basePath of basePaths) {
      if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
        return group;
      }
    }
  }

  return 'marketing';
}