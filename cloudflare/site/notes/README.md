# AI Engineering Library

A curated, legal study library for becoming a high-scope AI engineer. The collection
combines fundamentals, current agent/RAG/context work, production systems, evals,
security, multimodal systems, official companion code, and evidence-backed career
guidance. It is a study system, not a book dump.

Snapshot: **2026-07-13**. Every stored PDF came from an author, publisher, university,
conference, standards body, arXiv, or official company source. Commercial books are
represented only by legal access links and official companion material.

## Start here

1. Launch the local [Study Hub](study-hub/README.md) for the 16-week path, searchable
   library, in-place PDF reader, study notes, and browser-local progress tracking:

```bash
cd ~/Documents/ai-engineering-library
python3 study-hub/server.py
```

   Then open http://127.0.0.1:8765. The server indexes the existing PDFs without
   copying them into a second site build.
2. Start with `JOB-ALIGNED-LEARNING-PATH.md` for a vendor-neutral 16-week AI systems
   track built around independent portfolio projects.
3. Follow `ROADMAP.md` for the broader sequenced curriculum and portfolio projects.
4. Use `CAREER-GUIDE-DRAFT.md` for the Meta/Google/frontier-startup/applied-AI role
   comparison, senior-versus-staff expectations, interview rubrics, and a 20-week plan.
5. Read `SOURCE-POLICY.md` before adding anything from the internet.
6. See `AI-ENGINEERING-BOOK-ACCESS.md`, `RECOMMENDER-SYSTEMS-BOOK-AUDIT.md`, and
   `DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md` for legal access, including Chip Huyen's
   commercial O'Reilly book, the two-book audit, and the distributed-systems shelf.
7. Re-run the integrity check whenever the library changes:

```bash
cd ~/Documents/ai-engineering-library
./scripts/verify-library.sh
```

## Verified snapshot

| Metric | Value |
|---|---:|
| Main-library PDFs | 108 |
| Full books and author-posted book drafts | 19 |
| Guides | 4 |
| Papers and standards | 85 |
| Total PDF pages | 13,790 |
| Total PDF size | about 788.7 MiB |
| Official companion repositories/bundles | 6 |
| Official framework repositories | 6 |
| Duplicate or structurally invalid PDFs | 0 |

The PDF count excludes sample documents inside companion and framework repositories.
Web-only standards, courses, and books are cataloged but are not counted as PDFs. The
complete library occupies about 1.9 GiB because the official framework and sample
repositories contain source, tests, examples, assets, and their shallow Git history.

## Books

| Local file | Best use |
|---|---|
| `2026-machine-learning-systems-vol1.pdf` | End-to-end ML systems foundations, hardware, data, training, inference, and operations |
| `2026-machine-learning-systems-vol2.pdf` | At-scale distributed training, serving, reliability, governance, and sustainable systems |
| `probabilistic-machine-learning-introduction.pdf` | Rigorous probabilistic and statistical reference |
| `probabilistic-machine-learning-advanced-topics.pdf` | Deep generative, latent-variable, Bayesian, and sequential models |
| `understanding-deep-learning-prince.pdf` | Modern deep-learning theory with a strong transformer treatment |
| `speech-and-language-processing-slp3-draft.pdf` | NLP, language models, transformers, post-training, speech, and applications |
| `foundations-of-large-language-models.pdf` | Compact end-to-end LLM theory |
| `rlhf-book-nathan-lambert.pdf` | Preference learning, RLHF, DPO, RLVR, and reasoning post-training |
| `dive-into-deep-learning-d2l.pdf` | Code-first deep learning and transformer implementation |
| `mathematics-for-machine-learning.pdf` | Linear algebra, probability, calculus, and optimization prerequisites |
| `the-little-book-of-deep-learning-fleuret.pdf` | Fast review and interview refresh |
| `reinforcement-learning-sutton-barto.pdf` | Core reinforcement-learning foundations |
| `introduction-to-information-retrieval.pdf` | Inverted indexes, ranking, BM25, relevance feedback, and IR evaluation |
| `automl-methods-systems-challenges.pdf` | Search, optimization, pipeline automation, and AutoML systems |
| `patterns-predictions-actions.pdf` | Prediction, causality, decision-making, and the limits of ML |
| `fairness-and-machine-learning.pdf` | Socio-technical risk, discrimination, causality, and governance |
| `machine-learning-yearning.pdf` | Error analysis and practical ML project prioritization |
| `2026-hitchhikers-guide-agentic-ai.pdf` | Broad current reference for agent architecture, memory, protocols, evals, and deployment |
| `2026-agentic-software-engineering.pdf` | Practitioner proposals for coordinating and governing stochastic software teammates |

