# Senior Software Engineering and AI Engineering Career Guide

**Evidence-backed draft — 13 July 2026**

This guide compares senior and staff-level software engineering (SWE) and AI engineering work at Meta, Google, frontier/fast-paced AI startups, and applied-AI companies. It is a study and portfolio plan, not an inside account of any employer's confidential ladder or performance process.

## How to read the claims

- **PUBLIC** — directly supported by an official company source, an official public job description, a public career framework, or primary/open research. A job description is a point-in-time sample, not a promise that every team works the same way.
- **INFERENCE** — a synthesis from multiple public sources. It is deliberately phrased as a hypothesis to test with recruiters, hiring managers, and prospective teammates.
- **PRACTICE** — a recommended exercise, project, or interview preparation standard.

Source keys in brackets map to the [catalog](catalog/industry-codex.md) and the evidence index at the end. Public title equivalence is especially weak: Meta and Google do not publish a complete, current internal IC ladder with calibration rules. This guide therefore uses role scope, not rumored level-number mappings.

## Executive answer

**INFERENCE — the durable distinction is scope, not syntax.** A strong senior engineer independently turns an ambiguous team or subsystem problem into a reliable product outcome. A strong staff engineer shapes a multi-team, often multi-year technical direction; changes other teams' decisions; establishes quality mechanisms; and makes the organization more capable after the project ships. Dropbox's public framework is useful calibration evidence: its senior-equivalent IC4 scope spans a team or multiple teams and semiannual/annual goals, while Staff IC5 spans multiple teams and a multi-year strategy. It is an anchor, not a Meta or Google conversion table. [L01–L05]

**INFERENCE — AI engineering is software and systems engineering with an empirical behavior loop.** In addition to architecture, code, data, reliability, and product judgment, the engineer must define tasks; build representative datasets; measure retrieval/model/agent behavior; investigate failures; manage probabilistic and adversarial inputs; and control latency, cost, privacy, and safety. Current Google Staff GenAI and Harvey AI Platform/Agents postings explicitly combine full lifecycle ownership, RAG or agents, evaluation, context management, serving economics, and cross-functional leadership. [G15–G16, A01–A02]

**PUBLIC — fast does not mean review-free.** Meta says every diff is reviewed and describes staged rollouts from employee dogfood to a small production cohort before wider release. Google's public engineering material describes required review, design documents for major projects, small changes, canaries, rollback, and risk-based releases. [M01–M04, G02–G09]

**PUBLIC — AI tools amplify the delivery system around them.** DORA's 2025 study of nearly 5,000 professionals found 90% reported using AI and more than 80% believed it improved productivity, while 30% reported little or no trust in generated code. AI adoption was associated with more throughput but also more instability; the report's central interpretation is that AI amplifies the surrounding platform, workflow, testing, and feedback system. [R01] METR's early-2025 randomized study found experienced open-source developers took 19% longer on its particular tasks with then-current tools, while METR's 2026 follow-up says newer estimates are too selection-biased and noisy to establish the magnitude of speedup. [R02–R04] The defensible career strategy is to measure outcomes, not advertise an assumed productivity multiplier.

## 1. Evidence boundary

| Question | What public evidence supports | What remains inference or team-specific |
|---|---|---|
| What is “senior” or “staff”? | Public ladders at Dropbox and GitLab show increasing scope, ambiguity, time horizon, influence, and organizational impact. Current job descriptions show sampled requirements. [L01–L06, G14–G16, A01–A03] | Exact Meta/Google level equivalence, promotion packet rules, rating distributions, and calibration thresholds. |
| How is code changed? | Meta documents mandatory diff review and staged delivery; Google documents code review, design review, readability, continuous testing, canaries, and rollback. [M01–M04, G02–G09] | A specific team's approval count, release train, on-call load, or exception path. |
| What does an AI engineer do? | Current Google and Harvey roles name RAG/agents, evaluation, context, latency/cost, data, deployment, and cross-functional product work. Anthropic publishes agent/eval/context patterns. [G15–G16, A01–A03, F02–F06] | The percentage of a week spent on prompts, data, platform code, research, or customer work. |
| Does AI make engineers faster? | DORA reports broad adoption and system-dependent correlations. METR provides a narrow randomized result and explicit limits on its 2026 update. [R01–R04] | A universal uplift, a stable 2026 multiplier, or a direct causal estimate for one's own company. |
| What does a current posting prove? | What that employer publicly sought when the page was captured in July 2026. | A permanent ladder, all-team culture, actual interview sequence, or eventual day-to-day assignment. |

### Evidence quality order used here

1. Official public engineering standards, books, job pages, and public ladders.
2. Primary studies and official/open standards with methods and limitations.
3. First-party practitioner reports and company engineering case studies.
4. Cross-source inference, always labeled.

Unattributed compensation pages, scraped job mirrors, anonymous level charts, and “day in the life” influencer posts are intentionally excluded from core claims.

## 2. Company-type comparison

| Environment | Public signal | Likely center of gravity (**INFERENCE**) | Senior proof | Staff proof |
|---|---|---|---|---|
| **Meta product/infrastructure** | Mandatory diff review; high-volume trunk-oriented development; automated test selection; staged rollouts; SLO and production-engineering practices. [M01–M09] | Make a product or infrastructure surface move quickly at enormous scale while containing blast radius. Strong implementation remains valuable alongside cross-functional product and operational judgment. | Own an ambiguous subsystem outcome, instrument it, ship in stages, operate it, and improve team throughput. | Set a cross-team technical direction or common mechanism; align product/infra partners; change reliability, efficiency, or developer practice across an organization. |
| **Google product/infrastructure** | Design docs for major work, mandatory review/readability, small changes, error budgets, production-readiness review, automated/canary releases. Current senior/staff jobs expose sampled experience and scope. [G01–G18] | Durable design and explicit trade-offs at scale; high code/document quality; production discipline; influence through technical clarity. | Lead design and delivery of a team-scale system, mentor, and own launch/operations. | Own a multi-team roadmap and architecture, make trade-offs legible, create reusable systems, and influence stakeholders and adjacent organizations. |
| **Frontier / fast-paced AI startup** | OpenAI and Anthropic list specialized roles across inference, reliability, evals, safeguards, data, research engineering, product, and developer productivity. Both publish frontier risk processes; Anthropic publishes agent/eval/context practice. [F01–F12] | Research-to-production compression under rapidly changing model capabilities. More problem discovery, experimental infrastructure, and safety/reliability work; boundaries between research, product, and platform are porous. | Turn an underspecified capability into an evaluated, observable production feature; move between prototypes and hard systems work. | Choose the technical bets, evaluation gates, and safety/reliability architecture that let several teams ship; often create the platform or operating model as well as the product. |
| **Applied-AI company** | Harvey's current roles combine legal workflows, model routing, agents, context/memory, evals, observability, and low-latency serving. Sierra lists a broad Agent Engineering and Platform Engineering family. [A01–A06] | Convert a domain workflow into reliable user value. Customer discovery, permissions, traceability, evaluation, and unit economics are as important as model novelty. | Own a customer workflow end to end, including data/evals, product integration, production behavior, and support feedback. | Define a reusable agent/eval/data platform and domain quality bar; align multiple product teams and customers; make build/buy/model choices. |

