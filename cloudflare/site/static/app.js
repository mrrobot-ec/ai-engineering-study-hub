const state = {
  items: [],
  studyPath: null,
  current: null,
  query: "",
  category: "all",
  sort: "title",
  view: "dashboard-view",
  completed: JSON.parse(localStorage.getItem("ai-study-hub-resources-v1") || "{}"),
  completedWeeks: JSON.parse(localStorage.getItem("ai-study-hub-weeks-v1") || "{}")
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

function saveProgress() {
  localStorage.setItem("ai-study-hub-resources-v1", JSON.stringify(state.completed));
  localStorage.setItem("ai-study-hub-weeks-v1", JSON.stringify(state.completedWeeks));
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

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KiB", "MiB", "GiB"];
  let amount = bytes;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
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

function renderDashboard() {
  const weeks = state.studyPath ? state.studyPath.weeks : [];
  const completeWeeks = weeks.filter((week) => state.completedWeeks[String(week.week)]).length;
  const completeResources = Object.keys(state.completed).length;
  $("#total-pdfs").textContent = state.items.length || "—";
  $("#read-count").textContent = completeResources;
  $("#read-percent").textContent = state.items.length ? `${Math.round((completeResources / state.items.length) * 100)}% of PDFs marked` : "Start with one";
  $("#path-progress-fill").style.width = `${weeks.length ? (completeWeeks / weeks.length) * 100 : 0}%`;
  $("#path-progress-label").textContent = `${completeWeeks} / ${weeks.length || 16} weeks`;

  const next = weeks.find((week) => !state.completedWeeks[String(week.week)]) || weeks[weeks.length - 1];
  if (!next) return;
  $("#current-week").textContent = next.week;
  $("#current-week-title").textContent = next.title;
  $("#next-week-heading").textContent = `Week ${next.week} · ${next.title}`;
  $("#next-week-card").innerHTML = `<div><div class="eyebrow">${escapeHtml(next.time)}</div><h3>${escapeHtml(next.goal)}</h3><p>${escapeHtml(next.deliverable)}</p></div><div class="next-meta"><strong>${next.resources.length}</strong> focused resources</div>`;
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
    return `<article class="week-card ${weekDone ? "complete" : ""}">
      <div class="week-number">W${String(week.week).padStart(2, "0")}</div>
      <div><h3>${escapeHtml(week.title)}</h3><p>${escapeHtml(week.goal)}</p></div>
      <div class="week-deliverable"><label>Deliverable · ${escapeHtml(week.time)}</label><p>${escapeHtml(week.deliverable)}</p></div>
      <div class="week-actions">${resources}<label class="week-check"><input type="checkbox" data-week="${week.week}" ${weekDone ? "checked" : ""}/> week complete</label></div>
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
    return `<div class="resource-item ${selected ? "selected" : ""}" data-pdf='${escapeHtml(JSON.stringify(item))}'>
      <div class="resource-item-title">${escapeHtml(item.title)}</div>
      <div class="resource-item-meta"><span>${escapeHtml(item.category)} · ${item.pages || "?"} pp</span><span>${done ? '<span class="done-mark">✓ done</span>' : formatBytes(item.bytes)}</span></div>
    </div>`;
  }).join("");
  container.querySelectorAll("[data-pdf]").forEach((node) => node.addEventListener("click", () => selectResource(JSON.parse(node.dataset.pdf))));
}

function selectResource(resource) {
  state.current = resource;
  showView("library-view");
  $("#reader-title").textContent = resource.title || resource.label || "Resource";
  $("#open-new-tab").disabled = false;
  $("#mark-complete").disabled = false;
  $("#mark-complete").textContent = isComplete(resource) ? "Completed ✓" : "Mark complete";
  const body = $("#reader-body");
  let url = "";
  if (resource.kind === "external") {
    url = resource.url;
    body.innerHTML = `<div class="reader-empty"><div class="reader-icon">↗</div><h2>Official web reference</h2><p>This resource lives on its official site. Open it in a new tab while keeping the Study Hub available.</p><a class="primary-button" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open reference ↗</a></div>`;
  } else if (resource.kind === "code") {
    url = CODE_URLS[resource.path] || "https://github.com";
    body.innerHTML = `<div class="reader-empty"><div class="reader-icon">⌘</div><h2>Official source repository</h2><p>Use the pinned local clone for source reading, or open its canonical repository.</p><a class="primary-button" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open repository ↗</a></div>`;
  } else if (resource.kind === "note") {
    url = noteUrl(resource.path);
    body.innerHTML = `<iframe class="note-reader" title="${escapeHtml(resource.label || resource.path)}" src="${url}"></iframe>`;
  } else {
    url = pdfUrl(resource.path);
    body.innerHTML = `<iframe title="${escapeHtml(resource.title || resource.path)}" src="${url}#page=1"></iframe>`;
  }
  $("#open-new-tab").onclick = () => window.open(url, "_blank", "noopener");
  renderLibrary();
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
  state.items = (await libraryResponse.json()).items;
  state.studyPath = await pathResponse.json();
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
    if (!window.confirm("Clear all local Study Hub progress?")) return;
    state.completed = {};
    state.completedWeeks = {};
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
  $("#total-pdfs").textContent = "!";
  $("#resource-list").innerHTML = '<div class="empty-list">Could not load the local index. Check that Study Hub is running from the library directory.</div>';
});