Licenses and access terms differ. In particular, the 2026 *Machine Learning Systems*
PDFs are for personal reading and state additional restrictions. Consult
`catalog/coordinator-books.tsv` before copying, redistributing, or reusing content.

## Papers and guides by domain

| Directory | Count | Coverage |
|---|---:|---|
| `papers/foundations/` | 14 | Transformers, scaling laws, GPT-3, Chinchilla, RLHF, DPO, Mamba, GRPO, test-time compute, DeepSeek-R1, Kimi K2 |
| `papers/agents/` | 8 | ReAct, Reflexion, Toolformer, AutoGen, SWE-agent, OSWorld, long-task horizons, agentic RL |
| `papers/rag-retrieval/` | 12 | RAG, Self-RAG, RAPTOR, GraphRAG, HyDE, routing, agentic search, embedding/reranking |
| `papers/context-memory/` | 8 | Long-context failure, MemGPT, Mem0, temporal graphs, ACE, recursive models, LongMemEval |
| `papers/evals-safety/` | 6 | LLM judges, validator validation, leakage, contamination, and LiveBench |
| `papers/inference-serving/` | 8 | PagedAttention, LoRA/QLoRA, AWQ, speculative decoding, DeepSeek-V3, Tulu 3 |
| `papers/production-systems/` | 4 | Megatron-LM, DistServe, production-readiness testing, and data validation |
| `papers/distributed-systems/` | 10 | GFS, MapReduce, Dynamo, ZooKeeper, Kafka, Spanner, Raft, FoundationDB, DynamoDB transactions, Temporal |
| `papers/recommender-systems/` | 8 | Two-stage retrieval/ranking, feature crosses, DLRM, two-tower bias, real-time and generative recommenders |
| `papers/multimodal-data/` | 2 | Chameleon early fusion and Qwen2.5-VL perception/visual agents |
| `papers/security-protocols/` | 2 | AgentDojo prompt-injection evals and NIST secure AI development |
| `papers/industry/` | 1 | Controlled research on AI-assisted software development |
| `papers/industry-career/` | 2 | NIST Generative AI Profile and the 2025 DORA AI-assisted development report |
| `guides/` | 3 | OpenAI agents, Anthropic agentic coding, and practical LLM evals |
| `guides/production/` | 1 | Google's end-to-end MLOps operating model |

The versioned MCP authorization specification is cataloged as web-only in
`catalog/additions-production.tsv`; keeping it online avoids freezing a living protocol
into a misleading local snapshot.

## Official companion code

| Directory | Commercial title or subject | Repository status |
|---|---|---|
| `companion-code/aie-book/` | Chip Huyen, *AI Engineering* | Official author companion; not the full book |
| `companion-code/llms-from-scratch/` | Sebastian Raschka, *Build a Large Language Model (From Scratch)* | Official implementation notebooks |
| `companion-code/reasoning-from-scratch/` | Sebastian Raschka, *Build a Reasoning Model (From Scratch)* | Official implementation notebooks |
| `companion-code/hands-on-large-language-models/` | Alammar and Grootendorst, *Hands-On Large Language Models* | Official notebooks |
| `companion-code/context-engineering/` | Boni Garcia, *Context Engineering* | Official Apache-licensed companion/reference |
| `companion-code/distributed-systems-4e/` | van Steen and Tanenbaum, *Distributed Systems*, 4th ed. | Official figures and executable Python examples; not the personalized ebook |

Existing repository commits and terms are pinned in `catalog/companion-code.tsv`; the
distributed-systems archive hash and terms are in `catalog/job-aligned-code.tsv`.

## Official framework code

| Directory | Why it is here | License |
|---|---|---|
| `framework-code/langgraph/` | Checkpoints, interrupts, state graphs, subgraphs, persistence, and durable execution | MIT |
| `framework-code/langchain/` | Higher-level agents, middleware, integrations, and context controls | MIT |
| `framework-code/google-adk-python/` | ADK runtime, sessions, tools, evaluation, and deployment | Apache-2.0 |
| `framework-code/google-adk-samples/` | Official runnable ADK patterns | Apache-2.0 |
| `framework-code/openai-agents-python/` | Agents, handoffs, guardrails, sessions, and tracing | MIT |
| `framework-code/pydantic-ai/` | Typed tools/results, dependency injection, and evaluation | MIT |