### What changes by company, and what does not

**INFERENCE.** Meta and Google generally offer more mature shared infrastructure and a larger coordination surface. Frontier companies place more weight on capability discovery, research literacy, inference scale, security, and evaluation under distribution shift. Applied-AI companies place more weight on workflow fidelity, domain expertise, customer iteration, permissions, auditability, and cost per successful task. Team maturity varies more than company logos imply.

Across all four, senior/staff credibility still comes from the same evidence chain:

> user or business problem → explicit success metric → defensible design → high-quality implementation → safe rollout → observable production result → learning that changes the next decision

## 3. Company profiles

### 3.1 Meta

#### Publicly documented operating signals

- **PUBLIC.** Meta states that every diff must be reviewed “without exception.” Its developer tooling work measures review latency while guarding the time reviewers actually inspect a change, and uses reviewer recommendation and experiments to improve the system rather than merely pressure individuals. [M01]
- **PUBLIC.** Meta has described rapid, staged web releases: employee dogfood, a small production cohort, then wider deployment, with automated signals and the ability to stop. Gatekeeper-style feature controls separate deploy from exposure. [M02]
- **PUBLIC.** Fix Fast and predictive test selection describe high-volume development backed by static analysis, targeted tests, trunk-oriented integration, and production signals. [M03–M04]
- **PUBLIC.** Production Engineering is described as a hybrid of software and systems work covering reliability, scalability, performance, and security, with production code and cross-team relationships. Meta's AI-capacity work adds maintenance trains, gradual rollouts, SLOs, and safe fleet changes. [M05–M06]
- **PUBLIC.** Recent engineering posts illustrate AI-infrastructure priorities: expert capacity-efficiency workflows encoded in agents, AI-storage bottlenecks that affect accelerator utilization and research velocity, and AI-assisted incident investigation. These are examples, not a complete job definition. [M07–M09]

#### Senior and staff interpretation

- **INFERENCE — senior.** Be the directly responsible technical owner for a meaningful product or infrastructure slice. Expect to write and review substantial code, decide metrics and rollout, handle operational follow-through, mentor locally, and coordinate with product, data, design, security, or infrastructure partners. Evidence should show shipped impact and preserved velocity, not only a clever design.
- **INFERENCE — staff.** Find a leverage point spanning teams: a common architecture, capacity strategy, developer mechanism, reliability program, or product platform. Create alignment and adoption, resolve local-versus-global trade-offs, and build durable guardrails. A strategy memo without production consequences is insufficient; so is a heroic local implementation with no organizational uptake.
- **Unknown publicly.** This guide makes no claim about Meta's internal E-level equivalences, promotion committee mechanics, performance ratings, or “up-or-out” rules.

#### Interview emphasis

- **PUBLIC.** Meta publishes a Software Engineering full-loop preparation page. Treat it as the current source of truth for official format and logistics, and re-check shortly before interviewing. [M10]
- **PRACTICE.** Prepare fast, correct coding with explicit complexity analysis; two scale-oriented system designs; and five impact stories covering ambiguity, conflict, failure, influence, and a measurable product/operational result. For AI roles, add one end-to-end AI design with evaluation and production controls.

### 3.2 Google

#### Publicly documented operating signals

- **PUBLIC.** *Software Engineering at Google* describes practices for sustainable, long-lived systems. Its public design-document chapter says most teams require an approved design document before major work and treats documents as collaborative trade-off records; its culture chapter describes mandatory code review and language “readability” expectations. [G01–G03]
- **PUBLIC.** Google's review guide prioritizes overall code health over perfection, favors technical facts over preference, encourages mentorship, and emphasizes team throughput and prompt review. [G04–G05]
- **PUBLIC.** Google's SRE material treats reliability as a product decision. Error budgets balance risk and velocity; release engineering calls for repeatable builds, tests, audit trails, canaries, and rollback; production-readiness and canary guidance scale controls with risk. [G06–G10]
- **PUBLIC.** Google's ML guidance says to establish metrics and infrastructure, start simple, separate training from serving tests, detect skew and stale data, and iterate. The ML Test Score, hidden-debt paper, and data-cascades study show that production ML quality depends on testing, monitoring, interfaces, and data work—not just model choice. [G11–G13, G18]
- **PUBLIC, point in time.** Google's public career search labels “Mid” work as deeper applied expertise plus helping junior colleagues and “Advanced” work as owning outcomes, handling ambiguity, and influencing stakeholders. Sampled senior SWE posts commonly ask for five years of development and experience testing/launching software; sampled Staff GenAI roles ask for eight years of development plus years of technical strategy, large-scale ML infrastructure, lifecycle/evaluation, or cross-organizational leadership. These are posting-specific minima, not a universal level contract. [G14–G16]

#### Senior and staff interpretation

- **INFERENCE — senior.** Convert an ambiguous team problem into a reviewed design, maintainable implementation, safe launch, and operational result. Make interfaces and trade-offs explicit, mentor through design and review, and understand the production system beyond one's own service.
- **INFERENCE — staff.** Own a technical direction whose success requires multiple teams, long-lived interfaces, and stakeholder alignment. For Staff AI work, add evaluation/data strategy and the ability to move between model behavior and serving/infrastructure constraints. The current Google Chat Staff ML posting is a concrete example: lifecycle ownership from hypothesis and data through fine-tuning/evaluation and post-production behavior, plus RAG/agent quality, latency, and cost. [G15]
- **Unknown publicly.** This guide does not assign Google level numbers to titles or claim a single company-wide promotion process beyond what Google itself publishes.

#### Interview emphasis

- **PUBLIC.** Google's hiring site is the official place to verify current process; role pages are the best public signal for role-specific requirements. [G14, G17]
- **PRACTICE.** Demonstrate deliberate code quality, trade-off-rich distributed-system design, and an ability to explain operating mechanisms. For AI roles, be able to design the data/evaluation loop and discuss training-serving skew, monitoring, latency, and cost. For staff, practice written strategy and stakeholder scenarios rather than only harder algorithms.

