const LOCAL_KEYS = {
  resources: "ai-study-hub-resources-v1",
  weeks: "ai-study-hub-weeks-v1",
  opened: "ai-study-hub-opened-v1",
  assignments: "ai-study-hub-assignments-v2",
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
  assignmentProgress: readLocalJson(LOCAL_KEYS.assignments),
  activeAssignmentId: "",
  studioAssignmentId: "",
  pendingNextAssignmentId: "",
  pageIndex: null,
  pageIndexPromise: null,
  searchStatus: "idle",
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

function resourceKeys(resource) {
  return state.studyPath?.documentKeys?.[resourceKey(resource)] || [];
}

function assignmentKey(week, resource) {
  return `week:${week.week}|${resourceKey(resource)}`;
}

function masteryLevels() {
  return state.studyPath?.learningModel?.masteryLevels || [
    { level: 0, label: "Not started", shortLabel: "Not started" },
    { level: 1, label: "Read it", shortLabel: "Read" },
    { level: 2, label: "Understand it", shortLabel: "Understand" },
    { level: 3, label: "Can explain it", shortLabel: "Explain" },
    { level: 4, label: "Can implement it", shortLabel: "Implement" },
    { level: 5, label: "Can debug it", shortLabel: "Debug" }
  ];
}

function masteryInfo(level) {
  return masteryLevels().find((item) => item.level === Number(level)) || masteryLevels()[0];
}

function assignmentSegments(resource) {
  const keys = resourceKeys(resource);
  const indexes = Array.isArray(resource.assignedKeys) ? resource.assignedKeys : keys.map((_, index) => index);
  return indexes.map((index) => keys[index]).filter(Boolean);
}

function buildAssignment(week, resource) {
  const role = resourceRole(resource);
  const model = state.studyPath?.learningModel || {};
  const required = (model.requiredRoles || ["start", "build"]).includes(role);
  return {
    id: assignmentKey(week, resource),
    week: week.week,
    weekTitle: week.title,
    questions: state.studyPath?.weekQuestions?.[String(week.week)] || [],
    resource,
    segments: assignmentSegments(resource),
    required,
    minutes: model.estimatedMinutesByRole?.[role] || 30,
    role,
    why: week.goal
  };
}

function allAssignments() {
  return (state.studyPath?.weeks || []).flatMap((week) => week.resources.map((resource) => buildAssignment(week, resource)));
}

function assignmentProgress(assignment) {
  return state.assignmentProgress[assignment.id] || {
    evidenceVersion: 1,
    level: 0,
    reviewStep: 0,
    nextReviewAt: "",
    reviewedAt: [],
    checkpointStatus: "",
    checkpointAnswers: [],
    failedPrompts: [],
    teachBack: "",
    faultReflection: "",
    faultTested: false
  };
}

function wordCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function assignmentWeek(assignment) {
  return (state.studyPath?.weeks || []).find((week) => Number(week.week) === Number(assignment.week)) || null;
}

function lessonCheckpointQuestions(assignment) {
  const week = assignmentWeek(assignment);
  const assignmentsInWeek = (week?.resources || []).map((resource) => buildAssignment(week, resource));
  const lessonIndex = Math.max(0, assignmentsInWeek.findIndex((candidate) => candidate.id === assignment.id));
  const weekQuestions = assignment.questions || [];
  const sectionNames = assignment.segments.map((segment) => segment.label).join(", ") || assignmentLabel(assignment);
  const acceptance = week?.project?.acceptance || [];
  return [
    {
      id: "mechanism",
      prompt: `Without reopening the source, explain the core mechanism in “${sectionNames}”. What state or information moves, and why?`,
      guide: `Look for a mechanism, its inputs and outputs, and an explicit connection to: ${assignment.why}`
    },
    {
      id: "week-question",
      prompt: weekQuestions[lessonIndex % Math.max(1, weekQuestions.length)] || `What assumption in ${assignmentLabel(assignment)} is easiest to violate?`,
      guide: `A strong answer names an assumption, a boundary where it can fail, and observable evidence—not only a definition.`
    },
    {
      id: "apply",
      prompt: `How should this lesson change one decision in the “${week?.project?.title || assignment.weekTitle}” project? Name one failure it should prevent.`,
      guide: acceptance.length ? `Connect the answer to at least one project test: ${acceptance.join("; ")}` : `Name the design decision, the failure, and the measurement that would expose it.`
    }
  ];
}

function derivedEvidenceLevel(assignment, progress = assignmentProgress(assignment)) {
  const read = Boolean(progress.readAt) || Number(progress.level || 0) >= 1;
  if (!read) return 0;
  if (progress.checkpointStatus !== "passed") return 1;
  if (wordCount(progress.teachBack) < 60) return 2;
  if (!state.completedWeeks[String(assignment.week)]) return 3;
  if (!progress.faultTested || wordCount(progress.faultReflection) < 40) return 4;
  return 5;
}

function refreshEvidenceLevels() {
  let changed = false;
  for (const assignment of allAssignments()) {
    const progress = state.assignmentProgress[assignment.id];
    if (!progress) continue;
    const level = derivedEvidenceLevel(assignment, progress);
    if (Number(progress.level || 0) !== level) {
      progress.level = level;
      progress.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  return changed;
}

function isAssignmentRead(assignment) {
  return Number(assignmentProgress(assignment).level || 0) >= 1;
}

function isReviewDue(progress, now = new Date()) {
  if (!progress?.nextReviewAt) return false;
  const due = new Date(progress.nextReviewAt);
  return !Number.isNaN(due.getTime()) && due <= now;
}

function scheduledAssignments() {
  return allAssignments().map((assignment) => ({ assignment, progress: assignmentProgress(assignment) }))
    .filter(({ progress }) => progress.nextReviewAt)
    .sort((left, right) => String(left.progress.nextReviewAt).localeCompare(String(right.progress.nextReviewAt)));
}

function dueAssignments() {
  return scheduledAssignments().filter(({ progress }) => isReviewDue(progress));
}

function resourceRole(resource) {
  if (resource.role) return resource.role;
  for (const week of state.studyPath?.weeks || []) {
    const match = week.resources.find((candidate) => resourceKey(candidate) === resourceKey(resource));
    if (match?.role) return match.role;
  }
  return "";
}

function roleInfo(resource) {
  const role = resourceRole(resource);
  return { role, ...(state.studyPath?.readingRoles?.[role] || {}) };
}

function slugifyHeading(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

function keyMarker(key) {
  if (key.page) return key.endPage && key.endPage !== key.page ? `p.${key.page}–${key.endPage}` : `p.${key.page}`;
  if (key.heading) return "§";
  return "↗";
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
  localStorage.setItem(LOCAL_KEYS.assignments, JSON.stringify(state.assignmentProgress));
  localStorage.setItem(LOCAL_KEYS.updatedAt, state.progressUpdatedAt);
}

function progressSnapshot() {
  return {
    version: 3,
    completed: state.completed,
    completedWeeks: state.completedWeeks,
    opened: state.opened,
    assignments: state.assignmentProgress,
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
  state.assignmentProgress = progress.assignments || {};
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
    const hasLocal = Object.keys(state.completed).length || Object.keys(state.completedWeeks).length || Object.keys(state.opened).length || Object.keys(state.assignmentProgress).length;
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
  refreshEvidenceLevels();
  saveProgress();
  renderAll();
}

function scheduleReview(progress, step = 0) {
  const intervals = state.studyPath?.learningModel?.reviewIntervalsDays || [1, 3, 7, 21];
  if (step >= intervals.length) return "";
  const date = new Date();
  date.setDate(date.getDate() + intervals[step]);
  return date.toISOString();
}

function markAssignmentRead(assignmentId) {
  const assignment = allAssignments().find((candidate) => candidate.id === assignmentId);
  if (!assignment) return;
  const previous = state.assignmentProgress[assignmentId] || {};
  state.assignmentProgress[assignmentId] = {
    evidenceVersion: 1,
    ...previous,
    readAt: previous.readAt || new Date().toISOString(),
    reviewStep: Number(previous.reviewStep || 0),
    nextReviewAt: previous.nextReviewAt || scheduleReview({}, 0),
    reviewedAt: Array.isArray(previous.reviewedAt) ? previous.reviewedAt : [],
    updatedAt: new Date().toISOString()
  };
  state.assignmentProgress[assignmentId].level = derivedEvidenceLevel(assignment, state.assignmentProgress[assignmentId]);
  saveProgress();
  renderAll();
}

function completeAssignmentReview(assignmentId) {
  const previous = state.assignmentProgress[assignmentId];
  if (!previous) return;
  const now = new Date().toISOString();
  const nextStep = Math.max(0, Number(previous.reviewStep || 0)) + 1;
  state.assignmentProgress[assignmentId] = {
    ...previous,
    reviewStep: nextStep,
    nextReviewAt: scheduleReview(previous, nextStep),
    reviewedAt: [...(Array.isArray(previous.reviewedAt) ? previous.reviewedAt : []), now].slice(-20),
    updatedAt: now
  };
  saveProgress();
  renderAll();
}

function migrateLegacyProgress() {
  let migrated = false;
  for (const assignment of allAssignments()) {
    const progress = state.assignmentProgress[assignment.id];
    if (!progress || Number(progress.evidenceVersion || 0) >= 1) continue;
    state.assignmentProgress[assignment.id] = {
      ...progress,
      evidenceVersion: 1,
      readAt: Number(progress.level || 0) >= 1 ? (progress.updatedAt || new Date().toISOString()) : "",
      checkpointStatus: "",
      checkpointAnswers: [],
      failedPrompts: [],
      teachBack: "",
      faultReflection: "",
      faultTested: false,
      level: Number(progress.level || 0) >= 1 ? 1 : 0,
      updatedAt: new Date().toISOString()
    };
    migrated = true;
  }
  if (Object.keys(state.assignmentProgress).length || !Object.keys(state.completed).length) return migrated;
  for (const assignment of allAssignments()) {
    if (!state.completed[resourceKey(assignment.resource)]) continue;
    state.assignmentProgress[assignment.id] = {
      evidenceVersion: 1,
      level: 1,
      readAt: new Date().toISOString(),
      reviewStep: 0,
      nextReviewAt: scheduleReview({}, 0),
      reviewedAt: [],
      checkpointStatus: "",
      checkpointAnswers: [],
      failedPrompts: [],
      teachBack: "",
      faultReflection: "",
      faultTested: false,
      updatedAt: new Date().toISOString()
    };
    migrated = true;
  }
  return migrated;
}

function recordOpened(resource, target = {}) {
  const key = resourceKey(resource);
  const previous = state.opened[key] || {};
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
    lastPage: target.page || previous.lastPage || 0,
    lastHeading: target.heading || previous.lastHeading || "",
    targetUrl: target.url || previous.targetUrl || "",
    assignmentId: target.assignmentId || previous.assignmentId || "",
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

function formatDueDate(value) {
  if (!value) return "review cycle complete";
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) return "unscheduled";
  const today = new Date();
  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return "due now";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

function firstAssignmentTarget(assignment) {
  const first = assignment.segments[0] || {};
  return {
    page: first.page || 0,
    heading: first.heading || "",
    url: first.url || "",
    assignmentId: assignment.id
  };
}

function assignmentLocation(assignment) {
  if (!assignment.segments.length) return "Use as needed while building";
  return assignment.segments.map((segment) => keyMarker(segment)).join(" · ");
}

function assignmentRequirement(assignment) {
  return assignment.required ? "Required" : "Optional";
}

function masteryOptions(selectedLevel) {
  return masteryLevels().map((item) => `<option value="${item.level}" ${Number(selectedLevel) === item.level ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
}

function openAssignment(assignment) {
  state.activeAssignmentId = assignment.id;
  selectResource(assignment.resource, firstAssignmentTarget(assignment));
}

function assignmentLabel(assignment) {
  return assignment?.resource?.label || assignment?.resource?.title || "Lesson";
}

function evidenceLadderMarkup(level) {
  const requirements = ["Start", "Read", "Recall", "Explain", "Build", "Debug"];
  return requirements.map((label, index) => `<span class="${index <= level ? "reached" : ""} ${index === level ? "current" : ""}"><b>${index}</b>${label}</span>`).join("");
}

function studioAssignment() {
  return allAssignments().find((assignment) => assignment.id === state.studioAssignmentId) || null;
}

function closeUnderstandingStudio() {
  $("#understanding-studio").classList.add("hidden");
  state.studioAssignmentId = "";
  state.pendingNextAssignmentId = "";
}

function updateStudioCounters() {
  $("#teach-back-count").textContent = `${wordCount($("#teach-back").value)} words`;
  $("#fault-count").textContent = `${wordCount($("#fault-reflection").value)} words`;
}

function renderUnderstandingStudio() {
  const assignment = studioAssignment();
  if (!assignment) return;
  const progress = assignmentProgress(assignment);
  const questions = lessonCheckpointQuestions(assignment);
  const answers = new Map((progress.checkpointAnswers || []).map((answer) => [answer.id, answer]));
  const level = derivedEvidenceLevel(assignment, progress);
  $("#studio-week").textContent = `WEEK ${assignment.week} · EVIDENCE CHECKPOINT`;
  $("#studio-title").textContent = assignmentLabel(assignment);
  $("#studio-subtitle").textContent = `${assignmentLocation(assignment)} · answer from memory before reopening the source`;
  $("#evidence-ladder").innerHTML = evidenceLadderMarkup(level);
  $("#checkpoint-questions").innerHTML = questions.map((question, index) => {
    const answer = answers.get(question.id) || {};
    return `<article class="checkpoint-question"><label><span>Question ${index + 1}</span>${escapeHtml(question.prompt)}<textarea rows="3" maxlength="900" data-check-response="${question.id}" placeholder="Answer from memory…">${escapeHtml(answer.response || "")}</textarea></label><details><summary>Reveal the self-check guide</summary><p>${escapeHtml(question.guide)}</p></details><label class="self-assessment">My assessment<select data-check-result="${question.id}"><option value="">Choose honestly…</option><option value="passed" ${answer.result === "passed" ? "selected" : ""}>I got it</option><option value="review" ${answer.result === "review" ? "selected" : ""}>Needs review</option></select></label></article>`;
  }).join("");
  $("#teach-back").value = progress.teachBack || "";
  $("#fault-reflection").value = progress.faultReflection || "";
  $("#fault-tested").checked = Boolean(progress.faultTested);
  $("#fault-prompt").textContent = assignment.questions?.[2] || `Inject one failure related to ${assignment.weekTitle}. What invariant should survive?`;
  $("#studio-message").textContent = "";
  $("#studio-message").className = "studio-message";
  $("#skip-checkpoint").classList.toggle("hidden", !state.pendingNextAssignmentId);
  $("#continue-next").classList.add("hidden");
  updateStudioCounters();
}

function openUnderstandingStudio(assignment, pendingNext = null) {
  if (!assignment) return;
  state.studioAssignmentId = assignment.id;
  state.pendingNextAssignmentId = pendingNext?.id || "";
  renderUnderstandingStudio();
  $("#understanding-studio").classList.remove("hidden");
  window.requestAnimationFrame(() => $("#checkpoint-questions textarea")?.focus());
}

function saveStudioEvidence() {
  const assignment = studioAssignment();
  if (!assignment) return;
  const questions = lessonCheckpointQuestions(assignment);
  const answers = questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    response: $(`[data-check-response="${question.id}"]`).value.trim().slice(0, 900),
    result: $(`[data-check-result="${question.id}"]`).value
  }));
  const incomplete = answers.some((answer) => wordCount(answer.response) < 8 || !answer.result);
  if (incomplete) {
    $("#studio-message").className = "studio-message error";
    $("#studio-message").textContent = "Answer every question with at least eight words and assess it as “I got it” or “Needs review”.";
    return;
  }
  const previous = state.assignmentProgress[assignment.id] || {};
  const now = new Date().toISOString();
  const failedPrompts = answers.filter((answer) => answer.result === "review").map((answer) => answer.prompt);
  const allPassed = failedPrompts.length === 0;
  const progress = {
    ...previous,
    evidenceVersion: 1,
    readAt: previous.readAt || now,
    reviewStep: Number(previous.reviewStep || 0),
    reviewedAt: Array.isArray(previous.reviewedAt) ? previous.reviewedAt : [],
    checkpointStatus: allPassed ? "passed" : "review",
    checkpointAnswers: answers,
    failedPrompts,
    teachBack: $("#teach-back").value.trim().slice(0, 2500),
    faultReflection: $("#fault-reflection").value.trim().slice(0, 1500),
    faultTested: $("#fault-tested").checked,
    nextReviewAt: allPassed ? (previous.nextReviewAt || scheduleReview({}, 0)) : now,
    updatedAt: now
  };
  progress.level = derivedEvidenceLevel(assignment, progress);
  state.assignmentProgress[assignment.id] = progress;
  saveProgress();
  renderAll();
  renderUnderstandingStudio();
  $("#studio-message").className = `studio-message ${allPassed ? "success" : "review"}`;
  $("#studio-message").textContent = allPassed
    ? `Checkpoint passed. Evidence level: ${masteryInfo(progress.level).label}.`
    : `${failedPrompts.length} question${failedPrompts.length === 1 ? "" : "s"} added to the review queue now.`;
  $("#skip-checkpoint").classList.add("hidden");
  $("#continue-next").classList.toggle("hidden", !state.pendingNextAssignmentId);
}

function continueFromStudio() {
  const next = allAssignments().find((assignment) => assignment.id === state.pendingNextAssignmentId) || null;
  closeUnderstandingStudio();
  if (next) openAssignment(next);
}

function openMicroworld(id) {
  showView("labs-view");
  window.requestAnimationFrame(() => document.querySelector(`#lab-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function returnToLearningPath(assignment) {
  showView("path-view");
  if (!assignment) return;
  window.requestAnimationFrame(() => {
    const button = [...document.querySelectorAll("[data-open-assignment]")]
      .find((candidate) => candidate.dataset.openAssignment === assignment.id);
    button?.closest(".week-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function renderReaderNavigation(assignment = null) {
  const container = $("#reader-course-nav");
  if (!assignment) {
    container.classList.add("hidden");
    return;
  }
  const assignments = allAssignments();
  const index = assignments.findIndex((candidate) => candidate.id === assignment.id);
  if (index < 0) {
    container.classList.add("hidden");
    return;
  }
  const previous = assignments[index - 1] || null;
  const next = assignments[index + 1] || null;
  const previousButton = $("#previous-assignment");
  const nextButton = $("#next-assignment");
  container.classList.remove("hidden");
  $("#assignment-position").textContent = `Week ${assignment.week} · Lesson ${index + 1} of ${assignments.length}`;
  $("#previous-assignment-label").textContent = previous ? assignmentLabel(previous) : "Start of path";
  $("#next-assignment-label").textContent = next ? assignmentLabel(next) : "End of path";
  previousButton.disabled = !previous;
  nextButton.disabled = !next;
  previousButton.title = previous ? `Open previous lesson: ${assignmentLabel(previous)}` : "This is the first lesson";
  nextButton.title = next ? `Open next lesson: ${assignmentLabel(next)}` : "This is the final lesson";
  previousButton.onclick = previous ? () => openAssignment(previous) : null;
  nextButton.onclick = next ? () => {
    const progress = assignmentProgress(assignment);
    if (progress.checkpointStatus === "passed") openAssignment(next);
    else openUnderstandingStudio(assignment, next);
  } : null;
  $("#return-to-path").onclick = () => returnToLearningPath(assignment);
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
  if (viewId === "review-view") renderReview();
  if (viewId === "labs-view") renderMicroworlds($("#labs-index"));
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
    button.addEventListener("click", () => {
      const resource = state.opened[button.dataset.recent];
      selectResource(resource, {
        page: resource.lastPage || 0,
        heading: resource.lastHeading || "",
        url: resource.targetUrl || "",
        assignmentId: resource.assignmentId || ""
      });
    });
  });
}

function reviewCardMarkup(entry, compact = false) {
  const { assignment, progress } = entry;
  const due = isReviewDue(progress);
  const recall = progress.failedPrompts?.length ? progress.failedPrompts : assignment.questions;
  const questions = compact ? recall.slice(0, 1) : recall;
  return `<article class="review-card ${due ? "due" : "upcoming"}">
    <div class="review-card-top"><span class="review-week">W${String(assignment.week).padStart(2, "0")}</span><span class="review-due">${escapeHtml(formatDueDate(progress.nextReviewAt))}</span></div>
    <h3>${escapeHtml(assignment.resource.label || assignment.resource.title)}</h3>
    <p class="review-location">${escapeHtml(assignmentLocation(assignment))} · ${escapeHtml(masteryInfo(progress.level).label)}</p>
    ${questions.length ? `<div class="recall-prompts"><span>Recall without opening</span><ul>${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></div>` : ""}
    <div class="review-actions">
      <button class="ghost-button" data-open-studio="${escapeHtml(assignment.id)}">Retry checkpoint</button>
      <button class="ghost-button" data-open-assignment="${escapeHtml(assignment.id)}">Open assigned section</button>
      ${due ? `<button class="primary-button small" data-review-complete="${escapeHtml(assignment.id)}">I reviewed it</button>` : ""}
    </div>
  </article>`;
}

function attachReviewHandlers(container) {
  const assignments = new Map(allAssignments().map((assignment) => [assignment.id, assignment]));
  container.querySelectorAll("[data-open-assignment]").forEach((button) => {
    button.addEventListener("click", () => {
      const assignment = assignments.get(button.dataset.openAssignment);
      if (assignment) openAssignment(assignment);
    });
  });
  container.querySelectorAll("[data-review-complete]").forEach((button) => {
    button.addEventListener("click", () => completeAssignmentReview(button.dataset.reviewComplete));
  });
  container.querySelectorAll("[data-open-studio]").forEach((button) => {
    button.addEventListener("click", () => openUnderstandingStudio(assignments.get(button.dataset.openStudio)));
  });
}

function renderReviewPreview() {
  const container = $("#review-preview");
  const due = dueAssignments();
  const scheduled = scheduledAssignments();
  const entries = (due.length ? due : scheduled).slice(0, 2);
  if (!entries.length) {
    container.innerHTML = '<div class="review-empty">Set any weekly assignment to “Read it” or higher. Its first recall review will appear here tomorrow.</div>';
    return;
  }
  container.innerHTML = entries.map((entry) => reviewCardMarkup(entry, true)).join("");
  attachReviewHandlers(container);
}

function renderReview() {
  const container = $("#review-list");
  const due = dueAssignments();
  const upcoming = scheduledAssignments().filter(({ progress }) => !isReviewDue(progress));
  $("#review-summary").innerHTML = `<div><strong>${due.length}</strong><span>due now</span></div><div><strong>${upcoming.length}</strong><span>scheduled</span></div><div><strong>${Object.values(state.assignmentProgress).filter((item) => !item.nextReviewAt && Number(item.level) > 0).length}</strong><span>cycles complete</span></div>`;
  if (!due.length && !upcoming.length) {
    container.innerHTML = '<div class="review-empty large">No reviews are scheduled yet. Mark a weekly assignment as read to start its 1, 3, 7, and 21-day recall cycle.</div>';
    return;
  }
  container.innerHTML = `${due.length ? '<div class="review-group-title">Due now</div>' + due.map((entry) => reviewCardMarkup(entry)).join("") : ""}${upcoming.length ? '<div class="review-group-title">Upcoming</div>' + upcoming.map((entry) => reviewCardMarkup(entry)).join("") : ""}`;
  attachReviewHandlers(container);
}

function renderDashboard() {
  const weeks = state.studyPath ? state.studyPath.weeks : [];
  const completeWeeks = weeks.filter((week) => state.completedWeeks[String(week.week)]).length;
  const assignments = allAssignments();
  const readAssignments = assignments.filter(isAssignmentRead).length;
  const implementedAssignments = assignments.filter((assignment) => Number(assignmentProgress(assignment).level || 0) >= 4).length;
  const reviewsDue = dueAssignments().length;
  $("#total-pdfs").textContent = state.items.length || "—";
  $("#read-count").textContent = readAssignments;
  $("#read-percent").textContent = `${implementedAssignments} can implement · ${assignments.length} total`;
  $("#review-count").textContent = reviewsDue;
  $("#review-note").textContent = reviewsDue ? "Recall before opening the source" : `${scheduledAssignments().length} upcoming`;
  const reviewNavCount = $("#review-nav-count");
  reviewNavCount.textContent = reviewsDue;
  reviewNavCount.classList.toggle("hidden", reviewsDue === 0);
  $("#path-progress-fill").style.width = `${weeks.length ? (completeWeeks / weeks.length) * 100 : 0}%`;
  $("#path-progress-label").textContent = `${completeWeeks} / ${weeks.length || 16} weeks`;
  renderRecentReading();
  renderReviewPreview();

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
    const lab = typeof MICROWORLDS === "undefined" ? null : MICROWORLDS.find((candidate) => Number(candidate.week) === Number(week.week));
    const resources = week.resources.map((resource) => {
      const assignment = buildAssignment(week, resource);
      const progress = assignmentProgress(assignment);
      const done = isAssignmentRead(assignment);
      const info = roleInfo(resource);
      const segments = assignment.segments.map((segment, index) => `<button class="key-button" data-assignment-segment="${escapeHtml(assignment.id)}" data-segment-index="${index}"><span>${escapeHtml(keyMarker(segment))}</span> ${escapeHtml(segment.label)}</button>`).join("");
      return `<article class="study-resource ${done ? "done" : ""} mastery-${Number(progress.level || 0)}">
        <button class="resource-main" data-open-assignment="${escapeHtml(assignment.id)}" title="${escapeHtml(info.description || "Open assigned section")}">
          <span class="role-badge role-${escapeHtml(info.role)}">${escapeHtml(info.label || "Read")}</span>
          <strong>${escapeHtml(resource.label)}</strong>${done ? `<span class="mastery-mark">${escapeHtml(masteryInfo(progress.level).shortLabel)}</span>` : ""}
        </button>
        <div class="assignment-meta"><span>${escapeHtml(assignmentRequirement(assignment))}</span><span>${assignment.minutes} min</span><span>${escapeHtml(assignmentLocation(assignment))}</span></div>
        <p class="assignment-why">${escapeHtml(assignment.why)}</p>
        <div class="resource-key-list"><span class="key-label">Read only</span>${segments || '<span class="assignment-as-needed">Use this while building</span>'}</div>
        <button class="evidence-button" data-open-studio="${escapeHtml(assignment.id)}"><span>Evidence level</span><strong>${escapeHtml(masteryInfo(progress.level).label)}</strong><small>${progress.checkpointStatus === "review" ? "Review needed now" : "Open understanding studio"}</small></button>
      </article>`;
    }).join("");
    const project = week.project || { title: week.title, summary: week.deliverable, acceptance: [] };
    const acceptance = (project.acceptance || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const questions = state.studyPath?.weekQuestions?.[String(week.week)] || [];
    return `<article class="week-card ${weekDone ? "complete" : ""}">
      <div class="week-number">W${String(week.week).padStart(2, "0")}</div>
      <div><h3>${escapeHtml(week.title)}</h3><p>${escapeHtml(week.goal)}</p></div>
      <div class="week-deliverable"><label>Deliverable · ${escapeHtml(week.time)}</label><p>${escapeHtml(week.deliverable)}</p></div>
      ${questions.length ? `<details class="week-questions"><summary>Questions to answer before you move on</summary><ol>${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol></details>` : ""}
      <div class="week-project"><div><label>Build project</label><h4>${escapeHtml(project.title)}</h4><p>${escapeHtml(project.summary)}</p>${lab ? `<button class="ghost-button lab-launch" data-open-lab="${lab.id}">Open ${escapeHtml(lab.title)} →</button>` : ""}</div>${acceptance ? `<ul>${acceptance}</ul>` : ""}</div>
      <div class="week-resources">${resources}</div>
      <div class="week-actions"><label class="week-check"><input type="checkbox" data-week="${week.week}" ${weekDone ? "checked" : ""}/> project complete</label></div>
    </article>`;
  }).join("");
  const assignments = new Map(allAssignments().map((assignment) => [assignment.id, assignment]));
  container.querySelectorAll("[data-open-assignment]").forEach((button) => {
    button.addEventListener("click", () => {
      const assignment = assignments.get(button.dataset.openAssignment);
      if (assignment) openAssignment(assignment);
    });
  });
  container.querySelectorAll("[data-assignment-segment]").forEach((button) => {
    button.addEventListener("click", () => {
      const assignment = assignments.get(button.dataset.assignmentSegment);
      const segment = assignment?.segments[Number(button.dataset.segmentIndex)];
      if (!assignment || !segment) return;
      state.activeAssignmentId = assignment.id;
      selectResource(assignment.resource, { page: segment.page || 0, heading: segment.heading || "", url: segment.url || "", assignmentId: assignment.id });
    });
  });
  container.querySelectorAll("[data-open-studio]").forEach((button) => {
    button.addEventListener("click", () => openUnderstandingStudio(assignments.get(button.dataset.openStudio)));
  });
  container.querySelectorAll("[data-open-lab]").forEach((button) => {
    button.addEventListener("click", () => openMicroworld(button.dataset.openLab));
  });
  container.querySelectorAll("[data-week]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleWeek(checkbox.dataset.week));
  });
}

function searchTokens(value) {
  return String(value || "").toLowerCase().match(/[a-z0-9_+.-]{2,}/g) || [];
}

async function ensurePageIndex() {
  if (state.pageIndex) return state.pageIndex;
  if (state.pageIndexPromise) return state.pageIndexPromise;
  state.searchStatus = "loading";
  state.pageIndexPromise = fetch("/api/search-index")
    .then((response) => {
      if (!response.ok) throw new Error(`Search index load failed: ${response.status}`);
      return response.json();
    })
    .then((index) => {
      state.pageIndex = index;
      state.searchStatus = "ready";
      state.pageIndexPromise = null;
      renderLibrary();
      return index;
    })
    .catch((error) => {
      console.error(error);
      state.searchStatus = "error";
      state.pageIndexPromise = null;
      renderLibrary();
      return null;
    });
  return state.pageIndexPromise;
}

function pageMatches(query) {
  const tokens = searchTokens(query);
  if (!state.pageIndex || !tokens.length) return [];
  const documents = state.pageIndex.documents || [];
  const results = [];
  for (const record of state.pageIndex.pages || []) {
    const [documentIndex, page, terms, snippet] = record;
    const document = documents[documentIndex];
    if (!document || (state.category !== "all" && document.category !== state.category)) continue;
    const metadata = `${document.title} ${document.path} ${document.category}`.toLowerCase();
    const searchableTerms = ` ${String(terms || "")} `;
    const searchableSnippet = String(snippet || "").toLowerCase();
    let score = 0;
    let matchesAll = true;
    for (const token of tokens) {
      if (metadata.includes(token)) score += 8;
      else if (searchableTerms.includes(` ${token} `)) score += 5;
      else if (searchableSnippet.includes(token)) score += 3;
      else { matchesAll = false; break; }
    }
    if (matchesAll) results.push({ document, page, snippet, score });
  }
  return results.sort((left, right) => right.score - left.score || left.document.title.localeCompare(right.document.title) || left.page - right.page).slice(0, 80);
}

function renderLibrary() {
  const container = $("#resource-list");
  const status = $("#search-status");
  const query = state.query.toLowerCase().trim();
  if (query.length >= 2) {
    if (state.searchStatus === "error") {
      status.textContent = "The page index could not be loaded. Document-title search is still available after clearing the query.";
      container.innerHTML = '<div class="empty-list">Page search is temporarily unavailable.</div>';
      return;
    }
    if (!state.pageIndex) {
      status.textContent = "Loading the private page index…";
      container.innerHTML = '<div class="loading">Searching cited pages…</div>';
      if (!state.pageIndexPromise) void ensurePageIndex();
      return;
    }
    const matches = pageMatches(query);
    status.textContent = `${matches.length}${matches.length === 80 ? "+" : ""} cited page matches · click a result to open that exact page`;
    if (!matches.length) {
      container.innerHTML = '<div class="empty-list">No cited page matches. Try a more specific technical term or clear the category filter.</div>';
      return;
    }
    container.innerHTML = matches.map(({ document, page, snippet }) => `<button class="page-hit" data-page-path="${escapeHtml(document.path)}" data-page-number="${page}">
      <div class="page-hit-citation">${escapeHtml(document.category)} · p.${page}</div>
      <div class="resource-item-title">${escapeHtml(document.title)}</div>
      <p>${escapeHtml(snippet || "Matched page")}</p>
    </button>`).join("");
    container.querySelectorAll("[data-page-path]").forEach((node) => node.addEventListener("click", () => {
      const document = state.pageIndex.documents.find((item) => item.path === node.dataset.pagePath);
      if (document) selectResource({ ...document, id: document.path, kind: "pdf" }, { page: Number(node.dataset.pageNumber) });
    }));
    return;
  }

  status.textContent = "Type two or more characters to search cited pages across the full library.";
  const filtered = state.items.filter((item) => state.category === "all" || item.category === state.category).sort((left, right) => {
    if (state.sort === "pages") return (right.pages || 0) - (left.pages || 0);
    if (state.sort === "year") return String(right.year).localeCompare(String(left.year));
    return left.title.localeCompare(right.title);
  });
  if (!filtered.length) { container.innerHTML = '<div class="empty-list">No matching resources.</div>'; return; }
  container.innerHTML = filtered.map((item) => {
    const selected = state.current && state.current.path === item.path;
    const done = isComplete(item);
    const opened = isOpened(item);
    const statusMarkup = done ? '<span class="done-mark">✓ complete</span>' : opened ? '<span class="opened-mark">opened</span>' : formatBytes(item.bytes);
    return `<div class="resource-item ${selected ? "selected" : ""}" data-pdf='${escapeHtml(JSON.stringify(item))}'>
      <div class="resource-item-title">${escapeHtml(item.title)}</div>
      <div class="resource-item-meta"><span>${escapeHtml(item.category)} · ${item.pages || "?"} pp</span><span>${statusMarkup}</span></div>
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
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><base href="${escapeHtml(window.location.origin)}/"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/static/styles.css"></head><body class="standalone-note"><article class="markdown-reader">${rendered}</article></body></html>`;
}

function decorateMarkdownHeadings(body) {
  const counts = {};
  body.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    const base = slugifyHeading(heading.textContent) || "section";
    counts[base] = (counts[base] || 0) + 1;
    heading.id = counts[base] === 1 ? base : `${base}-${counts[base]}`;
  });
}

function renderReaderKeys(resource, assignment = null) {
  const container = $("#reader-keys");
  const keys = assignment ? assignment.segments : resourceKeys(resource);
  if (!keys.length) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }
  const info = roleInfo(resource);
  container.classList.remove("hidden");
  const progress = assignment ? assignmentProgress(assignment) : null;
  container.innerHTML = `${info.role ? `<span class="role-badge role-${escapeHtml(info.role)}" title="${escapeHtml(info.description)}">${escapeHtml(info.label)}</span>` : ""}<span class="key-label">${assignment ? "Assigned" : "Jump to"}</span>${keys.map((key, index) => `<button class="key-button" data-reader-key="${index}"><span>${escapeHtml(keyMarker(key))}</span> ${escapeHtml(key.label)}</button>`).join("")}${assignment ? `<button class="reader-evidence" data-reader-studio="${escapeHtml(assignment.id)}"><span>Evidence</span><strong>${escapeHtml(masteryInfo(progress.level).shortLabel)}</strong></button>` : ""}`;
  container.querySelectorAll("[data-reader-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = keys[Number(button.dataset.readerKey)];
      selectResource(resource, { page: key.page || 0, heading: key.heading || "", url: key.url || "", assignmentId: assignment?.id || "" });
    });
  });
  container.querySelector("[data-reader-studio]")?.addEventListener("click", () => openUnderstandingStudio(assignment));
}

async function selectResource(resource, target = {}) {
  state.current = resource;
  state.activeAssignmentId = target.assignmentId || "";
  recordOpened(resource, target);
  showView("library-view");
  const targetLabel = target.page ? ` · page ${target.page}` : target.heading ? ` · ${target.heading}` : "";
  $("#reader-title").textContent = `${resource.title || resource.label || "Resource"}${targetLabel}`;
  $("#open-new-tab").disabled = false;
  $("#mark-complete").disabled = false;
  const assignment = allAssignments().find((candidate) => candidate.id === state.activeAssignmentId) || null;
  $("#mark-complete").textContent = assignment ? (isAssignmentRead(assignment) ? "Assignment read ✓" : "Mark assignment read") : (isComplete(resource) ? "Completed ✓" : "Mark complete");
  renderReaderKeys(resource, assignment);
  renderReaderNavigation(assignment);
  const body = $("#reader-body");
  let url = "";
  state.currentOpenAction = null;
  if (resource.kind === "external") {
    url = target.url || resource.url;
    body.innerHTML = `<div class="reader-empty"><div class="reader-icon">↗</div><h2>Official web reference</h2><p>This resource lives on its official site. Open it in a new tab while keeping the Study Hub available.</p><a class="primary-button" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open reference ↗</a></div>`;
    state.currentOpenAction = () => window.open(url, "_blank", "noopener");
  } else if (resource.kind === "code") {
    url = target.url || CODE_URLS[resource.path] || "https://github.com";
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
      decorateMarkdownHeadings(body);
      body.querySelectorAll("a").forEach((link) => { link.target = "_blank"; link.rel = "noopener"; });
      const targetId = slugifyHeading(target.heading);
      const targetHeading = [...body.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((heading) => heading.id === targetId || heading.id.endsWith(`-${targetId}`));
      const resolvedTargetId = targetHeading?.id || targetId;
      if (targetHeading) window.requestAnimationFrame(() => targetHeading.scrollIntoView({ behavior: "smooth", block: "start" }));
      const title = resource.label || resource.path;
      state.currentOpenAction = () => {
        const renderedWithIds = body.querySelector(".markdown-reader").innerHTML;
        const blob = new Blob([markdownDocument(title, renderedWithIds)], { type: "text/html" });
        const objectUrl = URL.createObjectURL(blob);
        window.open(`${objectUrl}${resolvedTargetId ? `#${resolvedTargetId}` : ""}`, "_blank", "noopener");
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      };
    } catch (error) {
      console.error(error);
      body.innerHTML = '<div class="reader-empty"><div class="reader-icon">!</div><h2>Could not render this note</h2><p>Try opening it again or use the raw file in a new tab.</p></div>';
      state.currentOpenAction = () => window.open(url, "_blank", "noopener");
    }
  } else {
    url = pdfUrl(resource.path);
    const page = Math.max(1, Number(target.page) || 1);
    const pageUrl = `${url}#page=${page}`;
    body.innerHTML = `<iframe title="${escapeHtml(resource.title || resource.path)}" src="${pageUrl}"></iframe>`;
    state.currentOpenAction = () => window.open(pageUrl, "_blank", "noopener");
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
  if (state.view === "review-view") renderReview();
  if (state.view === "labs-view") renderMicroworlds($("#labs-index"));
  if (state.current) {
    const assignment = allAssignments().find((candidate) => candidate.id === state.activeAssignmentId) || null;
    $("#mark-complete").textContent = assignment ? (isAssignmentRead(assignment) ? "Assignment read ✓" : "Mark assignment read") : (isComplete(state.current) ? "Completed ✓" : "Mark complete");
    renderReaderKeys(state.current, assignment);
    renderReaderNavigation(assignment);
  }
}

async function init() {
  const [libraryResponse, pathResponse] = await Promise.all([fetch("/api/library"), fetch("/api/study-path")]);
  if (!libraryResponse.ok || !pathResponse.ok) throw new Error("Could not load the library index or learning path");
  state.items = (await libraryResponse.json()).items;
  state.studyPath = await pathResponse.json();
  await loadCloudProgress();
  if (migrateLegacyProgress() || refreshEvidenceLevels()) saveProgress();
  populateCategories();
  renderAll();

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  document.querySelectorAll("[data-view-target]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.viewTarget)));
  $("#resume-button").addEventListener("click", () => showView("path-view"));
  $("#library-search").addEventListener("input", (event) => { state.query = event.target.value; renderLibrary(); });
  $("#category-filter").addEventListener("change", (event) => { state.category = event.target.value; renderLibrary(); });
  $("#sort-filter").addEventListener("change", (event) => { state.sort = event.target.value; renderLibrary(); });
  $("#mark-complete").addEventListener("click", () => {
    if (!state.current) return;
    const assignment = allAssignments().find((candidate) => candidate.id === state.activeAssignmentId);
    if (assignment) {
      if (isAssignmentRead(assignment)) openUnderstandingStudio(assignment);
      else markAssignmentRead(assignment.id);
    }
    else toggleResource(state.current);
  });
  $("#close-studio").addEventListener("click", closeUnderstandingStudio);
  $("#skip-checkpoint").addEventListener("click", closeUnderstandingStudio);
  $("#save-evidence").addEventListener("click", saveStudioEvidence);
  $("#continue-next").addEventListener("click", continueFromStudio);
  $("#open-studio-source").addEventListener("click", () => {
    const assignment = studioAssignment();
    closeUnderstandingStudio();
    if (assignment) openAssignment(assignment);
  });
  $("#teach-back").addEventListener("input", updateStudioCounters);
  $("#fault-reflection").addEventListener("input", updateStudioCounters);
  $("#understanding-studio").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeUnderstandingStudio();
  });
  $("#reset-progress").addEventListener("click", () => {
    if (!window.confirm("Clear all cloud-synced reading history and completion progress?")) return;
    state.completed = {};
    state.completedWeeks = {};
    state.opened = {};
    state.assignmentProgress = {};
    saveProgress();
    renderAll();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#understanding-studio").classList.contains("hidden")) {
      closeUnderstandingStudio();
      return;
    }
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
