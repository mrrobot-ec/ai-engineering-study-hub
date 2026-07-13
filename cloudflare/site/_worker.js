const ALLOWED_PREFIXES = ["books/", "guides/", "papers/"];
const STATIC_PATHS = new Set([
  "/",
  "/index.html",
  "/static/app.js",
  "/static/marked.umd.js",
  "/static/marked.LICENSE",
  "/static/styles.css",
  "/library-index.json",
  "/study-path.json",
]);
const NOTE_NAMES = new Set([
  "README.md",
  "JOB-ALIGNED-LEARNING-PATH.md",
  "ROADMAP.md",
  "CAREER-GUIDE-DRAFT.md",
  "RECOMMENDER-SYSTEMS-BOOK-AUDIT.md",
  "DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md",
  "AI-ENGINEERING-BOOK-ACCESS.md",
  "SOURCE-POLICY.md",
]);

function unauthorized() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AI Systems Study Hub", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

async function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  return crypto.subtle.timingSafeEqual(leftHash, rightHash);
}

async function isAuthorized(request, env) {
  const expectedUser = env.AUTH_USER || "mrrobot";
  const expectedPassword = env.AUTH_PASSWORD || "";
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ") || !expectedPassword) return false;
  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    if (separator <= 0) return false;
    const [userMatches, passwordMatches] = await Promise.all([
      constantTimeEqual(decoded.slice(0, separator), expectedUser),
      constantTimeEqual(decoded.slice(separator + 1), expectedPassword),
    ]);
    return userMatches && passwordMatches;
  } catch {
    return false;
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function normalizeProgress(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Progress must be a JSON object");
  }

  const completed = {};
  const completedEntries = Object.entries(input.completed || {}).slice(0, 2000);
  for (const [key, value] of completedEntries) {
    if (value === true && key.length <= 500) completed[key] = true;
  }

  const completedWeeks = {};
  const weekEntries = Object.entries(input.completedWeeks || {}).slice(0, 100);
  for (const [key, value] of weekEntries) {
    const number = Number(key);
    if (value === true && Number.isInteger(number) && number >= 1 && number <= 100) {
      completedWeeks[String(number)] = true;
    }
  }

  const opened = {};
  const openedEntries = Object.entries(input.opened || {}).slice(0, 2000);
  for (const [key, resource] of openedEntries) {
    if (!resource || typeof resource !== "object" || Array.isArray(resource) || key.length > 500) continue;
    const openedAt = new Date(resource.openedAt);
    opened[key] = {
      id: cleanText(resource.id, 200),
      title: cleanText(resource.title, 500) || "Resource",
      label: cleanText(resource.label, 500),
      kind: cleanText(resource.kind, 30) || "pdf",
      path: cleanText(resource.path, 1000),
      url: cleanText(resource.url, 2000),
      category: cleanText(resource.category, 200),
      pages: Number.isFinite(Number(resource.pages)) ? Math.max(0, Math.floor(Number(resource.pages))) : 0,
      bytes: Number.isFinite(Number(resource.bytes)) ? Math.max(0, Math.floor(Number(resource.bytes))) : 0,
      lastPage: Number.isFinite(Number(resource.lastPage)) ? Math.max(0, Math.floor(Number(resource.lastPage))) : 0,
      lastHeading: cleanText(resource.lastHeading, 500),
      targetUrl: cleanText(resource.targetUrl, 2000),
      openedAt: Number.isNaN(openedAt.getTime()) ? new Date().toISOString() : openedAt.toISOString(),
    };
  }

  const requestedUpdatedAt = new Date(input.updatedAt);
  return {
    version: 1,
    completed,
    completedWeeks,
    opened,
    updatedAt: Number.isNaN(requestedUpdatedAt.getTime()) ? new Date().toISOString() : requestedUpdatedAt.toISOString(),
  };
}

async function progressApi(request, env) {
  if (request.method === "GET") {
    const row = await env.PROGRESS_DB.prepare(
      "SELECT payload, updated_at FROM progress_state WHERE id = ?"
    ).bind(1).first();
    if (!row) {
      return jsonResponse({ version: 1, completed: {}, completedWeeks: {}, opened: {}, updatedAt: "" });
    }
    try {
      const payload = JSON.parse(row.payload);
      payload.updatedAt = row.updated_at || payload.updatedAt || "";
      return jsonResponse(payload);
    } catch {
      return jsonResponse({ error: "Stored progress is invalid" }, 500);
    }
  }

  if (request.method === "PUT") {
    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 512_000) return jsonResponse({ error: "Progress payload is too large" }, 413);
    let body;
    try {
      const text = await request.text();
      if (text.length > 512_000) return jsonResponse({ error: "Progress payload is too large" }, 413);
      body = JSON.parse(text);
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    let progress;
    try {
      progress = normalizeProgress(body);
    } catch (error) {
      return jsonResponse({ error: error.message }, 400);
    }
    await env.PROGRESS_DB.prepare(
      "INSERT INTO progress_state (id, payload, updated_at) VALUES (?, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at"
    ).bind(1, JSON.stringify(progress), progress.updatedAt).run();
    return jsonResponse({ ok: true, updatedAt: progress.updatedAt });
  }

  return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, PUT" } });
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
    const url = new URL(request.url);
    try {
      if (!(await isAuthorized(request, env))) return unauthorized();
      if (url.pathname.startsWith("/files/")) return servePdf(request, env);
      if (url.pathname === "/api/library") return serveAsset("/library-index.json", request, env);
      if (url.pathname === "/api/study-path") return serveAsset("/study-path.json", request, env);
      if (url.pathname === "/api/progress") return progressApi(request, env);
      if (url.pathname.startsWith("/notes/")) {
        const name = url.pathname.slice("/notes/".length);
        if (name.includes("..") || name.includes("/") || !NOTE_NAMES.has(name)) {
          return new Response("Not found", { status: 404 });
        }
        return serveAsset(`/notes/${name}`, request, env);
      }
      if (!STATIC_PATHS.has(url.pathname)) return new Response("Not found", { status: 404 });
      return serveAsset(url.pathname, request, env);
    } catch (error) {
      console.error(JSON.stringify({
        message: "request failed",
        path: url.pathname,
        error: error instanceof Error ? error.message : String(error),
      }));
      return url.pathname.startsWith("/api/")
        ? jsonResponse({ error: "Internal server error" }, 500)
        : new Response("Internal server error", { status: 500 });
    }
  },
};