### 3.3 Frontier and fast-paced AI startups

This category includes model developers and unusually fast AI infrastructure/product companies. OpenAI and Anthropic are used because they expose current role families and engineering material; their practices should not be projected onto every startup.

#### Publicly documented operating signals

- **PUBLIC, point in time.** OpenAI's July 2026 career search includes roles across applied AI, inference, observability, reliability, data, safety, evaluation, continuous delivery, research engineering, and product. Sample descriptions ask engineers to own strategy and plans, operate large-scale telemetry, build multi-agent/MCP or enterprise platforms, and make reliability/security part of the product. [F08–F11]
- **PUBLIC, point in time.** Anthropic's careers page and job list include senior/staff engineering across ML systems, inference, model evaluations, safeguards, research tooling, product, and infrastructure. Its careers guidance explicitly values independent research, blog posts, and open-source work as evidence. [F01]
- **PUBLIC.** Anthropic recommends starting with simple, composable agent patterns and adding autonomy only when it improves outcomes. Its evaluation guidance emphasizes representative tasks, graders with validated failure modes, and transcript inspection; its context guidance treats the context window as a scarce resource. Its multi-agent case study reports architecture and evaluation lessons, not a universal prescription. [F02–F06]
- **PUBLIC.** OpenAI's Preparedness Framework and Anthropic's Responsible Scaling Policy are company governance frameworks for frontier risks. They are valuable examples of capability thresholds, safeguards, and deployment governance, not independent proof that all risks are resolved. [F07, F12]

#### Senior and staff interpretation

- **INFERENCE — senior.** Expect more problem-definition and fewer settled interfaces. A strong candidate can build a prototype, design a credible eval, discover the failure distribution, harden the system, and operate it. Research literacy matters, but repeated production learning matters more than a paper-reading list.
- **INFERENCE — staff.** Choose which bets deserve scarce research, compute, data, and engineering time. Define release gates and safety boundaries; create infrastructure that lets multiple researchers or product teams move faster; resolve model-quality versus latency/cost/reliability trade-offs; and communicate under genuine uncertainty.
- **INFERENCE — fast-paced does not waive engineering.** It raises the value of small reversible bets, observable experiments, clear ownership, strong incident response, and judgment about which controls must precede a launch.

#### Interview emphasis

- **PRACTICE.** Lead with a shipped artifact and its error analysis. Expect deep questions that traverse the stack: task definition, data, prompt/model/retrieval choices, eval validity, system architecture, serving, observability, safety, and customer outcome. Practice a live “unknown problem” session in which requirements change and evidence changes your decision.

### 3.4 Applied-AI companies

Harvey and Sierra are used as contemporary examples. Applied AI spans many domains, so health, finance, legal, customer service, and developer tools will differ materially.

#### Publicly documented operating signals

- **PUBLIC, point in time.** Harvey's Senior AI Platform description covers shared model/agent foundations, model routing, agent architecture, context management, evaluation, SDKs, emerging-model prototypes, and collaboration with product/design. It says staff candidates typically bring broader cross-team technical leadership. [A01]
- **PUBLIC, point in time.** Harvey's Agents description covers environments and actions, model selection, context windows, tools, practical evals, caching, parallel calls, subagents, observability, customer workflows, and latency. [A02]
- **PUBLIC, point in time.** Harvey's SRE role covers monitoring, incident response, postmortems, capacity, safe rollout, security, cost, CI/CD, and multi-region infrastructure. This is useful evidence that the applied-AI product includes its operational substrate. [A03]
- **PUBLIC, point in time.** Sierra's careers page exposes separate Agent Engineering and Platform Engineering families, including agent architecture, agent data platform, SRE, product, voice, and infrastructure roles, and describes customer focus, intensity, and craft as values. [A04]
- **PUBLIC, practitioner evidence.** Glean describes separate retrieval and generation evaluation and recommends real-workflow evaluation sets with consistent grading. As vendor-authored practice, this is useful but should be tested rather than treated as neutral causal evidence. [A05–A06]

#### Senior and staff interpretation

- **INFERENCE — senior.** Own the whole user workflow. Translate domain language and permissions into data and tool contracts; build evaluation from real cases; ship the product integration; inspect failures with domain experts; and carry latency, cost, auditability, and incident obligations.
- **INFERENCE — staff.** Create the reusable platform and quality model across workflows. Decide model/provider routing, agent runtime, context/memory architecture, evaluation governance, data boundaries, observability, and fallbacks. Align platform investment with actual customer pain and adoption.
- **INFERENCE — domain judgment compounds.** In high-stakes domains, a system that sounds fluent but cannot preserve permissions, provenance, abstention, or reviewability is not production quality.

#### Interview emphasis

- **PRACTICE.** Be ready to map an actual workflow, identify failure costs, define an acceptance dataset, and show how the system earns user trust. Include a build-versus-buy/model-routing discussion and a rollout that protects customer data and supports human review.

## 4. Competency matrix

This is a **cross-company inference**, calibrated against public ladders and current role descriptions. “Senior” and “staff” describe scope patterns, not title conversion.

