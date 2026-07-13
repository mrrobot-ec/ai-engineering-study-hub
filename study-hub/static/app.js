const LOCAL_KEYS = {
  resources: "ai-study-hub-resources-v1",
  weeks: "ai-study-hub-weeks-v1",
  opened: "ai-study-hub-opened-v1",
  updatedAt: "ai-study-hub-progress-updated-v1"
};

function readLocalJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch { return {}; }
}

const state = {
  items: [],
  studyPath: null,
  current: null,
  currentOpenAction: null,
  query: "",
  category: "all",
  sort: "title",
  view: "dashboard-view",
  completed: readLocalJson(LOCAL_KEYS.resources),
  completedWeeks: readLocalJson(LOCAL_KEYS.weeks),
  opened: readLocalJson(LOCAL_KEYS.opened),
  progressUpdatedAt: localStorage.getItem(LOCAL_KEYS.updatedAt) || "",
  progressMode: "loading",
  syncTimer: null
};

const CODE_URLS = {
  "framework-code/langgraph": "https://github.com/langchain-ai/langgraph",
  "framework-code/google-adk-python": "https://github.com/google/adk-python",
  "framework-code/pydantic-ai": "https://github.com/pydantic/pydantic-ai",
  "framework-code/langchain": "https://github.com/langchain-ai/langchain"
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value || "").replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  }[char]));
}

function resourceKey(resource) {
  return `${resource.kind || "pdf"}:${resource.path || resource.url || resource.id}`;
}

function isComplete(resource) {
  return Boolean(state.completed[resourceKey(resource)]);
}

function isOpened(resource) {
  return Boolean(state.opened[resourceKey(resource)]);
}

function setSyncStatus(label, mode) {
  const element = $("#sync-status");
  if (!element) return;
  element.className = `sync-pill ${mode || ""}`.trim();
  element.innerHTML = `<span></span>${escapeHtml(label)}`;
}

function persistLocalProgress() {
  localStorage.setItem(LOCAL_KEYS.resources, JSON.stringify(state.completed));
  localStorage.setItem(LOCAL_KEYS.weeks, JSON.stringify(state.completedWeeks));
  localStorage.setItem(LOCAL_KEYS.opened, JSON.stringify(state.opened));
  localStorage.setItem(LOCAL_KEYS.updatedAt, state.progressUpdatedAt);
}

function progressSnapshot() {
  return {
    version: 1,
    completed: state.completed,
    completedWeeks: state.completedWeeks,
    opened: state.opened,
    updatedAt: state.progressUpdatedAt || new Date().toISOString()
  };
}

async function pushProgress() {
  if (state.progressMode === "local") return;
  setSyncStatus("Saving…", "saving");
  try {
    const response = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progressSnapshot())
    });
    if (response.status === 404) {
      state.progressMode = "local";
      setSyncStatus("Saved on this device", "local");
      return;
    }
    if (!response.ok) throw new Error(`Progress save failed: ${response.status}`);
    state.progressMode = "cloud";
    setSyncStatus("Cloud synced", "synced");
  } catch (error) {
    console.error(error);
    setSyncStatus("Saved locally · sync retry later", "error");
  }
}

function scheduleProgressSync() {
  window.clearTimeout(state.syncTimer);
  state.syncTimer = window.setTimeout(pushProgress, 350);
}

function saveProgress() {
  state.progressUpdatedAt = new Date().toISOString();
  persistLocalProgress();
  scheduleProgressSync();
}

function applyRemoteProgress(progress) {
  state.completed = progress.completed || {};
  state.completedWeeks = progress.completedWeeks || {};
  state.opened = progress.opened || {};
  state.progressUpdatedAt = progress.updatedAt || "";
  persistLocalProgress();
}

async function loadCloudProgress() {
  try {
    const response = await fetch("/api/progress");
    if (response.status === 404) {
      state.progressMode = "local";
      setSyncStatus("Saved on this device", "local");
      return;
    }
    if (!response.ok) throw new Error(`Progress load failed: ${response.status}`);
    const remote = await response.json();
    const hasLocal = Object.keys(state.completed).length || Object.keys(state.completedWeeks).length || Object.keys(state.opened).length;
    if (remote.updatedAt && (!state.progressUpdatedAt || remote.updatedAt >= state.progressUpdatedAt)) {
      applyRemoteProgress(remote);
    } else if (hasLocal) {
      state.progressMode = "cloud";
      await pushProgress();
    }
    state.progressMode = "cloud";
    setSyncStatus("Cloud synced", "synced");
  } catch (error) {
    console.error(error);
    state.progressMode = "cloud";
    setSyncStatus("Saved locally · sync retry later", "error");
  }
}

