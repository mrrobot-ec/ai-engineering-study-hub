const MICROWORLDS = [
  { id: "context-budget", week: 1, title: "Context budget allocator", summary: "Trade token space among instructions, history, retrieval, and tools without overflowing the model context." },
  { id: "graph-replay", week: 2, title: "LangGraph replay simulator", summary: "Crash at a graph boundary and see what checkpoints replay—and what they cannot protect." },
  { id: "idempotency", week: 3, title: "Idempotency and retry lab", summary: "Repeat an at-least-once operation and observe when one request creates multiple business effects." },
  { id: "kafka-rebalance", week: 6, title: "Kafka partition and rebalance lab", summary: "Change partitions and consumers to see ordering scope, idle consumers, and reassignment." },
  { id: "isolation-race", week: 7, title: "Database isolation race", summary: "Run two concurrent updates and compare lost updates with transactional protection." },
  { id: "retrieval-reranking", week: 10, title: "Retrieval and reranking lab", summary: "Blend dense and sparse retrieval, then apply a reranker to inspect how the final order changes." },
  { id: "feedback-loop", week: 12, title: "Recommendation feedback-loop lab", summary: "Tune popularity and exploration to see how quickly exposure concentrates or remains diverse." }
];

function labMarkup(lab) {
  const header = `<div class="lab-heading"><div><span class="lab-week">Week ${lab.week}</span><h2>${lab.title}</h2><p>${lab.summary}</p></div><button class="ghost-button" data-reset-lab="${lab.id}">Reset</button></div>`;
  if (lab.id === "context-budget") return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls four-controls">
      ${rangeControl("context-system", "Instructions", 5, 55, 10, "%")}
      ${rangeControl("context-history", "History", 5, 70, 25, "%")}
      ${rangeControl("context-retrieval", "Retrieval", 5, 70, 35, "%")}
      ${rangeControl("context-tools", "Tools", 5, 55, 15, "%")}
    </div>
    <div class="context-budget-bar" role="img" aria-label="Context budget allocation"><span data-budget-segment="system">Instructions</span><span data-budget-segment="history">History</span><span data-budget-segment="retrieval">Retrieval</span><span data-budget-segment="tools">Tools</span><span data-budget-segment="free">Free</span></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;

  if (lab.id === "graph-replay") return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls">
      <label>Crash point<select data-lab-input="crash"><option value="before-tool">Before tool call</option><option value="after-tool">After tool call</option><option value="after-checkpoint">After checkpoint</option></select></label>
      ${checkControl("graph-checkpoint", "Checkpoint after plan", true)}
      ${checkControl("graph-idempotent", "Idempotent tool", false)}
    </div>
    <div class="step-lane" data-step-lane role="img" aria-label="Workflow replay steps"></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;

  if (lab.id === "idempotency") return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls">
      ${rangeControl("retry-attempts", "Delivery attempts", 1, 5, 3, "")}
      ${checkControl("retry-idempotency", "Idempotency key", false)}
      ${checkControl("retry-outbox", "Transactional outbox", false)}
    </div>
    <div class="attempt-lane" data-attempt-lane role="img" aria-label="Repeated delivery effects"></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;

  if (lab.id === "kafka-rebalance") return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls">
      ${rangeControl("kafka-partitions", "Partitions", 1, 6, 4, "")}
      ${rangeControl("kafka-consumers", "Consumers", 1, 7, 3, "")}
      ${rangeControl("kafka-events", "Events", 4, 16, 10, "")}
      ${checkControl("kafka-rebalance-toggle", "Trigger rebalance", false)}
    </div>
    <div class="partition-grid" data-partition-grid role="img" aria-label="Kafka events distributed across partitions"></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;

  if (lab.id === "isolation-race") return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls">
      <label>Isolation<select data-lab-input="isolation"><option value="read-committed">Read committed</option><option value="repeatable-read">Repeatable read</option><option value="serializable">Serializable</option></select></label>
      ${checkControl("db-constraint", "Unique/version constraint", false)}
    </div>
    <div class="transaction-timeline" data-transaction-timeline role="img" aria-label="Two concurrent transaction timeline"></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;

  if (lab.id === "retrieval-reranking") return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls">
      ${rangeControl("retrieval-dense", "Dense weight", 0, 100, 55, "%")}
      ${rangeControl("retrieval-reranker", "Reranker strength", 0, 100, 50, "%")}
    </div>
    <div class="ranking-list" data-ranking-list role="img" aria-label="Documents ordered by blended retrieval score"></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;

  return `<article class="microworld" id="lab-${lab.id}" data-lab="${lab.id}">${header}
    <div class="lab-controls">
      ${rangeControl("feedback-popularity", "Popularity pressure", 0, 100, 70, "%")}
      ${rangeControl("feedback-exploration", "Exploration", 0, 100, 20, "%")}
      ${rangeControl("feedback-cycles", "Feedback cycles", 1, 10, 5, "")}
    </div>
    <div class="feedback-bars" data-feedback-bars role="img" aria-label="Recommendation exposure share after feedback cycles"></div>
    <div class="lab-result" data-lab-result></div>
  </article>`;
}