| Competency | Senior SWE | Senior AI engineer | Staff SWE | Staff AI engineer |
|---|---|---|---|---|
| **Problem and scope** | Independently frames a team/subsystem problem and milestones; resolves local ambiguity. | Defines a user task and measurable AI success criteria; identifies where model behavior can fail. | Shapes a multi-team, multi-year technical problem and connects it to organizational goals. | Chooses an AI/platform bet spanning workflows or teams; makes capability uncertainty and evidence needs explicit. |
| **Architecture** | Designs maintainable interfaces, data flows, failure modes, and migrations. | Designs retrieval/agent/model/data/serving boundaries, fallbacks, and experiment hooks. | Sets durable cross-team architecture; manages transition and compatibility strategy. | Sets shared model-routing, context/memory, eval, data, serving, and governance architecture. |
| **Implementation** | Writes and reviews critical production code; creates testing and debugging leverage. | Can traverse application code, model APIs or open models, data pipelines, eval harnesses, and inference. | Personally handles the highest-leverage implementation while enabling others to deliver. | Can debug behavior from transcript and dataset through distributed serving; builds primitives others reuse. |
| **Quality and reliability** | Defines SLOs, monitors, rollout/rollback, on-call, and postmortem actions. | Adds non-determinism, model/provider failure, latency/cost budgets, trace/replay, and graceful degradation. | Establishes reliability mechanisms and operational ownership across teams. | Establishes release gates for model/prompt/data/runtime changes and separates quality regressions from platform incidents. |
| **Data and evaluation** | Uses product and operational metrics correctly; validates instrumentation. | Curates representative datasets; measures retrieval and end-task behavior; validates graders against human labels; performs slice/error analysis. | Creates a measurement strategy that changes roadmap decisions across teams. | Creates evaluation governance, dataset lineage, contamination controls, and online/offline feedback loops across products. |
| **Safety and security** | Threat-models the service; applies identity, authorization, least privilege, privacy, and abuse controls. | Adds prompt-injection and data-exfiltration defenses, constrained tools, output validation, human approval, and adversarial evals. | Establishes cross-team security/privacy standards and risk ownership. | Defines capability/use-case risk tiers, safety cases, red-team/eval gates, monitoring, incident paths, and evidence for deployment decisions. |
| **Product judgment** | Connects technical choices to user outcome and opportunity cost. | Knows when a deterministic workflow beats an LLM, when to retrieve/fine-tune/use tools, and when to abstain. | Resolves platform-versus-product and local-versus-global trade-offs. | Balances capability, task success, trust, latency, cost, and domain risk; avoids model novelty without user value. |
| **Collaboration** | Leads a project, mentors, gives useful review, and handles cross-functional dependencies. | Works fluently with product, design, domain experts, data/ML, security, and infrastructure. | Aligns multiple teams and leaders without relying on reporting authority. | Aligns research, product, data, safety, legal/domain, and infrastructure around evidence and release gates. |
| **Leadership output** | Leaves a healthier subsystem and more capable teammates. | Leaves a reusable eval/data/observability loop, not a one-off demo. | Leaves a durable strategy, mechanisms, adoption, and successor owners. | Leaves a platform and operating model that compounds learning as models and products change. |

### Senior readiness test

**PRACTICE.** You can show one recent example where you:

1. Discovered or clarified an ambiguous problem.
2. Wrote the success metric and non-goals before implementation.
3. Made a consequential design trade-off.
4. Shipped safely and owned production behavior.
5. Changed course after evidence or feedback.
6. Improved another engineer's output or the team's mechanism.

For AI engineering, add representative evaluation data, transcript/error analysis, and explicit latency/cost/safety results.

### Staff readiness test

**PRACTICE.** You can show two or more examples where your work:

- crossed team boundaries and a six-month-or-longer horizon;
- changed other teams' roadmaps or technical decisions;
- established an adopted interface, platform, quality bar, or operating mechanism;
- resolved a conflict among local speed, global leverage, user value, reliability, and risk;
- produced measurable organization-level results; and
- created owners and successors rather than permanent dependence on you.

For Staff AI engineering, include how you made uncertainty measurable and how your evaluation or safety evidence governed a release.

## 5. Daily work and engineering norms

### Representative weekly allocation

The percentages below are **INFERENCE**, not company survey results. Use them to ask sharper team questions.

| Work | Senior SWE | Senior AI engineer | Staff SWE | Staff AI engineer |
|---|---:|---:|---:|---:|
| Implementation, debugging, review | 45–60% | 35–50% | 20–35% | 20–35% |
| Design, experiments, evaluation, analysis | 15–25% | 25–40% | 20–30% | 25–40% |
| Product/customer/operational work | 10–20% | 15–25% | 10–20% | 15–25% |
| Alignment, mentoring, roadmap | 10–20% | 10–20% | 30–45% | 25–40% |

Do not optimize for these numbers. A launch, incident, model evaluation, or strategy cycle can dominate a week. The more useful interview question is: “Which recurring decisions is this role accountable for, and what evidence closes each decision?”

### Representative decision queue by environment

These are **INFERENCE** from the public mechanisms and roles, not observed time diaries.

| Environment | Senior engineer's recurring work | Staff engineer's recurring work |
|---|---|---|
| Meta | Review and land diffs; debug metrics or production behavior; coordinate an experiment; decide staged exposure; resolve an on-call or capacity issue; unblock a product/data/infra partner. | Review designs across teams; choose a common mechanism; negotiate roadmap/capacity; inspect organization-level quality or efficiency signals; sponsor a risky rollout; mentor project leads and create adoption. |
| Google | Draft/review a design; implement and review CLs; define tests and SLOs; prepare a launch/canary; investigate reliability or data/ML behavior; mentor through review. | Set architecture and interfaces; reconcile several roadmaps; lead design/readiness review; make error-budget/capacity trade-offs; resolve stakeholder disagreement; measure adoption and long-term system health. |
| Frontier/fast | Prototype a capability; build or repair an eval; inspect agent/model traces; harden inference/data/observability; run an experiment; handle a safety or reliability edge case. | Decide research-to-product bets; allocate compute/data/engineering; define evaluation and safeguard gates; establish shared runtime/platform primitives; lead a high-uncertainty incident or launch decision. |
| Applied AI | Observe a domain workflow; curate cases with users/experts; debug retrieval/agent traces; ship the product integration; tune quality/latency/cost; handle permissions or support feedback. | Define the common agent/eval/context/data platform; choose model/provider strategy; align customers and product teams; set domain quality/risk policy; drive migrations and adoption. |

### Design and review norms

| Stage | Evidence-backed baseline | AI-specific extension |
|---|---|---|
| **Problem framing** | State users, objective, constraints, success metrics, non-goals, alternatives, and owner. Google design-doc material supports collaborative trade-off records. [G02] | Define task distribution, failure cost, acceptable abstention/escalation, model/data dependencies, and eval plan before tuning. |
| **Design review** | Review interfaces, capacity, failure domains, security/privacy, migration, observability, rollout, and rollback. | Review tool permissions, prompt/data boundaries, provider/model fallbacks, context/memory lifecycle, judge validity, adversarial cases, and unit economics. |
| **Code review** | Small reviewable changes, tests, clarity, code health, prompt reviewer response. Meta and Google both publicly document mandatory review. [M01, G03–G05] | Version prompts, schemas, eval sets, model/routing configuration, and data transformations; require behavior diffs alongside code diffs. |
| **Pre-production** | Automated tests, load/failure testing, production-readiness review proportional to risk. [G06–G10, M03–M06] | Frozen regression set; human-calibrated graders; prompt-injection/abuse suite; privacy/permission checks; latency/cost and provider-failure tests. |
| **Deployment** | Canary, staged exposure, feature control, monitoring, stop/rollback path. [M02, G06, G09] | Shadow traffic where lawful, model/prompt/data canaries, per-slice quality guardrails, fallback model or deterministic path, human escalation. |
| **Operations** | SLOs/error budgets, traceable releases, incident response, blameless learning, owned follow-ups. [G06–G10, M05–M06] | Trace/replay with privacy controls; task success and safety monitors; drift and feedback review; separate model-behavior, data, provider, and platform incident classes. |