function toggleResource(resource) {
  const key = resourceKey(resource);
  state.completed[key] = !state.completed[key];
  if (!state.completed[key]) delete state.completed[key];
  saveProgress();
  renderAll();
}

function toggleWeek(number) {
  const key = String(number);
  state.completedWeeks[key] = !state.completedWeeks[key];
  if (!state.completedWeeks[key]) delete state.completedWeeks[key];
  saveProgress();
  renderAll();
}

function recordOpened(resource) {
  const key = resourceKey(resource);
  state.opened[key] = {
    id: resource.id || "",
    title: resource.title || resource.label || resource.path || "Resource",
    label: resource.label || "",
    kind: resource.kind || "pdf",
    path: resource.path || "",
    url: resource.url || "",
    category: resource.category || "",
    pages: resource.pages || 0,
    bytes: resource.bytes || 0,
    openedAt: new Date().toISOString()
  };
  saveProgress();
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KiB", "MiB", "GiB"];
  let amount = bytes;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function formatRecentDate(value) {
  if (!value) return "opened";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "opened";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function pdfUrl(path) {
  return "/files/" + path.split("/").map(encodeURIComponent).join("/");
}

function noteUrl(path) {
  return "/notes/" + path.split("/").map(encodeURIComponent).join("/");
}

function showView(viewId) {
  state.view = viewId;
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("hidden", view.id !== viewId));
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  if (viewId === "library-view") renderLibrary();
  if (viewId === "path-view") renderPath();
}

function renderRecentReading() {
  const container = $("#recent-reading");
  const entries = Object.entries(state.opened)
    .sort((left, right) => String(right[1].openedAt).localeCompare(String(left[1].openedAt)))
    .slice(0, 4);
  if (!entries.length) {
    container.innerHTML = '<div class="recent-empty">Open a book, paper, or note and it will appear here.</div>';
    return;
  }
  container.innerHTML = entries.map(([key, resource]) => `
    <button class="recent-card" data-recent="${escapeHtml(key)}">
      <span class="recent-kind">${escapeHtml(resource.kind || "pdf")}</span>
      <strong>${escapeHtml(resource.title)}</strong>
      <span>${escapeHtml(formatRecentDate(resource.openedAt))}${state.completed[key] ? " · ✓ complete" : ""}</span>
    </button>`).join("");
  container.querySelectorAll("[data-recent]").forEach((button) => {
    button.addEventListener("click", () => selectResource(state.opened[button.dataset.recent]));
  });
}

function renderDashboard() {
  const weeks = state.studyPath ? state.studyPath.weeks : [];
  const completeWeeks = weeks.filter((week) => state.completedWeeks[String(week.week)]).length;
  const completeResources = Object.keys(state.completed).length;
  const openedResources = Object.keys(state.opened).length;
  $("#total-pdfs").textContent = state.items.length || "—";
  $("#read-count").textContent = completeResources;
  $("#read-percent").textContent = `${openedResources} opened across books, papers, and notes`;
  $("#path-progress-fill").style.width = `${weeks.length ? (completeWeeks / weeks.length) * 100 : 0}%`;
  $("#path-progress-label").textContent = `${completeWeeks} / ${weeks.length || 16} weeks`;
  renderRecentReading();

  const next = weeks.find((week) => !state.completedWeeks[String(week.week)]) || weeks[weeks.length - 1];
  if (!next) return;
  $("#current-week").textContent = next.week;
  $("#current-week-title").textContent = next.title;
  $("#next-week-heading").textContent = `Week ${next.week} · ${next.title}`;
  const project = next.project || { title: next.goal, summary: next.deliverable };
  $("#next-week-card").innerHTML = `<div><div class="eyebrow">${escapeHtml(next.time)} · PROJECT</div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p></div><div class="next-meta"><strong>${next.resources.length}</strong> focused resources<span>${escapeHtml(next.deliverable)}</span></div>`;
}

function renderPath() {
  const weeks = state.studyPath ? state.studyPath.weeks : [];
  const container = $("#week-list");
  if (!weeks.length) { container.innerHTML = '<div class="loading">Loading path…</div>'; return; }
  container.innerHTML = weeks.map((week) => {
    const weekDone = Boolean(state.completedWeeks[String(week.week)]);
    const resources = week.resources.map((resource) => {
      const done = isComplete(resource);
      const action = `data-resource='${escapeHtml(JSON.stringify(resource))}'`;
      return `<button class="resource-chip ${done ? "done" : ""}" ${action}>${done ? "✓ " : ""}${escapeHtml(resource.label)}</button>`;
    }).join("");
    const project = week.project || { title: week.title, summary: week.deliverable, acceptance: [] };
    const acceptance = (project.acceptance || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `<article class="week-card ${weekDone ? "complete" : ""}">
      <div class="week-number">W${String(week.week).padStart(2, "0")}</div>
      <div><h3>${escapeHtml(week.title)}</h3><p>${escapeHtml(week.goal)}</p></div>
      <div class="week-deliverable"><label>Deliverable · ${escapeHtml(week.time)}</label><p>${escapeHtml(week.deliverable)}</p></div>
      <div class="week-project"><div><label>Build project</label><h4>${escapeHtml(project.title)}</h4><p>${escapeHtml(project.summary)}</p></div>${acceptance ? `<ul>${acceptance}</ul>` : ""}</div>
      <div class="week-actions">${resources}<label class="week-check"><input type="checkbox" data-week="${week.week}" ${weekDone ? "checked" : ""}/> project complete</label></div>
    </article>`;
  }).join("");
  container.querySelectorAll("[data-resource]").forEach((button) => {
    button.addEventListener("click", () => selectResource(JSON.parse(button.dataset.resource)));
  });
  container.querySelectorAll("[data-week]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleWeek(checkbox.dataset.week));
  });
}

function renderLibrary() {
  const container = $("#resource-list");
  const query = state.query.toLowerCase().trim();
  const filtered = state.items.filter((item) => {
    const haystack = `${item.title} ${item.path} ${item.category}`.toLowerCase();
    return (state.category === "all" || item.category === state.category) && (!query || haystack.includes(query));
  }).sort((left, right) => {
    if (state.sort === "pages") return (right.pages || 0) - (left.pages || 0);
    if (state.sort === "year") return String(right.year).localeCompare(String(left.year));
    return left.title.localeCompare(right.title);
  });
  if (!filtered.length) { container.innerHTML = '<div class="empty-list">No matching resources.</div>'; return; }
  container.innerHTML = filtered.map((item) => {
    const selected = state.current && state.current.path === item.path;
    const done = isComplete(item);
    const opened = isOpened(item);
    const status = done ? '<span class="done-mark">✓ complete</span>' : opened ? '<span class="opened-mark">opened</span>' : formatBytes(item.bytes);
    return `<div class="resource-item ${selected ? "selected" : ""}" data-pdf='${escapeHtml(JSON.stringify(item))}'>
      <div class="resource-item-title">${escapeHtml(item.title)}</div>
      <div class="resource-item-meta"><span>${escapeHtml(item.category)} · ${item.pages || "?"} pp</span><span>${status}</span></div>
    </div>`;
  }).join("");
  container.querySelectorAll("[data-pdf]").forEach((node) => node.addEventListener("click", () => selectResource(JSON.parse(node.dataset.pdf))));
}

function renderMarkdown(markdown) {
  if (!window.marked || typeof window.marked.parse !== "function") {
    return `<pre>${escapeHtml(markdown)}</pre>`;
  }
  return window.marked.parse(markdown, { gfm: true, breaks: false });
}

function markdownDocument(title, rendered) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/static/styles.css"></head><body class="standalone-note"><article class="markdown-reader">${rendered}</article></body></html>`;
}