All six are shallow clones pinned to exact commits in
`catalog/job-aligned-code.tsv`. They are reference implementations, not dependencies
vendored into the production service.

## Career calibration

`CAREER-GUIDE-DRAFT.md` labels claims as public evidence, inference, or recommended
practice instead of pretending that private company ladders are public facts. Its
durable comparison is:

- Senior engineers own ambiguous team or subsystem outcomes end to end.
- Staff engineers set multi-team direction and create mechanisms other engineers adopt.
- Public Meta material emphasizes high-volume reviewed changes, automation, staged
  exposure, and very large-scale software/production engineering.
- Public Google material emphasizes design documents, small reviewed changes,
  readability, SRE error budgets, production readiness, canaries, and rollback.
- Frontier AI companies add capability discovery, evaluations, inference systems,
  security, and safety under rapid model change.
- Applied-AI companies add workflow fidelity, permissions, retrieval/context quality,
  domain risk, customer iteration, and cost per successful task.

The supporting 89-record source ledger is `catalog/industry-codex.tsv`.

## How to turn the library into skill

For each roadmap phase:

1. Read one book chapter or canonical paper and write the mechanism from memory.
2. Reproduce a small version in code; record latency, cost, quality, and failure cases.
3. Build one production-shaped artifact with an explicit baseline and golden eval set.
4. Add tracing, permissions, adversarial tests, deployment gates, rollback, and a runbook.
5. Write a short design document explaining alternatives and measured trade-offs.
6. Revisit the artifact after a week and perform error analysis on real traces.

Three deep, evaluated, operable systems are stronger senior/staff evidence than dozens
of notebooks: an agent harness, an advanced retrieval/context system, and an optimized
model-serving or post-training system.

## Catalog and provenance

| File | Scope |
|---|---|
| `catalog/audit-claude.md` | Integrity and legal-provenance audit of the original 70 PDFs |
| `catalog/inventory-claude.tsv` | Per-file hashes, page counts, sizes, sources, and audit result for that snapshot |
| `catalog/coordinator-books.tsv` | The 11 added open/official full books |
| `catalog/additions-production.tsv` | Nine production PDFs plus one web-only protocol specification |
| `catalog/job-aligned-additions.tsv` | Eighteen recommender/distributed-system PDFs plus seven official web-native references |
| `catalog/job-aligned-code.tsv` | Six official framework clones and the Distributed Systems 4e companion archive |
| `catalog/research-production.md` | Selection rationale and study order for the production supplement |
| `catalog/final-verification.md` | Combined 108-PDF integrity result and acquisition accounting |
| `catalog/industry-codex.md` | Industry/career research synthesis |
| `catalog/industry-codex.tsv` | 89-source evidence ledger |
| `catalog/companion-code.tsv` | Official repository URLs, pinned commits, and licenses/terms |
| `study-hub/` | Local dashboard, learning path data, in-place reader, and launch instructions |

The manifests are separated by acquisition wave so provenance is not lost. The
verifier scans the current combined library and is the authoritative integrity check.

## High-value web-native references

- *Software Engineering at Google*: https://abseil.io/resources/swe-book
- Google SRE books: https://sre.google/books/
- Google DeepMind, *How to Scale Your Model*: https://jax-ml.github.io/scaling-book/
- Hugging Face, *The Ultra-Scale Playbook*: https://huggingface.co/spaces/nanotron/ultrascale-playbook
- BentoML, *LLM Inference Handbook*: https://bentoml.com/llm/
- Bishop and Bishop, *Deep Learning: Foundations and Concepts*: https://www.bishopbook.com
- Model Context Protocol specification: https://modelcontextprotocol.io/specification/
- LangGraph persistence: https://docs.langchain.com/oss/python/langgraph/persistence
- LangChain context engineering: https://docs.langchain.com/oss/python/langchain/context-engineering
- Google ADK: https://google.github.io/adk-docs/
- Google Recommendation Systems course: https://developers.google.com/machine-learning/recommendation
- MIT 6.5840 Distributed Systems: https://pdos.csail.mit.edu/6.824/
- Distributed Systems 4e personalized copy: https://www.distributed-systems.net/index.php/books/ds4/ds4-ebook/

## Legal boundary

A public GitHub upload does not prove that a commercial book was uploaded lawfully.
This library therefore excludes book dumps, random forks containing paid PDFs,
mirrors, torrents, paywall bypasses, and reconstructed previews. Buy, borrow, or use a
legitimate subscription for commercial books; keep only the author's or publisher's
official companion material here.
