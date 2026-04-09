export function getLegacyHashRedirectTarget(
  pathname: string,
  search: string,
  hash: string
) {
  if (pathname !== '/' || !hash.startsWith('#/')) {
    return null;
  }

  const fragment = hash.slice(1);

  try {
    const legacyUrl = new URL(fragment, 'http://localhost');
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