### The AI change unit

**INFERENCE.** A code diff is necessary but not sufficient. A production AI change can include prompt/template, system policy, tool schema, model/version, router, retrieval index or embedding model, chunking, context assembly, memory policy, data filter, grader, and serving parameters. Treat that bundle as a versioned, reproducible release unit. A useful review shows:

- intended behavior change and affected user slices;
- code/config/data lineage;
- offline result with confidence or uncertainty, not one aggregate score;
- representative before/after transcripts and failure clusters;
- latency, throughput, and cost deltas;
- security/privacy/safety result;
- canary guardrails and rollback compatibility.

## 6. Portfolio: four projects that prove the competencies

Every project should have a public-safe repository, a two-page case study, a short demo, a six-to-ten-page design document, an evaluation report, and an operations artifact. Synthetic or licensed data is acceptable; never expose employer or customer information.

### Project 1 — Permission-aware evidence assistant

**Goal.** Answer questions over a changing 1,000+ document corpus with citations and document-level access controls.

**Build.** Ingestion with versioned provenance; BM25 plus dense retrieval; reciprocal-rank fusion; reranking; metadata/ACL filters; contextual chunk augmentation; citation-linked generation; freshness and deletion handling; deterministic fallback. Compare plain RAG, hybrid retrieval, contextual retrieval, and a long-context baseline rather than assuming one wins. [C08, C14–C18]

**Evaluation.** Create at least 150 queries stratified by answerability, recency, permissions, multi-hop need, and adversarial content. Measure Recall@k, nDCG/MRR where appropriate, citation precision/recall, answer correctness/groundedness, abstention quality, permission leakage, p50/p95 latency, and cost per accepted answer. Validate LLM judges against a human-labeled sample and report disagreement. [C12–C13, A05–A06]

**Senior evidence.** A reliable end-to-end product with dashboards, runbook, staged release, and post-launch error review.

**Staff extension.** Make retrieval, evaluation, and policy components reusable by two distinct applications; write an adoption/migration plan and measure developer or product leverage.

### Project 2 — Durable action agent

**Goal.** Complete a real multi-step workflow—such as support resolution or repository maintenance—through typed tools with recoverable state.

**Build.** Explicit state machine; typed tool schemas; idempotency keys; deadlines and retry budgets; checkpoint/resume; deterministic policy layer; context compaction; session versus durable memory; TTL/invalidation; least-privilege credentials; sandbox and network allowlist; human approval for irreversible actions; trace/replay. Begin with a single agent, and add subagents only after evaluation demonstrates a gain. [F02–F06, C06–C10]

**Evaluation.** Use at least 100 tasks with easy/hard, long-horizon, tool-failure, ambiguous, malicious-content, and permission-boundary slices. Report task success, pass@k or pass^k as appropriate, steps/tool calls, recovery rate, human interventions, unsafe-action rate, latency, and cost per successful task. Inspect transcripts and publish a failure taxonomy.

**Senior evidence.** A working, observable agent with safe failure and measurable improvement over a deterministic or simpler-agent baseline.

**Staff extension.** A reusable runtime and evaluation contract adopted by a second workflow, plus a risk tier and release-gate proposal.

### Project 3 — Inference and reliability lab

**Goal.** Serve an open-weight model under an explicit quality, latency, throughput, and cost objective.

**Build.** Reproducible load generator; vLLM or another documented engine; continuous batching; prefix/KV-cache experiments; quantization; speculative decoding; autoscaling; overload/load shedding; multi-zone or simulated failover; canary and rollback. Do not claim GPU expertise from a notebook—operate a service. [C11, C19–C24]

**Evaluation.** Report time to first token, inter-token latency, output tokens/sec, request throughput, p50/p95/p99, queue time, GPU utilization, out-of-memory rate, quality delta, cold start, recovery time, and dollars per successful task. Plot concurrency sweeps and identify the saturation knee.

**Senior evidence.** Meet a stated SLO under load and explain failure behavior and cost.

**Staff extension.** Write a capacity and multi-tenant policy, model/provider routing strategy, and build-versus-buy decision; demonstrate how it serves two workload classes.

### Project 4 — Staff technical-leadership packet

**Goal.** Turn one project into an organizational change proposal.

**Deliver.** A six-to-ten-page RFC with user/business objective, evidence, alternatives, architecture, data and threat model, dependency map, cost/capacity model, rollout/rollback, risk register, and decision log; a two-quarter roadmap; stakeholder map; adoption and migration plan; success/dashboard definition; incident exercise and postmortem; mentoring or enablement plan.

**PRACTICE.** Have two experienced engineers challenge the RFC. Record the objections, what evidence would reverse your decision, and the changes made. Staff judgment is visible in how the proposal improves under disagreement.

## 7. Twenty-week build curriculum

The plan assumes 10–12 focused hours per week. If time is constrained, reduce project breadth but keep evaluation and operations depth.

| Week | Focus | Required artifact and exit criterion |
|---:|---|---|
| 1 | Target and baseline | Select one company type and two role descriptions; build an evidence matrix. Complete two timed coding baselines and one system design. |
| 2 | Sustainable SWE | Read Google design/review/SRE selections and Meta review/release sources. Write a design doc template, SLO, rollout, and rollback for Project 1. |
| 3 | Retrieval baseline | Build ingestion, provenance, BM25, dense retrieval, and a simple answer path. Version the corpus and queries. |
| 4 | Advanced retrieval | Add hybrid fusion, reranking, metadata/ACL filters, and a long-context baseline. Report per-slice retrieval metrics. |
| 5 | RAG behavior | Add contextual augmentation/citations/abstention. Label at least 75 queries and publish the first error taxonomy. |
| 6 | RAG production | Reach 150+ cases; validate graders with humans; load test; run a canary simulation; finish Project 1 case study. |
| 7 | Agent baseline | Build a single-agent tool loop with typed schemas, explicit state, idempotency, timeouts, and trace/replay. |
| 8 | Context and memory | Implement compaction plus session/durable memory; define write/read/delete/TTL policies; measure long-task effects. |
| 9 | Agent reliability | Inject tool, network, stale-state, duplicate-action, and provider failures; add checkpoint/resume and deterministic fallback. |
| 10 | Agent safety | Add least privilege, human approval, prompt-injection/data-exfiltration tests, sandbox/egress policy, and audit log. |
| 11 | Agent evaluation | Reach 100+ tasks; choose pass@k/pass^k correctly; validate graders; inspect traces; decide with evidence whether subagents help. |
| 12 | Serving baseline | Deploy an open model; measure TTFT, inter-token latency, throughput, queue time, memory, quality, and cost across concurrency. |
| 13 | Serving optimization | Test batching, prefix caching, quantization, and one speculative method. Explain quality and capacity trade-offs. |
| 14 | Production inference | Add autoscaling, overload control, canary/rollback, failover exercise, SLO, alerts, and runbook. |
| 15 | MLOps and data | Build lineage and change manifests for code/prompt/model/retrieval/eval data; add drift/freshness checks and reproducibility. |
| 16 | Evaluation governance | Define release gates, judge-validation policy, contamination controls, online/offline feedback, slice ownership, and escalation. |
| 17 | Product judgment | Conduct five user/domain interviews or realistic simulations. Re-rank the roadmap by failure cost and user value; delete one low-value feature. |
| 18 | Leadership | Complete the staff packet, dependency/stakeholder map, adoption plan, and adversarial design review. |
| 19 | Interview sprint I | Five timed coding sessions, two distributed-system designs, two AI designs, one project deep dive, and three behavioral stories with scored feedback. |
| 20 | Interview sprint II | Run two full mock loops targeted to chosen company types. Close the weakest rubric area; package demos, case studies, and evidence index. |