function rangeControl(id, label, min, max, value, unit) {
  return `<label>${label} <output data-output-for="${id}">${value}${unit}</output><input id="${id}" data-lab-input="${id}" type="range" min="${min}" max="${max}" value="${value}" data-unit="${unit}" /></label>`;
}

function checkControl(id, label, checked) {
  return `<label class="lab-check"><input id="${id}" data-lab-input="${id}" type="checkbox" ${checked ? "checked" : ""}/><span>${label}</span></label>`;
}

function labValue(card, key) {
  const input = card.querySelector(`[data-lab-input="${key}"]`);
  return input?.type === "checkbox" ? input.checked : Number(input?.value || 0);
}

function setLabResult(card, label, detail, mode = "good") {
  const result = card.querySelector("[data-lab-result]");
  result.className = `lab-result ${mode}`;
  result.innerHTML = `<strong>${label}</strong><span>${detail}</span>`;
}

function updateContextBudget(card) {
  const values = {
    system: labValue(card, "context-system"),
    history: labValue(card, "context-history"),
    retrieval: labValue(card, "context-retrieval"),
    tools: labValue(card, "context-tools")
  };
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  const free = Math.max(0, 100 - total);
  for (const [name, value] of Object.entries({ ...values, free })) {
    const segment = card.querySelector(`[data-budget-segment="${name}"]`);
    segment.style.width = `${name === "free" ? free : value}%`;
    segment.textContent = `${segment.textContent.split(" ")[0]} ${name === "free" ? free : value}%`;
    segment.classList.toggle("hidden-segment", (name === "free" ? free : value) < 8);
  }
  if (total > 100) setLabResult(card, `${total - 100}% over budget`, "Something must be truncated before the model call.", "danger");
  else if (free > 25) setLabResult(card, `${free}% unused`, "You have room, but only add context with measured value.", "neutral");
  else setLabResult(card, `${total}% allocated`, "The budget fits. Test whether each section earns its tokens.");
}

function updateGraphReplay(card) {
  const crash = card.querySelector('[data-lab-input="crash"]').value;
  const checkpoint = labValue(card, "graph-checkpoint");
  const idempotent = labValue(card, "graph-idempotent");
  const steps = ["Load", "Plan", "Tool write", "Checkpoint", "Respond"];
  const crashIndex = crash === "before-tool" ? 2 : crash === "after-tool" ? 3 : 4;
  const restartIndex = checkpoint && crashIndex > 2 ? 2 : 0;
  const replayedWrite = crashIndex > 2 && restartIndex <= 2;
  card.querySelector("[data-step-lane]").innerHTML = steps.map((step, index) => {
    const classes = [index === crashIndex ? "crash" : "", index >= restartIndex && index < crashIndex ? "replay" : ""].filter(Boolean).join(" ");
    return `<span class="step ${classes}"><b>${index + 1}</b>${step}</span>`;
  }).join("") + `<span class="replay-arrow">↺ restart at ${steps[restartIndex]}</span>`;
  if (replayedWrite && !idempotent) setLabResult(card, "Duplicate tool effect", "A checkpoint restores graph state; it does not make the external write exactly once.", "danger");
  else if (replayedWrite) setLabResult(card, "Replay-safe outcome", "The write repeats, but the idempotency key collapses it to one business effect.");
  else setLabResult(card, "No repeated write", "The crash happens before the external effect or after a safe boundary.");
}

