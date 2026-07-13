# AI Engineering Mastery Roadmap (mid-2026 edition)

Synthesized 2026-07-13 from a multi-model research sweep across foundations, agents,
RAG, context engineering, inference/post-training, evals, systems, safety, and industry
roles. Downloaded material follows `SOURCE-POLICY.md`; provenance and hashes live in
`catalog/`.

## The one-paragraph thesis

The job has moved twice: "prompt engineer" (2023) → "AI engineer" (2024) → **agent engineer**
(2025–26). The differentiating skills are no longer prompting or even model knowledge — they are
**(1) eval design, (2) context engineering, (3) agent-harness design, and (4) systems literacy**
(cost/latency math, serving, post-training). The system around the model is the artifact.
Everything below is sequenced to build exactly those four.

---

## Job-aligned fast path for `series-agent-service`

Before following the full foundation-to-frontier sequence, use
`JOB-ALIGNED-LEARNING-PATH.md`. It maps the current codebase to a 16-week execution
track across:

- LangGraph checkpointing, replay, interrupts, subgraphs, and safe side effects;
- model, tool, thread, domain, retrieval, and cache context boundaries;
- Pydantic AI, Google ADK, LangChain, and OpenAI Agents SDK comparison work;
- Kafka delivery semantics, DLQs, replay, backpressure, and transactional idempotency;
- Redis leases/caching, Postgres transactions/outbox, pgvector recall, and Temporal;
- recommender candidate generation, ranking, reranking, feedback, and evaluation.

The 18 primary papers for this overlay are in `papers/distributed-systems/` and
`papers/recommender-systems/`. Official framework source is pinned in
`framework-code/`. Build the weekly artifacts while using the broader phases below as
references; do not postpone production exercises until every theory chapter is read.

---

## Phase 0 — Foundations (skip what you already know)

Goal: whiteboard attention, backprop, and the basic training loop from memory.

