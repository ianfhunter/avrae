const DM_PATH_SEGMENT = "dm";

function pathSegments(pathname) {
  return pathname
    .split("/")
    .map(segment => segment.trim().toLowerCase())
    .filter(Boolean);
}

function isDmRoute(pathname = window.location.pathname) {
  return pathSegments(pathname).includes(DM_PATH_SEGMENT);
}

function setHidden(element, hidden) {
  if (element) {
    element.hidden = hidden;
  }
}

function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function resolvePeerUrl(peerPath) {
  const url = new URL(window.location.href);
  const segments = pathSegments(url.pathname);

  const dmSegmentIndex = segments.indexOf(DM_PATH_SEGMENT);

  if (dmSegmentIndex !== -1) {
    segments.splice(dmSegmentIndex);
  } else if (segments[segments.length - 1] === "index.html") {
    segments.pop();
  }

  if (peerPath === DM_PATH_SEGMENT) {
    segments.push(DM_PATH_SEGMENT);
  }

  url.pathname = `/${segments.join("/")}${segments.length ? "/" : ""}`;
  return url.href;
}

function applyView() {
  const dmView = isDmRoute();

  document.documentElement.dataset.view = dmView ? "dm" : "player";
  setHidden(document.querySelector("[data-player-view]"), dmView);
  setHidden(document.querySelector("[data-dm-view]"), !dmView);
  setText(document.querySelector("[data-view-label]"), dmView ? "DM View" : "Player View");
  setText(
    document.querySelector("[data-view-description]"),
    dmView
      ? "The DM view is loaded from the /dm/ sub-URL."
      : "Player view is shown by default at the main URL."
  );

  const playerLink = document.querySelector("[data-player-link]");
  const dmLink = document.querySelector("[data-dm-link]");

  if (playerLink) {
    playerLink.href = resolvePeerUrl();
    playerLink.setAttribute("aria-current", dmView ? "false" : "page");
  }

  if (dmLink) {
    dmLink.href = resolvePeerUrl(DM_PATH_SEGMENT);
    dmLink.setAttribute("aria-current", dmView ? "page" : "false");
  }
}

applyView();