### Reading-to-building map

| Topic | Start with | Demonstrate, do not merely summarize |
|---|---|---|
| Agents | Anthropic agent/eval/context material; OpenAI practical guide; ReAct; METR long-task research. [F02–F06, C06–C07, R05–R06] | Simplicity baseline, recoverable state, typed tools, trace inspection, task-level eval, safe action boundary. |
| Advanced RAG | Original RAG, Self-RAG, RAPTOR, GraphRAG, contextual retrieval, long-context comparison. [C08, C14–C18] | Hybrid/reranked retrieval, ACL/freshness, citations, baseline comparison, retrieval and answer-level slices. |
| Context and memory | Lost in the Middle, MemGPT, LongMemEval, Anthropic context engineering. [C09–C10, C25, F04] | Explicit memory semantics, compaction, invalidation/deletion, long-horizon evaluation, privacy boundary. |
| Evals | Anthropic eval guide, LLM-judge validity work, LiveBench, Glean practitioner examples. [F03, C12–C13, A05–A06] | Representative tasks, validated graders, transcript review, uncertainty, slice regressions, release gates. |
| Serving | vLLM, DeepMind scaling book, BentoML inference handbook, Ultra-Scale Playbook. [C11, C19–C24] | Saturation curve, tail latency, memory/capacity model, quality/cost trade-off, overload and rollback. |
| Safety | NIST AI 600-1, OWASP GenAI Top 10, company frontier governance as examples. [S01–S04, F07, F12] | Threat model, tool/data permissions, adversarial eval, human gates, monitoring, incident and rollback path. |
| MLOps/data | Rules of ML, ML Test Score, hidden debt, data cascades. [G11–G13, G18] | Lineage, reproducibility, training/serving or offline/online skew checks, freshness, data quality ownership. |
| Distributed systems | Google SRE release/risk/toil/canary/readiness; Meta production practice. [G06–G10, M02–M06] | SLO/error budget, failure domains, capacity, idempotency, consistency trade-offs, canary, incident exercise. |
| Product judgment | Current applied-AI roles and the public competency ladders. [A01–A06, L01–L05] | Real workflow, failure cost, metric tree, opportunity cost, adoption evidence, reason to choose deterministic over AI where appropriate. |
| Leadership | Dropbox/GitLab frameworks and StaffEng archetypes. [L01–L07] | Strategy, alignment, decision record, adopted mechanism, conflict handling, successors, measurable organizational result. |

## 8. Interview curriculum and scorecards

### A role-neutral loop to practice

Public employer processes change. This is a **PRACTICE** loop, not a claim about any one employer's exact interviews.

1. **Coding (45 minutes).** Clarify, design, implement, test, analyze complexity, and revise. Include a data-processing or concurrency variant for AI/platform roles.
2. **Distributed-system design (60 minutes).** Requirements and SLOs; API/data model; scale estimate; architecture; consistency/failure modes; security; observability; deployment; cost.
3. **AI-system design (60 minutes).** User task and failure cost; baseline; data; model/retrieval/tools; context/memory; eval; serving; safety; launch and feedback.
4. **Project deep dive (60 minutes).** One diagram and one metric tree; show decisions, failure evidence, production result, and personal contribution. Staff candidates must show adoption beyond the immediate team.
5. **Product/evaluation case (45 minutes).** Given poor model behavior, form hypotheses, design slices and graders, inspect examples, prioritize fixes, and define a release decision.
6. **Leadership/behavioral (45 minutes).** Ambiguity, conflict, failure, influence without authority, mentoring, ethical/risk escalation, and a decision reversed by evidence.

### Target-specific weighting

| Target | Overweight in preparation | Evidence to bring |
|---|---|---|
| Meta | Timed coding fluency; scale/product design; rapid but controlled delivery; impact narrative. Verify format from Meta's current official prep page. [M10] | One high-throughput product or infra result with staged rollout, production metric, and cross-functional influence. |
| Google | Code clarity; durable design; distributed systems; SRE mechanisms; written trade-offs. AI roles add the full ML/GenAI lifecycle. [G01–G17] | Reviewed design, operational result, mentoring example; for staff, a multi-team roadmap and interface/adoption story. |
| Frontier/fast | Research-to-production depth; agent/eval/serving/safety; speed under ambiguity; failure investigation. | Working artifact, empirical report, high-signal code, independent writing/OSS, and a safety/reliability decision. |
| Applied AI | Workflow discovery; domain risk; RAG/agents/evals; permissions; customer/product judgment; unit economics. | Customer-shaped eval set, traceable answers/actions, quality-latency-cost metric, and adoption or realistic pilot evidence. |

### Scoring rubric

Score each dimension 1–4 after every mock; require at least 3 in all dimensions and 4 in two target-critical dimensions.

| Dimension | 1 — weak | 2 — partial | 3 — senior-ready | 4 — staff signal |
|---|---|---|---|---|
| Problem framing | Starts building without success criteria. | Clarifies basics but misses failure cost or constraints. | Defines users, metric, constraints, non-goals, and milestones. | Reframes the problem and aligns multiple stakeholders around the right outcome. |
| Technical depth | Names tools without mechanisms. | Designs happy path with shallow trade-offs. | Explains mechanisms, alternatives, failures, and operability. | Connects layers, anticipates second-order effects, and creates a reusable direction. |
| Evidence/evaluation | Shows anecdotes or one aggregate score. | Has tests but weak representativeness or grader validity. | Uses baselines, slices, calibrated evaluation, and error analysis. | Builds an evaluation system that governs multiple teams' decisions. |
| Delivery/reliability | Demo only. | Basic deployment, limited failure handling. | SLO, observability, staged rollout, rollback, runbook, and post-launch learning. | Establishes mechanisms that improve org-wide delivery or reliability. |
| Product judgment | Maximizes model novelty. | Connects to a feature but not opportunity cost. | Balances user value, failure cost, trust, latency, and cost. | Changes roadmap/investment using user and system evidence. |
| Leadership | Describes team work with unclear contribution. | Coordinates assigned dependencies. | Leads ambiguity, mentors, resolves conflict, and owns outcome. | Influences multiple teams, creates adoption/successors, and makes strategy real. |

