export function getLegacyHashRedirectTarget(
  pathname: string,
  search: string,
  hash: string
) {
  if (pathname !== '/') {
    return null;
  }

  const fragment = hash.startsWith('#!')
    ? hash.slice(2)
    : hash.startsWith('#/')
      ? hash.slice(1)
      : null;

  if (fragment === null) {
    return null;
  }

  const normalizedFragment = fragment.startsWith('/') ? fragment : `/${fragment}`;

  try {
    const legacyUrl = new URL(normalizedFragment, 'http://localhost');
    const nextPath = `${legacyUrl.pathname}${legacyUrl.search}${legacyUrl.hash}`;
    return nextPath === '/' && search ? `/${search}` : nextPath;
  } catch {
    return null;
  }
}

export function applyLegacyHashRedirect(locationLike = window.location) {
  const redirectTarget = getLegacyHashRedirectTarget(
    locationLike.pathname,
    locationLike.search,
    locationLike.hash
  );

  if (!redirectTarget) {
    return false;
  }

  window.history.replaceState({}, '', redirectTarget);
  return true;
}
