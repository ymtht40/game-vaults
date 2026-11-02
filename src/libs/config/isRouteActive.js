// Variable Mapping: S -> isRouteActive, e -> pathname, t -> href, r -> basePath

// NOTE: module id: 76624
export function isRouteActive(pathname, href) {
  if (!pathname || !href) return false;
  const basePath = href.split(/[?#]/)[0];
  return (
    !!basePath.startsWith('/') &&
    (basePath === '/'
      ? pathname === '/'
      : pathname === basePath || pathname.startsWith(`${basePath}/`))
  );
}

export default isRouteActive;