1. `books/mathematics-for-machine-learning.pdf` — only the chapters you're shaky on (linear algebra, probability, optimization).
2. `books/understanding-deep-learning-prince.pdf` — the primary modern text. Chapters on transformers are mandatory; skim classic CNN/RNN material.
3. `books/the-little-book-of-deep-learning-fleuret.pdf` — read in full (it's ~160 pages); use it forever as review.
4. Code-first reinforcement: `books/dive-into-deep-learning-d2l.pdf` + run its attention/transformer notebooks.
5. Use `books/probabilistic-machine-learning-introduction.pdf` as the rigorous reference
   behind concepts you do not yet understand; do not try to read all 860 pages linearly.
6. Read `books/patterns-predictions-actions.pdf` for the bridge from prediction to causal
   and sequential decision-making.

Note: Goodfellow (2016) is now background reading only. Prince (updated Feb 2026) and Bishop's
bishopbook.com are the transformer-native replacements.

## Phase 1 — LLM theory + the canon papers

Goal: understand how LLMs are trained, aligned, and served, end to end.

1. `books/foundations-of-large-language-models.pdf` — fastest complete treatment (~230 pp).
2. `books/speech-and-language-processing-slp3-draft.pdf` — the LLM/post-training/speech chapters.
3. The pre-2024 canon in `papers/foundations/` — read once for concepts, be able to whiteboard all of them:
   - Attention Is All You Need → GPT-3 → Scaling laws (Kaplan) → Chinchilla → InstructGPT (RLHF) → Chain-of-Thought → Constitutional AI → LLaMA → DPO
4. The 2024–26 canon — treat these as living engineering references, not one-time reads:
   - `2024-deepseekmath-grpo.pdf` (GRPO), `2024-scaling-test-time-compute.pdf`, `2025-deepseek-r1-reasoning-rl.pdf`, `2023-mamba-ssm.pdf`, `2025-kimi-k2-agentic.pdf`, and `papers/inference-serving/2024-deepseek-v3-technical-report.pdf`.
   - The DeepSeek trilogy (Math → V3 → R1) is the closest thing to an open frontier-lab playbook; the ablations and "what failed" sections are the highest-value parts.
5. Key mental model: there are now **two scaling regimes** — pretraining scaling laws AND test-time compute. Inference-time compute allocation is a first-class engineering decision.

Hands-on (strongly recommended): work through `companion-code/llms-from-scratch/` and
`companion-code/reasoning-from-scratch/` — build a GPT and a small reasoning model end to end once.
Use `books/probabilistic-machine-learning-advanced-topics.pdf` as a reference for latent-variable,
deep generative, Bayesian, and sequential models.

## Phase 2 — Agents (the core 2026 skill)

Goal: build a full agent harness from scratch and understand why the harness matters as much as the model.

Read in order:
1. Anthropic, *Building Effective Agents* — https://www.anthropic.com/engineering/building-effective-agents (workflows vs agents; start simple)
2. `guides/openai-a-practical-guide-to-building-agents.pdf`
3. `books/2026-hitchhikers-guide-agentic-ai.pdf` — use the agent harness, RAG, memory,
   protocols, evaluation, and deployment chapters as a current reference.
4. Papers: `2022-react-reasoning-and-acting.pdf` → `2023-reflexion.pdf` → `2024-swe-agent.pdf` (the Agent-Computer Interface lesson) → `2025-metr-measuring-long-task-ability.pdf`.
5. Anthropic, *How We Built Our Multi-Agent Research System* — https://www.anthropic.com/engineering/multi-agent-research-system — multi-agent is a cost/parallelism tradeoff, not a default architecture.
6. MCP spec + docs — https://modelcontextprotocol.io — then Anthropic's *Code Execution with MCP*.
   Implement the versioned authorization requirements cataloged as `W01` in
   `catalog/additions-production.tsv`: discovery, PKCE where applicable, exact
   resource/audience binding, incremental scopes, token redaction, and rejection of
   cross-server tokens.
7. `2025-agentic-rl-landscape-survey.pdf` — how agentic RL training shapes what scaffolding you still need.
8. `books/2026-agentic-software-engineering.pdf` — a useful practitioner monograph on
   mission, coordination, capability, and trust engineering; treat its prescriptions as
   proposals to test, not peer-reviewed canon.

Build (portfolio artifacts):
- A ReAct-style loop + full harness by hand: tool loop, sandboxed execution, retries, permissions.
- One production-quality MCP server.
- A computer-use agent against OSWorld-style tasks (`2024-osworld-computer-use-benchmark.pdf`).

Free course: Berkeley CS294-280 Advanced LLM Agents (MOOC) — https://rdi.berkeley.edu/adv-llm-agents/sp25

## Phase 3 — Context engineering & memory

Goal: treat the context window as a scarce, degrading resource and manage it deliberately.

1. Anthropic, *Effective Context Engineering for AI Agents* — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
2. Manus lessons — https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus — **KV-cache hit rate is the #1 production metric for agents** (~10× cost/latency differences): stable prefixes, append-only context, mask tools instead of removing them.
3. LangChain's four operations (write / select / compress / isolate) — https://www.langchain.com/blog/context-engineering-for-agents — master one concrete implementation of each.
4. Failure modes: Drew Breunig's *How Long Contexts Fail* + Chroma's *Context Rot* research (all 18 frontier models degrade well before advertised limits; lost-in-the-middle persists — `papers/context-memory/2023-lost-in-the-middle.pdf`).
5. Memory systems: `2023-memgpt.pdf` (the OS-style hierarchy) → `2025-mem0.pdf` (pipeline-based) → `2025-zep-temporal-knowledge-graph.pdf` (graph-based). Learn one pipeline and one graph system deeply, including fact invalidation over time.
6. Frontier: `2025-agentic-context-engineering.pdf` (self-improving contexts) and `2025-recursive-language-models.pdf`; benchmark with `2024-longmemeval.pdf`.
7. Provider-native primitives: prompt caching + server-side compaction + memory tools (see Claude platform docs) — know when a custom layer still wins.
8. Run the examples in `companion-code/context-engineering/`, especially retrieval,
   tool, memory/state, observability, and governance exercises.

Agent-native patterns to internalize (from Claude Code / Manus): filesystem as unlimited memory,
NOTES.md-style structured notes that survive compaction, just-in-time retrieval over pre-loading,
sub-agents that return condensed summaries.

## Phase 4 — Advanced RAG & retrieval

Goal: own the routing decision (retrieval vs long-context vs grep/SQL/graph), not a religion.

1. Learn the substrate first: chapters 1–8 and 11–12 of
   `books/introduction-to-information-retrieval.pdf` (indexes, scoring, BM25, and IR eval),
   then `2020-rag-original.pdf` → `2023-rag-for-llms-survey.pdf`.
2. The proven production stack (cuts retrieval failures ~2/3): **hybrid dense+BM25 with rank fusion + contextual chunk augmentation + reranker**. Read Anthropic's *Contextual Retrieval* — https://www.anthropic.com/engineering/contextual-retrieval
3. The routing question: `2024-rag-vs-long-context.pdf` (Self-Route) + prompt-caching economics — targeted retrieval is 8–82× cheaper than million-token stuffing, but full-context is genuinely right for small static corpora.
4. Structural variants: `2023-self-rag.pdf`, `2024-raptor-recursive-abstractive.pdf`, `2024-graphrag-microsoft.pdf` (GraphRAG earned a permanent niche for global/sensemaking queries — treat as per-query routing).
5. The 2025–26 frontier: `2025-agentic-rag-survey.pdf` + `2025-search-r1.pdf` + `2025-agentic-deep-research.pdf` — RL-trained agentic search is how frontier systems retrieve now.
6. Embeddings: `2025-qwen3-embedding-reranking.pdf` + Weaviate's late-interaction overview (ColBERT/ColPali — embed PDF pages as images, skip OCR). Learn dense vs multi-vector vs sparse tradeoffs.
7. Chunking is empirical, not folklore: Chroma's chunking eval research — simple ~200–400-token recursive chunks often match fancy semantic chunking. Measure recall on your own golden set.
8. For multimodal retrieval and visual agents, compare the unified early-fusion design
   in `papers/multimodal-data/2024-chameleon-mixed-modal-early-fusion.pdf` with the
   dynamic-resolution, document, video, grounding, and agent design in
   `2025-qwen2-5-vl-technical-report.pdf`. Build modality-specific eval slices rather
   than treating vision-language quality as one score.

Portfolio artifact: one system combining hybrid retrieval + contextual augmentation + reranking
exposed as agent tools, over text AND PDF-image corpora, with GraphRAG for global questions, and
an eval suite gating every change. That covers essentially the whole 2026 frontier.

For recommendation and personalization work, continue from IR into
`papers/recommender-systems/`: YouTube two-stage retrieval/ranking → Wide & Deep →
sampling-bias-corrected two-tower retrieval → DLRM → DCN V2 → Monolith → TIGER →
HSTU. Use Google's course at
https://developers.google.com/machine-learning/recommendation and keep candidate
generation, scoring, and policy reranking as separately measured stages.

## Phase 5 — Evals & production (the most valuable applied skill)

Goal: evals are the bottleneck, the differentiator, and increasingly what interviews test.

1. `books/machine-learning-yearning.pdf` for disciplined error analysis, then
   `guides/hamel-llm-evals-faq.pdf` + applied-llms.org (*What We've Learned From a Year of Building with LLMs*).
2. The 2025–26 practitioner consensus: **error analysis first, infrastructure second** — read 20–50 real traces, open-code failure modes, derive binary pass/fail judgments. Generic metrics (ROUGE, cosine similarity, 1–5 Likert) are usually poor defaults for product evals unless you first validate them against the behavior users care about.
3. LLM-as-judge as its own ML system: `2023-llm-as-judge-mtbench.pdf` → `2024-llm-as-judge-survey.pdf` → `2024-who-validates-the-validators.pdf` → `2025-preference-leakage-contamination.pdf`. Validate judges against expert-labeled sets (TPR/TNR, not vibes).
4. Agent evals (the frontier): Anthropic's *Demystifying Evals for AI Agents*; grade outcomes not trajectories; pass^k reliability; evals wired into CI.
5. Benchmarks are contaminated by default: `2025-benchmark-contamination-survey.pdf`, `2024-livebench.pdf` — your product-specific evals matter more than any leaderboard.
6. Production: OpenTelemetry GenAI semantic conventions (traces as the unit of analysis), guardrails (inline, fast, high-precision — OWASP LLM Top 10) vs evaluators (async, sampled), continuous judge-scoring of production traffic.
7. Cost/latency: think in TTFT / time-per-output-token / throughput; stack batching + quantization + caching + speculative decoding + routing — naive vs optimized serving differs 5–10×.
8. Turn `papers/production-systems/2017-ml-test-score.pdf`,
   `2019-data-validation-for-machine-learning.pdf`, and
   `guides/production/2021-google-practitioners-guide-to-mlops.pdf` into an actual
   release-readiness checklist, data contract, change manifest, drift monitor, and
   rollback exercise. Do not use the ML Test Score as a vanity aggregate.

Safety and governance are part of production quality: read
`books/fairness-and-machine-learning.pdf`, `papers/industry-career/2024-nist-ai-600-1-generative-ai-profile.pdf`,
`papers/security-protocols/2024-nist-sp-800-218a-secure-ai-development.pdf`,
`2024-agentdojo-prompt-injection-agents.pdf`, and the OWASP GenAI/LLM Top 10.
Translate them into a threat model, least-privilege tool access, utility-plus-security
evals, adversarial tests, traceability, rollback, and named risk ownership.

## Phase 6 — Inference, serving & post-training (the elite differentiator)

Goal: reason about tokens/sec/dollar from first principles. This is what separates engineers from API callers.

1. **Systems literacy**: read `books/2026-machine-learning-systems-vol1.pdf`, then the
   relevant at-scale chapters in `books/2026-machine-learning-systems-vol2.pdf`. Reinforce
   them with DeepMind's *How to Scale Your Model* (jax-ml.github.io/scaling-book) and the
   HF *Ultra-Scale Playbook* — rooflines, KV-cache byte math, DP/TP/PP/FSDP.
2. Distributed training: read
   `papers/production-systems/2021-megatron-lm-distributed-training.pdf` and draw the
   tensor, pipeline, and data-parallel topology, including communication and pipeline
   bubble costs.
3. Serving: `2023-vllm-pagedattention.pdf` plus
   `papers/production-systems/2024-distserve-disaggregated-prefill-decode.pdf`; the 2026
   stack is vLLM/SGLang + continuous batching + prefix caching + chunked prefill +
   workload-dependent prefill/decode placement. Use BentoML's LLM Inference Handbook
   as the practical reference and model TTFT/TPOT SLOs explicitly.
4. Speculative decoding is table stakes: `2022-speculative-decoding.pdf` → `2025-eagle3-speculative.pdf`; key metric is acceptance rate; helps at low batch, hurts at high batch.
5. Quantization regimes: `2023-awq-quantization.pdf`, `2023-qlora.pdf`; FP8 serving is standard, FP4 arriving; know which of weights/activations/KV bottlenecks your workload.
6. Post-training pipeline (SFT → DPO-family → RLVR with GRPO-family): `books/rlhf-book-nathan-lambert.pdf` (read fully) + `2024-tulu3-post-training.pdf` (the open recipe) + DeepSeek-R1.
7. Fine-tuning: Thinking Machines reports LoRA can match full fine-tuning at post-training scales under the tested conditions in *LoRA Without Regret*; reproduce the comparison for your workload. QLoRA + efficient kernels make large-model customization far more accessible. Treat on-policy distillation as a technique to measure, not a universal default.
8. Architecture: MoE + Multi-head Latent Attention is common in current open frontier reports (DeepSeek-V3, Kimi K2) — understand why MLA reduces KV-cache and what expert parallelism does to serving.

Hands-on: reproduce a small GRPO run with verl or TRL; read vLLM/SGLang source; benchmark a real deployment.

### Distributed application overlay

Model serving is only one distributed system. For the service around it, read the ten
papers in `papers/distributed-systems/` in the order given by
`JOB-ALIGNED-LEARNING-PATH.md`. Then run crash/retry/rebalance tests against Kafka,
Postgres, Redis, LangGraph persistence, and Temporal. The mastery criterion is not
being able to define consensus; it is being able to state and test the invariant that
prevents a duplicate message, stale lock holder, partial transaction, or replayed graph
node from creating a duplicate user-visible effect.

## Phase 7 — Career strategy: compare scope, not mythology

Read `CAREER-GUIDE-DRAFT.md` and its source ledger in `catalog/industry-codex.tsv`.
It separates public evidence, point-in-time job descriptions, and cross-company inference.
Meta and Google do not publish enough current internal calibration detail to support confident
level-number mappings, promotion folklore, or universal team-culture claims.

- **Meta public signals:** mandatory diff review, high-volume trunk-oriented development,
  automated testing, staged exposure, and software/production engineering at enormous scale.
- **Google public signals:** design documents for major work, mandatory review/readability,
  small changes, error budgets, production readiness, canaries, and rollback.
- **Frontier/fast AI companies:** compress research into production and place unusual weight on
  capability discovery, evals, inference systems, security, and safety under fast model change.
- **Applied-AI companies:** place more weight on workflow fidelity, customer iteration, domain
  risk, permissions, auditability, retrieval/context quality, and cost per successful task.

The durable senior/staff distinction is scope. Senior engineers own ambiguous team/subsystem
outcomes end to end. Staff engineers shape multi-team direction, establish mechanisms others
adopt, and leave the organization more capable. Build evidence through three production-grade
portfolio systems with evals, observability, safe rollout, incident exercises, and written
trade-offs—not through a folder of notebooks.

Measure AI-assisted productivity on your own work. DORA 2025 reports broad adoption but a mix of
throughput and stability effects; METR's early-2025 randomized study found a 19% slowdown on its
specific experienced-maintainer tasks, and its 2026 follow-up warns that newer estimates are too
selection-biased and noisy for a universal multiplier.

## Staying current (the field outruns books)

- **Latent Space** (swyx) — practitioner interviews and field synthesis; read *The Rise of the AI Engineer* and its paper lists: latent.space
- **Simon Willison** — simonwillison.net for careful practitioner reporting on agentic coding
- **Anthropic engineering blog**, **The Pragmatic Engineer**, **Sebastian Raschka's yearly paper lists**, **METR**, **Berkeley RDI**
- Eugene Yan (eugeneyan.com) and Hamel Husain (hamel.dev) for evals

## The paid shortlist (in order of value)

1. **Designing Data-Intensive Applications, 2nd Edition** — Kleppmann and Riccomini
   (O'Reilly, 2026), for distributed data-system trade-offs. See
   `DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md`.
2. **AI Engineering** — Chip Huyen (O'Reilly). See `AI-ENGINEERING-BOOK-ACCESS.md`;
   official companion material is already in `companion-code/aie-book/`.
3. **Build a Large Language Model (From Scratch)** — Raschka. Official code is in
   `companion-code/llms-from-scratch/`.
4. **Build a Reasoning Model (From Scratch)** — Raschka. Official code is in
   `companion-code/reasoning-from-scratch/`.
5. **Hands-On Large Language Models** — Alammar & Grootendorst. Official notebooks are
   in `companion-code/hands-on-large-language-models/`.
6. **Context Engineering** — Boni Garcia (Manning, 2026). Its Apache-licensed companion
   is in `companion-code/context-engineering/`.
7. **Database Internals** — Alex Petrov, as the storage/replication/consensus reference.
8. **The Software Engineer's Guidebook** — Orosz, for level-by-level expectations.