async function selectResource(resource) {
  state.current = resource;
  recordOpened(resource);
  showView("library-view");
  $("#reader-title").textContent = resource.title || resource.label || "Resource";
  $("#open-new-tab").disabled = false;
  $("#mark-complete").disabled = false;
  $("#mark-complete").textContent = isComplete(resource) ? "Completed ✓" : "Mark complete";
  const body = $("#reader-body");
  let url = "";
  state.currentOpenAction = null;
  if (resource.kind === "external") {
    url = resource.url;
    body.innerHTML = `<div class="reader-empty"><div class="reader-icon">↗</div><h2>Official web reference</h2><p>This resource lives on its official site. Open it in a new tab while keeping the Study Hub available.</p><a class="primary-button" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open reference ↗</a></div>`;
    state.currentOpenAction = () => window.open(url, "_blank", "noopener");
  } else if (resource.kind === "code") {
    url = CODE_URLS[resource.path] || "https://github.com";
    body.innerHTML = `<div class="reader-empty"><div class="reader-icon">⌘</div><h2>Official source repository</h2><p>Use the pinned local clone for source reading, or open its canonical repository.</p><a class="primary-button" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open repository ↗</a></div>`;
    state.currentOpenAction = () => window.open(url, "_blank", "noopener");
  } else if (resource.kind === "note") {
    url = noteUrl(resource.path);
    body.innerHTML = '<div class="reader-empty note-loading"><div class="reader-icon">M↓</div><h2>Rendering note…</h2></div>';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Note load failed: ${response.status}`);
      const rendered = renderMarkdown(await response.text());
      body.innerHTML = `<article class="markdown-reader">${rendered}</article>`;
      body.querySelectorAll("a").forEach((link) => { link.target = "_blank"; link.rel = "noopener"; });
      const title = resource.label || resource.path;
      state.currentOpenAction = () => {
        const blob = new Blob([markdownDocument(title, rendered)], { type: "text/html" });
        window.open(URL.createObjectURL(blob), "_blank", "noopener");
      };
    } catch (error) {
      console.error(error);
      body.innerHTML = '<div class="reader-empty"><div class="reader-icon">!</div><h2>Could not render this note</h2><p>Try opening it again or use the raw file in a new tab.</p></div>';
      state.currentOpenAction = () => window.open(url, "_blank", "noopener");
    }
  } else {
    url = pdfUrl(resource.path);
    body.innerHTML = `<iframe title="${escapeHtml(resource.title || resource.path)}" src="${url}#page=1"></iframe>`;
    state.currentOpenAction = () => window.open(url, "_blank", "noopener");
  }
  $("#open-new-tab").onclick = () => state.currentOpenAction?.();
  renderAll();
}

function populateCategories() {
  const select = $("#category-filter");
  [...new Set(state.items.map((item) => item.category))].sort().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function renderAll() {
  renderDashboard();
  renderPath();
  if (state.view === "library-view") renderLibrary();
  if (state.current) {
    $("#mark-complete").textContent = isComplete(state.current) ? "Completed ✓" : "Mark complete";
  }
}

async function init() {
  const [libraryResponse, pathResponse] = await Promise.all([fetch("/api/library"), fetch("/api/study-path")]);
  if (!libraryResponse.ok || !pathResponse.ok) throw new Error("Could not load the library index or learning path");
  state.items = (await libraryResponse.json()).items;
  state.studyPath = await pathResponse.json();
  await loadCloudProgress();
  populateCategories();
  renderAll();

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  document.querySelectorAll("[data-view-target]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.viewTarget)));
  $("#resume-button").addEventListener("click", () => showView("path-view"));
  $("#library-search").addEventListener("input", (event) => { state.query = event.target.value; renderLibrary(); });
  $("#category-filter").addEventListener("change", (event) => { state.category = event.target.value; renderLibrary(); });
  $("#sort-filter").addEventListener("change", (event) => { state.sort = event.target.value; renderLibrary(); });
  $("#mark-complete").addEventListener("click", () => { if (state.current) toggleResource(state.current); });
  $("#reset-progress").addEventListener("click", () => {
    if (!window.confirm("Clear all cloud-synced reading history and completion progress?")) return;
    state.completed = {};
    state.completedWeeks = {};
    state.opened = {};
    saveProgress();
    renderAll();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      showView("library-view");
      $("#library-search").focus();
    }
  });
}

init().catch((error) => {
  console.error(error);
  setSyncStatus("Could not connect", "error");
  $("#total-pdfs").textContent = "!";
  $("#resource-list").innerHTML = '<div class="empty-list">Could not load the private library. Refresh and sign in again.</div>';
});