function updateIdempotency(card) {
  const attempts = labValue(card, "retry-attempts");
  const idempotency = labValue(card, "retry-idempotency");
  const outbox = labValue(card, "retry-outbox");
  const effects = idempotency ? 1 : attempts;
  card.querySelector("[data-attempt-lane]").innerHTML = Array.from({ length: attempts }, (_, index) => `<span class="attempt ${index === 0 || !idempotency ? "effect" : "deduped"}"><b>Attempt ${index + 1}</b>${index === 0 || !idempotency ? "write applied" : "duplicate rejected"}</span>`).join("");
  if (!idempotency) setLabResult(card, `${effects} business effects`, "At-least-once delivery repeated the side effect. Add an idempotency key.", "danger");
  else if (!outbox) setLabResult(card, "One effect, possible event gap", "Deduplication protects the write, but state and event publication can still split.", "neutral");
  else setLabResult(card, "One atomic outcome", "Idempotency collapses retries and the outbox couples state with event publication.");
}

function updateKafka(card) {
  const partitions = labValue(card, "kafka-partitions");
  const consumers = labValue(card, "kafka-consumers");
  const events = labValue(card, "kafka-events");
  const rebalance = labValue(card, "kafka-rebalance-toggle");
  const buckets = Array.from({ length: partitions }, () => []);
  for (let index = 0; index < events; index += 1) buckets[index % partitions].push(`e${index + 1}`);
  card.querySelector("[data-partition-grid]").innerHTML = buckets.map((bucket, index) => {
    const consumer = (index + (rebalance ? 1 : 0)) % Math.min(consumers, partitions);
    return `<div class="partition"><strong>P${index}</strong><small>consumer ${consumer + 1}</small><div>${bucket.map((event) => `<span>${event}</span>`).join("")}</div></div>`;
  }).join("");
  const idle = Math.max(0, consumers - partitions);
  const detail = `${partitions} ordering lanes · ${Math.min(consumers, partitions)} active consumers${idle ? ` · ${idle} idle` : ""}`;
  setLabResult(card, rebalance ? "Assignments moved" : "Stable assignment", `${detail}. Ordering is guaranteed only inside each partition.`, rebalance ? "neutral" : "good");
}

function updateIsolation(card) {
  const isolation = card.querySelector('[data-lab-input="isolation"]').value;
  const constrained = labValue(card, "db-constraint");
  const protectedWrite = isolation === "serializable" || constrained;
  card.querySelector("[data-transaction-timeline]").innerHTML = `<div><strong>Transaction A</strong><span>read v1 = 10</span><span>write 11</span><span class="commit">commit</span></div><div><strong>Transaction B</strong><span>read v1 = 10</span><span>write 11</span><span class="${protectedWrite ? "abort" : "commit"}">${protectedWrite ? "retry/abort" : "commit"}</span></div>`;
  if (protectedWrite) setLabResult(card, "Conflict detected", "One writer retries, so both increments can be preserved.");
  else if (isolation === "repeatable-read") setLabResult(card, "Write conflict depends on engine", "A stable snapshot alone does not universally prevent this application race.", "neutral");
  else setLabResult(card, "Lost update: expected 12, stored 11", "Both transactions read the same value and one result overwrites the other.", "danger");
}