### Six-week interview overlay

Run this beside weeks 15–20 or after completing two projects.

- **Every week:** three timed coding problems, one distributed-system design, one AI-system design, one project/behavioral recording, and one feedback session.
- **Week 1:** baseline against the rubric; select the two lowest dimensions.
- **Week 2:** APIs/data models, estimation, caches/queues, consistency/idempotency, and failure domains.
- **Week 3:** RAG/agent/context design with eval datasets and grader validation.
- **Week 4:** serving, capacity, tail latency, data/MLOps, safety, and incident scenarios.
- **Week 5:** staff-only emphasis on strategy, disagreement, migration, adoption, and organizational trade-offs.
- **Week 6:** two target-specific mock loops; update stories and portfolio only from observed misses.

## 9. Questions that reveal the real role

Ask these of the recruiter, hiring manager, and prospective peers. Differences between answers are informative.

1. What recurring decisions does this role own in its first six months?
2. What is the smallest and largest expected scope: service, product surface, team, or several teams?
3. Which current problem is ambiguous because of technology, product, data, organization, or all four?
4. What artifact starts major work: design doc, experiment proposal, customer brief, or something else? Who approves it?
5. What must be true before a code, prompt, model, retrieval, or data change reaches users?
6. Which metrics are release gates, and who owns the evaluation set and grader validity?
7. How are model-quality regressions distinguished from data, provider, and platform incidents?
8. What are the on-call, incident, and postmortem expectations?
9. Which platform is strong, and where must this team build missing infrastructure?
10. For staff: which teams must adopt the work, what authority does the role have, and how is influence assessed?
11. What did a recent excellent senior/staff engineer do that made them excellent? Ask for observable behavior, not adjectives.
12. What trade-off would cause the team to choose a simpler deterministic system over an agent?

## 10. Choosing a track

Score each opportunity 1–5 using evidence from conversations, not brand assumptions.

| Criterion | Why it matters |
|---|---|
| Problem fit | You care about the actual recurring decisions, not only the company's category. |
| Scope clarity | The expected ownership and time horizon match senior or staff growth. |
| Evidence culture | The team has trustworthy product/eval/operational feedback and acts on it. |
| Engineering substrate | Tests, deployment, observability, data, and platform help rather than hide quality. |
| AI depth | The role touches the desired layers: workflow, agents/RAG/evals, data, models, serving, or safety. |
| Product/customer access | Engineers can observe real workflows and failure costs. |
| Leadership surface | There is a real cross-team problem and a credible path to adoption. |
| Risk integrity | Permissions, privacy, safety, incidents, and rollback have named owners. |
| Learning density | Strong peers, direct feedback, and challenging but supportable scope. |
| Sustainability | Pace, on-call, location, travel, and management expectations are workable for you. |

**INFERENCE.** Prefer the role with the strongest learning-and-impact loop, not the most fashionable title. A senior role with end-to-end ownership can build more staff evidence than a staff title whose scope is narrow or whose platform prevents learning.

## 11. Measuring AI-assisted engineering honestly

Use AI tools, but instrument the work.

**PRACTICE.** For four weeks, classify tasks before starting (familiar/unfamiliar, local/systemic, low/high verification cost) and compare paired or alternating AI-assisted work where feasible. Track:

- elapsed and active completion time;
- review iterations and reviewer minutes;
- tests or evaluation cases added;
- escaped defects, rollback, and rework;
- delivery lead time and deployment stability;
- task/product outcome;
- where the model was wrong and the cost of discovering it.

Do not treat generated lines, accepted completions, or self-reported time saved as the outcome. DORA and METR together justify a cautious conclusion: capability is moving, but realized productivity depends on task, tool, user experience, codebase, verification, and the surrounding delivery system. [R01–R06]

## 12. Safety baseline for projects and interviews

NIST AI 600-1 organizes GenAI risk management across the lifecycle; OWASP's GenAI material provides application-level failure patterns; frontier-company frameworks illustrate capability-based governance. [S01–S04, F07, F12] Convert those into engineering evidence:

1. **Map:** users, affected non-users, data, models/providers, tools, trust boundaries, downstream actions, and credible misuse.
2. **Measure:** ordinary and adversarial task suites; disaggregated performance; privacy/security tests; grader limitations; uncertainty and residual risk.
3. **Manage:** least privilege, authentication/authorization independent of the model, data minimization, sandbox/egress controls, output/action validation, human approval, rate/financial limits, fallback and shutdown.
4. **Govern:** named risk owner, decision record, release criteria, independent review proportional to harm, audit/replay policy, monitoring, incident reporting, and periodic re-evaluation.

For ordinary applied systems, do not substitute frontier catastrophic-risk language for concrete application security. Prompt injection matters because it can cross a trust boundary; the control is not a stronger system prompt alone.

## 13. Evidence index

The complete, machine-readable ledger is [catalog/industry-codex.tsv](catalog/industry-codex.tsv). The curated annotations and access notes are in [catalog/industry-codex.md](catalog/industry-codex.md).

### Google

