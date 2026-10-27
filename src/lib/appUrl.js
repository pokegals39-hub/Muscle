// GitHub Pages serves the app from a sub-path (e.g. /my-gym/), so every
// navigation must stay inside this folder and go through the hash router.

// Absolute URL of the app root, without the hash (e.g. https://user.github.io/my-gym/).
export function appBaseUrl() {
  return window.location.href.split("#")[0];
}

// Full page reload on an in-app route. A hash change alone does not reload the
// document, and the auth flows need a fresh boot to re-read the session.
export function hardRedirect(path = "/") {
  const target = path.startsWith("/") ? path : `/${path}`;
  window.location.hash = target;
  window.location.reload();
}