function updateRetrieval(card) {
  const denseWeight = labValue(card, "retrieval-dense") / 100;
  const reranker = labValue(card, "retrieval-reranker") / 100;
  const docs = [
    { title: "Checkpoint recovery", dense: .92, sparse: .35, relevance: .95 },
    { title: "Graph persistence API", dense: .78, sparse: .82, relevance: .86 },
    { title: "Memory architecture", dense: .84, sparse: .28, relevance: .55 },
    { title: "Replay runbook", dense: .48, sparse: .94, relevance: .8 }
  ].map((doc) => {
    const fused = denseWeight * doc.dense + (1 - denseWeight) * doc.sparse;
    return { ...doc, score: fused * (1 - reranker) + doc.relevance * reranker };
  }).sort((left, right) => right.score - left.score);
  card.querySelector("[data-ranking-list]").innerHTML = docs.map((doc, index) => `<div><b>${index + 1}</b><span>${doc.title}</span><i style="width:${Math.round(doc.score * 100)}%"></i><small>${Math.round(doc.score * 100)}</small></div>`).join("");
  setLabResult(card, `Top result: ${docs[0].title}`, `${Math.round(denseWeight * 100)}% dense blend · ${Math.round(reranker * 100)}% reranker influence`, reranker > .8 ? "neutral" : "good");
}

function updateFeedback(card) {
  const popularity = labValue(card, "feedback-popularity") / 100;
  const exploration = labValue(card, "feedback-exploration") / 100;
  const cycles = labValue(card, "feedback-cycles");
  let shares = [.45, .33, .22];
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    const total = shares.reduce((sum, share) => sum + Math.pow(share, 1 + popularity), 0);
    shares = shares.map((share) => ((1 - exploration) * Math.pow(share, 1 + popularity) / total) + exploration / 3);
  }
  const diversity = 1 - (Math.max(...shares) - Math.min(...shares));
  card.querySelector("[data-feedback-bars]").innerHTML = shares.map((share, index) => `<div><span>Item ${String.fromCharCode(65 + index)}</span><i style="width:${Math.round(share * 100)}%"></i><b>${Math.round(share * 100)}%</b></div>`).join("");
  if (diversity < .55) setLabResult(card, "Exposure is collapsing", `${Math.round(diversity * 100)}% diversity signal. Popularity compounds faster than exploration corrects it.`, "danger");
  else setLabResult(card, "Exposure remains mixed", `${Math.round(diversity * 100)}% diversity signal after ${cycles} feedback cycles.`);
}

function updateMicroworld(card) {
  card.querySelectorAll('input[type="range"]').forEach((input) => {
    const output = card.querySelector(`[data-output-for="${input.id}"]`);
    if (output) output.textContent = `${input.value}${input.dataset.unit || ""}`;
  });
  const updates = {
    "context-budget": updateContextBudget,
    "graph-replay": updateGraphReplay,
    idempotency: updateIdempotency,
    "kafka-rebalance": updateKafka,
    "isolation-race": updateIsolation,
    "retrieval-reranking": updateRetrieval,
    "feedback-loop": updateFeedback
  };
  updates[card.dataset.lab]?.(card);
}

function resetMicroworld(card) {
  card.querySelectorAll("[data-lab-input]").forEach((input) => {
    if (input.type === "range") input.value = input.defaultValue;
    else if (input.type === "checkbox") input.checked = input.defaultChecked;
    else input.selectedIndex = 0;
  });
  updateMicroworld(card);
}

function renderMicroworlds(container) {
  container.innerHTML = MICROWORLDS.map(labMarkup).join("");
  container.querySelectorAll("[data-lab]").forEach((card) => {
    card.querySelectorAll("[data-lab-input]").forEach((input) => input.addEventListener("input", () => updateMicroworld(card)));
    card.querySelector("[data-reset-lab]").addEventListener("click", () => resetMicroworld(card));
    updateMicroworld(card);
  });
}