- **G01–G05:** [Software Engineering at Google](https://abseil.io/resources/swe-book), [design documents](https://abseil.io/resources/swe-book/html/ch10.html), [engineering culture/readability](https://abseil.io/resources/swe-book/html/ch03.html), [Google engineering practices: review](https://google.github.io/eng-practices/review/), and [the code-review standard](https://google.github.io/eng-practices/review/reviewer/standard.html).
- **G06–G10:** Google SRE on [release engineering](https://sre.google/sre-book/release-engineering/), [embracing risk](https://sre.google/sre-book/embracing-risk/), [eliminating toil](https://sre.google/sre-book/eliminating-toil/), [canarying](https://sre.google/workbook/canarying-releases/), and the [production-readiness engagement model](https://sre.google/sre-book/evolving-sre-engagement-model/).
- **G11–G13, G18:** [Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml), [ML Test Score](https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/), [Hidden Technical Debt](https://research.google/pubs/hidden-technical-debt-in-machine-learning-systems/), and [Data Cascades](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/).
- **G14–G17:** [Google career search](https://www.google.com/about/careers/applications/jobs/results), sampled [Staff SWE, ML, Google Chat](https://www.google.com/about/careers/applications/jobs/results/115305015559496390-staff-software-engineer-machine-learning-google-chat), sampled [Staff SWE, GenAI Core ML](https://www.google.com/about/careers/applications/jobs/results/103225342730085062-staff-software-engineer-generative-ai-core-machine-learning), and [How we hire](https://www.google.com/about/careers/applications/how-we-hire/).

### Meta

- **M01–M04:** [Code-review time](https://engineering.fb.com/2022/11/16/culture/meta-code-review-time-improving/), [rapid release at scale](https://engineering.fb.com/2017/08/31/web/rapid-release-at-massive-scale/), [Fix Fast](https://engineering.fb.com/2021/02/17/developer-tools/fix-fast/), and [predictive test selection](https://engineering.fb.com/2018/11/21/developer-tools/predictive-test-selection/).
- **M05–M09:** [Production Engineering](https://engineering.fb.com/2025/01/21/production-engineering/), [maintaining AI capacity](https://engineering.fb.com/2024/06/12/production-engineering/maintaining-large-scale-ai-capacity-meta/), [AI agents for capacity efficiency](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/), [AI storage at scale](https://engineering.fb.com/2026/07/01/data-infrastructure/metas-ai-storage-blueprint-at-scale/), and [AI for incident response](https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/).
- **M10–M11:** [official SWE full-loop prep](https://www.metacareers.com/careers/SWE-prep-onsite) and [Meta AI careers](https://www.metacareers.com/teams/technology?tab=AI).

### Frontier and applied AI

- **F01–F07:** [Anthropic careers](https://www.anthropic.com/careers), [building effective agents](https://www.anthropic.com/engineering/building-effective-agents), [agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system), [long-running agent harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), and [Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy).
- **F08–F12:** [OpenAI Applied AI career search](https://openai.com/careers/search/?c=applied-ai), [Enterprise AI Platform role](https://openai.com/careers/software-engineer-enterprise-ai-platform-san-francisco/), [Developer Productivity role](https://openai.com/careers/software-engineer-developer-productivity-san-francisco/), [Infrastructure Reliability role](https://openai.com/careers/software-engineer-infrastructure-reliability-london-uk/), and [Preparedness Framework](https://openai.com/index/updating-our-preparedness-framework/).
- **A01–A04:** Harvey [AI Platform](https://www.harvey.ai/company/careers/51fb953a-c494-4a09-8fe2-8d7268b863ec), [Agents](https://www.harvey.ai/company/careers/04eb457b-e985-4e3b-9635-0a2b867ada97), and [SRE](https://www.harvey.ai/company/careers/c9cea360-f0b6-4a93-b7b3-0f0145b02ffe) roles; [Sierra careers](https://sierra.ai/careers).
- **A05–A06:** Glean on [AI evaluation](https://www.glean.com/blog/glean-ai-evaluator) and [enterprise agent evaluation](https://www.glean.com/blog/enterprise-agent-evaluation-guide).

### Career calibration, research, and standards

- **L01–L07:** [Dropbox career framework](https://dropbox.github.io/dbx-career-framework/), its [IC4 SWE](https://dropbox.github.io/dbx-career-framework/ic4_software_engineer.html), [IC5 Staff SWE](https://dropbox.github.io/dbx-career-framework/ic5_staff_software_engineer.html), [IC4 MLE](https://dropbox.github.io/dbx-career-framework/ic4_machine_learning_engineer.html), and [IC5 Staff MLE](https://dropbox.github.io/dbx-career-framework/ic5_staff_machine_learning_engineer.html) pages; [GitLab engineering career matrix](https://handbook.gitlab.com/handbook/engineering/careers/matrix/); and [Staff Engineer archetypes](https://staffeng.com/guides/staff-archetypes/).
- **R01–R06:** [DORA 2025](https://dora.dev/research/2025/dora-report/), [METR early-2025 randomized study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [METR 2026 uplift update](https://metr.org/blog/2026-02-24-uplift-update/), [METR 2026 usage survey](https://metr.org/blog/2026-05-11-ai-usage-survey/), the [original long-task study](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/), and its [Time Horizon 1.1 update](https://metr.org/blog/2026-1-29-time-horizon-1-1/).
- **S01–S04:** [NIST AI 600-1](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence), [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/), [OpenAI Frontier Governance Framework](https://openai.com/index/openai-frontier-governance-framework/), and [Anthropic Frontier Safety Roadmap](https://www.anthropic.com/responsible-scaling-policy/roadmap).

### Curriculum sources

- **C01–C06:** Chip Huyen's commercial [*AI Engineering*](https://www.oreilly.com/library/view/ai-engineering/9781098166298/) and [official companion](https://github.com/chiphuyen/aie-book); [Google DeepMind scaling book](https://jax-ml.github.io/scaling-book/); [BentoML LLM inference handbook](https://bentoml.com/llm/); [Hugging Face Ultra-Scale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook); and OpenAI's [practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf).
- **C07–C13:** local open papers: ReAct, Self-RAG, MemGPT, LongMemEval, vLLM/PagedAttention, Who Validates the Validators, and LiveBench. Canonical URLs and local paths are in the TSV catalog.
- **C14–C25:** additional retrieval, context, serving, and post-training papers in the existing library, cataloged with canonical open-access links.

## 14. Final portfolio checklist

Before using a project as senior/staff evidence, verify:

- [ ] The user problem, success metric, baseline, constraints, and non-goals are explicit.
- [ ] The design records alternatives, failure modes, data boundaries, security/privacy, capacity/cost, and rollback.
- [ ] Code, configuration, prompt, model, retrieval, and evaluation changes are versioned and reviewable.
- [ ] Evaluation cases are representative and sliced; graders are validated; transcripts and errors were inspected.
- [ ] Latency, throughput, cost, reliability, and safety are measured with an operating threshold.
- [ ] The system was staged, observed, and exercised under failure; a runbook and incident/postmortem artifact exist.
- [ ] Product learning changed a roadmap or design decision.
- [ ] Personal contribution is distinguishable from team output.
- [ ] Senior claim: meaningful end-to-end outcome plus mentoring/mechanism improvement.
- [ ] Staff claim: cross-team strategy, adoption, durable mechanism, and successor owners.

The best guide to the target role is not a rumored ladder. It is a body of work showing that you can repeatedly make consequential, evidence-based decisions at the scope the role requires.
