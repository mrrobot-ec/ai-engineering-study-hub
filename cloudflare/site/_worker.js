const ALLOWED_PREFIXES = ["books/", "guides/", "papers/"];

function unauthorized() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AI Systems Study Hub", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function isAuthorized(request, env) {
  const expectedUser = env.AUTH_USER || "mrrobot";
  const expectedPassword = env.AUTH_PASSWORD || "";
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ") || !expectedPassword) return false;
  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    return separator > 0 &&
      decoded.slice(0, separator) === expectedUser &&
      decoded.slice(separator + 1) === expectedPassword;
  } catch {
    return false;
  }
}

function safeKey(pathname) {
  const raw = decodeURIComponent(pathname.slice("/files/".length));
  if (!raw || raw.includes("..") || raw.startsWith("/") || !ALLOWED_PREFIXES.some((prefix) => raw.startsWith(prefix))) {
    return null;
  }
  return raw;
}

function addRangeHeaders(headers, object, isRange) {
  headers.set("Accept-Ranges", "bytes");
  if (!isRange || !object.range) {
    headers.set("Content-Length", String(object.size));
    return 200;
  }
  const range = object.range;
  const offset = typeof range.offset === "number" ? range.offset : Math.max(object.size - range.length, 0);
  const length = range.length;
  headers.set("Content-Length", String(length));
  headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
  return 206;
}

async function servePdf(request, env) {
  const key = safeKey(new URL(request.url).pathname);
  if (!key) return new Response("Not found", { status: 404 });
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const hasRange = Boolean(request.headers.get("Range"));
  const object = await env.LIBRARY.get(key, hasRange ? { range: request.headers } : undefined);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${key.split("/").pop().replaceAll('"', "")}"`);
  headers.set("Cache-Control", "private, max-age=3600");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  const status = addRangeHeaders(headers, object, hasRange);
  return new Response(request.method === "HEAD" ? null : object.body, { status, headers });
}

async function serveAsset(pathname, request, env) {
  const assetRequest = new Request(new URL(pathname, request.url), request);
  return env.ASSETS.fetch(assetRequest);
}

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) return unauthorized();
    const url = new URL(request.url);
    if (url.pathname.startsWith("/files/")) return servePdf(request, env);
    if (url.pathname === "/api/library") return serveAsset("/library-index.json", request, env);
    if (url.pathname === "/api/study-path") return serveAsset("/study-path.json", request, env);
    if (url.pathname.startsWith("/notes/")) {
      const name = url.pathname.slice("/notes/".length);
      if (name.includes("..") || name.includes("/")) return new Response("Not found", { status: 404 });
      return serveAsset(`/notes/${name}`, request, env);
    }
    return serveAsset(url.pathname, request, env);
  },
};
