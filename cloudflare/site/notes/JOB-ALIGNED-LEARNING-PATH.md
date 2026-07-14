# AI Systems Mastery Track

Snapshot: 2026-07-13. This is a personal, vendor-neutral track for becoming a
production AI systems engineer. It uses representative technologies—LangGraph,
Pydantic AI, model APIs, Kafka, Redis, Postgres/pgvector, Temporal, FastAPI, and cloud
runtimes through standalone projects.
The goal is to master durable engineering invariants and prove them through independent
portfolio projects, reliability work, and evaluation.

## The target skill profile

The strongest version of this job is a production AI systems engineer who can own all
five layers below:

1. **Agent runtime:** state machines, tool boundaries, human interrupts, resumability,
   routing, deterministic side effects, and provider portability.
2. **Context system:** selection, ordering, compression, isolation, provenance,
   permissions, caching, invalidation, and quality measurement.
3. **Retrieval and recommendation:** candidate generation, scoring, reranking,
   feedback signals, freshness, experimentation, and abuse resistance.
4. **Distributed application:** queues and logs, delivery semantics, transactions,
   idempotency, coordination, timeouts, backpressure, replay, and recovery.
5. **Production discipline:** evals, traces, SLOs, safe rollout, incident response,
   cost/latency control, and design communication.

Do not optimize for memorizing framework APIs. A framework can change in months; the
failure models, state boundaries, and evaluation methods are durable.

## What each agent framework is for

| Tool | Abstraction | Learn deeply | Best use in the track | Avoid |
|---|---|---|---|---|
| **LangGraph** | Low-level stateful orchestration runtime | Typed state and reducers, nodes/edges, subgraphs, checkpoints, threads, interrupts, pending writes, replay/time travel, durable execution | Primary reference for stateful multi-turn workflows, handoffs, replay, and recovery | Hiding non-idempotent side effects inside retryable nodes |
| **LangChain agents** | Higher-level agent loop and middleware built on LangGraph | Model/tool/lifecycle context, state/store/runtime, middleware, dynamic tool and prompt selection, summarization | Reuse high-level middleware where it removes boilerplate without obscuring state | Adopting a chain merely because an integration exists |
| **Google ADK** | Code-first agent development kit | Sessions, memory, artifacts, callbacks, evaluation, tool/MCP integration, deployment, multi-agent composition | Build one comparison implementation; useful for Google/Cloud Run and A2A/MCP literacy | Rewriting the production graph just to gain framework familiarity |
| **Pydantic AI** | Typed Python agent and evaluation layer | Dependency injection, tool schemas, structured outputs, validation, retries, usage limits, evals | Build explicit typed boundaries and make agent behavior testable | Treating type validity as task correctness |
| **OpenAI Agents SDK** | Small set of agent, handoff, guardrail, session, and tracing primitives | Handoffs versus agents-as-tools, lifecycle hooks, guardrails, sessions, tracing | Learn a second compact runtime and portable tracing model | Binding domain state directly to one provider's transcript format |

Official references:

- LangGraph overview and persistence:
  https://docs.langchain.com/oss/python/langgraph/overview and
  https://docs.langchain.com/oss/python/langgraph/persistence
- LangChain context engineering:
  https://docs.langchain.com/oss/python/langchain/context-engineering
- Google ADK: https://google.github.io/adk-docs/
- Pydantic AI: https://ai.pydantic.dev/
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/

Pinned official source and samples are in `framework-code/`; exact commits and licenses
are recorded in `catalog/job-aligned-code.tsv`.

### The comparison exercise

Implement one intentionally small workflow in LangGraph, ADK, Pydantic AI, and the
OpenAI Agents SDK:

- classify a request;
- retrieve two pieces of user-authorized context;
- call one read tool and one write tool;
- require approval before the write;
- survive a process restart;
- emit a trace and a structured result;
- replay safely without repeating the write.

Use the same golden tasks and fault cases for every implementation. The output is a
decision record comparing state ownership, durability, observability, testability,
latency, and accidental complexity—not four demo apps.

## Context engineering: the reference model

Treat "memory" as several different storage and selection problems:

| Layer | Lifetime | Generic examples | Required properties |
|---|---|---|---|
| Model context | One model call | system instructions, selected transcript, tool schemas, retrieved snippets | token budget, ordering, provenance, injection resistance |
| Thread/workflow state | One conversation or run | LangGraph state, handoff state, pending approval, checkpoint | resumability, schema versioning, deterministic reducers |
| Durable domain state | Cross-thread source of truth | users, conversations, posts, relationships, permissions | transactions, authorization, auditability, migrations |
| Long-term retrieval memory | Cross-thread derived index | pgvector embeddings, summaries, searchable artifacts | freshness, invalidation, versioned embeddings, measured recall |
| Runtime/tool context | One execution | credentials, tenant/user identity, clients, limits, trace IDs | least privilege, non-prompt visibility, redaction |
| Cache | Recomputable acceleration | Redis results, prompt prefixes, provider responses | TTL, namespace, invalidation, stampede control |

For every context component, document:

1. source of truth and owner;
2. write path and read path;
3. selection rule and token allocation;
4. ordering and trust level;
5. freshness and invalidation rule;
6. permission check;
7. provenance shown to the model and user;
8. behavior when missing, stale, oversized, or contradictory;
9. trace fields and quality metric;
10. deletion and retention behavior.

### Standalone context-control project

Build a small context-control system as a standalone portfolio project:

- define a canonical typed artifact envelope and schema versions;
- keep raw artifacts addressable even when summaries are in the prompt;
- allocate an explicit token budget by section;
- record why each context item was selected or dropped;
- separate trusted domain facts from untrusted user/retrieved text;
- test lost-in-the-middle placement, stale summaries, duplicate artifacts, cross-thread
  leakage, conflicting facts, and tool-output injection;
- measure answer correctness, grounding, token count, cache-hit rate, latency, and cost;
- make compaction reversible through references to canonical data.

Build a **context budget ledger** in traces. Each model call should expose section,
source, trust level, tokens, age, selection reason, cacheability, and redaction result.
That one artifact makes context behavior debuggable instead of mystical.

## Distributed systems: learn through concrete failure modes

| Component | Concepts to master | Production exercise |
|---|---|---|
| Kafka / aiokafka | partitions and ordering, consumer groups, rebalances, offset commits, at-least-once delivery, idempotency, poison messages, DLQ, replay, lag, backpressure | inject a crash before and after every external effect; prove no lost event and no duplicated user-visible effect |
| Postgres | ACID, isolation, MVCC, constraints, locks, deadlocks, advisory locks, outbox/inbox, migrations | replace check-then-write deduplication with a transaction plus unique constraint; document the race it closes |
| Redis | cache versus authority, TTL/eviction, atomic operations, leases, fencing tokens, stampedes | test owner crash, expired lease, stale owner, eviction, and concurrent refresh |
| Temporal | deterministic workflows, activities, retries, timeouts, heartbeats, cancellation, signals, versioning, replay | move one long-lived workflow into a durable execution and prove restart/redeploy recovery |
| LangGraph persistence | thread IDs, checkpoints, pending writes, interrupts, replay, state history | resume at each graph boundary and verify that side effects are fenced or idempotent |
| Cloud Run | stateless instances, concurrency, autoscaling, cold starts, request deadlines, graceful termination | load-test consumer/API concurrency and document backpressure and shutdown behavior |
| pgvector | exact versus approximate search, recall/latency, index tuning, embedding versioning, filter selectivity | create a golden retrieval set and compare index parameters using recall@k and p95 latency |
| Model providers | quotas, retry-after, timeout budgets, circuit breakers, fallbacks, semantic drift | simulate throttling and provider failure without multiplying retries across layers |

The non-negotiable rule: an "exactly once" business outcome is normally constructed
from at-least-once delivery plus idempotent effects, transactional state transitions,
and reconciliation. Never infer it from a queue setting alone.

### Distributed-systems paper order

1. `papers/distributed-systems/2003-google-file-system.pdf`
2. `papers/distributed-systems/2004-mapreduce.pdf`
3. `papers/distributed-systems/2007-dynamo.pdf`
4. `papers/distributed-systems/2014-raft.pdf`
5. `papers/distributed-systems/2010-zookeeper.pdf`
6. `papers/distributed-systems/2011-kafka-distributed-messaging.pdf`
7. `papers/distributed-systems/2012-spanner.pdf`
8. `papers/distributed-systems/2021-foundationdb.pdf`
9. `papers/distributed-systems/2023-dynamodb-transactions.pdf`
10. `papers/distributed-systems/2025-temporal-durable-execution.pdf`

For each paper, write a one-page note with the contract, fault model, invariants,
mechanism, trade-offs, operational failure modes, and one connection to a standalone
project you can implement and test.
Use MIT 6.5840 as the lab spine: https://pdos.csail.mit.edu/6.824/.

## Recommender systems: from signals to a production loop

A recommender is not just a ranking model. Model the whole loop:

```text
events -> validated signals -> point-in-time features -> candidate generators
       -> union/dedup -> scoring/ranking -> policy reranking -> delivery
       -> exposure + outcome logging -> offline evaluation + online experiment
```

### What to master

- **Signals:** impression, exposure, click, reply, save, hide, report, dwell time,
  downstream success, and negative feedback; distinguish missing exposure from a
  negative label.
- **Data:** point-in-time joins, leakage prevention, delayed labels, bot/abuse traffic,
  identity changes, privacy, retention, and feature lineage.
- **Candidate generation:** popularity/freshness, graph/neighborhood, sparse retrieval,
  two-tower ANN, rules, and exploration candidates; measure source-level recall.
- **Ranking:** calibrated objectives, feature crosses, multi-task learning, position and
  selection bias, long-tail behavior, cold start, latency, and model/feature versioning.
- **Reranking:** diversity, novelty, freshness, safety, deduplication, quotas, business
  rules, and user controls; policy belongs here explicitly.
- **Evaluation:** recall@k for retrieval; NDCG/MRR/precision and calibration for ranking;
  coverage, diversity, fairness, latency, and cost; online guardrails and long-term value.
- **Feedback loops:** exposure bias, popularity amplification, delayed effects,
  exploration, counterfactual evaluation, and metric gaming.
- **Operations:** nearline/streaming features, index refresh, backfills, shadow traffic,
  canaries, rollback, and reconciliation.

Use Google's current four-hour recommendation course as the practical backbone:
https://developers.google.com/machine-learning/recommendation. It explicitly separates
candidate generation, scoring, and reranking.

### Recommender paper order

1. `books/introduction-to-information-retrieval.pdf`, chapters 6–8 and 11–12
2. `papers/recommender-systems/2016-youtube-deep-recommendations.pdf`
3. `papers/recommender-systems/2016-wide-and-deep.pdf`
4. `papers/recommender-systems/2019-sampling-bias-corrected-two-tower.pdf`
5. `papers/recommender-systems/2019-dlrm.pdf`
6. `papers/recommender-systems/2020-dcn-v2.pdf`
7. `papers/recommender-systems/2022-monolith-real-time-recommendation.pdf`
8. `papers/recommender-systems/2023-tiger-generative-retrieval.pdf`
9. `papers/recommender-systems/2024-hstu-generative-recommenders.pdf`

The first six establish the production retrieve-and-rank stack. The last two are a
frontier branch, not permission to replace a strong baseline with a generative model.

## Sixteen-week execution plan

| Week | Focus | Required output |
|---:|---|---|
| 1 | Inventory context and state | Diagram every source of prompt, graph, domain, retrieval, runtime, and cache state; name its owner and TTL |
| 2 | Context eval baseline | 50–100 golden conversations covering artifact references, stale/conflicting facts, long threads, injection, and permissions |
| 3 | LangGraph persistence | Restart/resume tests at every important node; checkpoint/state schema document |
| 4 | Safe side effects | Idempotency keys, effect ledger, and tests proving graph retry/replay safety |
| 5 | Framework comparison | The same small workflow in LangGraph, ADK, Pydantic AI, and OpenAI Agents SDK; one decision record |
| 6 | Observability and eval gates | Trace schema, context budget ledger, task graders, latency/cost dashboard, release threshold |
| 7 | Kafka correctness | Delivery-semantics model, rebalance/crash tests, lag SLO, poison-message and replay runbook |
| 8 | Postgres and Redis correctness | Transactional dedup/outbox exercise plus lock/lease/fencing and cache-stampede tests |
| 9 | Temporal durable execution | One long-lived workflow with activity idempotence, timeout/retry policy, versioning test, and recovery demo |
| 10 | Fault-injection week | Dependency latency, 429/5xx, process death, stale reads, partial writes, duplicate events, and shutdown under load |
| 11 | Recommender data contract | Exposure/outcome schema, point-in-time dataset, leakage tests, privacy/retention rules |
| 12 | Candidate generation | Popularity + graph/rules + two-tower or vector baseline; per-source recall@k and latency |
| 13 | Ranking and reranking | A calibrated ranker plus diversity/freshness/safety policy; offline metric slices |
| 14 | Feedback and experimentation | Shadow logging, experiment design, guardrails, feedback-loop threats, rollback criteria |
| 15 | Integrated production slice | Context-aware agent using reliable events and recommendation candidates with end-to-end traces |
| 16 | Staff-level package | Design doc, threat model, capacity model, SLOs, rollout plan, incident drill, and retrospective |

Keep weekly reading below roughly 30% of the available time. The remaining time should
go to implementation, measurement, fault injection, and writing.

## Portfolio artifacts that demonstrate senior/staff scope

1. **Context control plane:** typed context items, budgets, trust/provenance, compaction,
   permission checks, traces, and a regression suite.
2. **Replay-safe event workflow:** Kafka + Postgres outbox/inbox + idempotent effects +
   DLQ/replay/reconciliation with crash tests.
3. **Two-stage recommender:** multiple candidate sources, ranker, policy reranker,
   point-in-time data, offline slices, shadow deployment, and an experiment plan.
4. **Durable agent workflow:** approval, interruption, restart, timeout, cancellation,
   provider failover, and side-effect fencing across LangGraph or Temporal.

Every artifact should contain a short design document, explicit invariants, a golden
evaluation set, load/fault results, dashboards, an SLO, a runbook, and a rollback plan.
That evidence is more valuable in interviews and promotion cases than a large count of
framework tutorials.

## Books: the compact paid/free shelf

Do not try to read ten commercial systems books cover to cover. The highest-value
sequence for this track is:

1. **Distributed Systems, 4th edition**, van Steen and Tanenbaum — free personalized
   digital copy; access instructions in `DISTRIBUTED-SYSTEMS-BOOK-ACCESS.md`.
2. **Designing Data-Intensive Applications, 2nd edition**, Kleppmann and Riccomini —
   the 2026 systems trade-off reference; commercial.
3. **AI Engineering**, Chip Huyen — system around the model; commercial; official
   companion already local.
4. **Database Internals**, Alex Petrov — storage, replication, failure detection, and
   consensus internals; commercial reference.
5. **Recommender Systems: The Textbook**, Charu Aggarwal — strong classical reference
   if accessed lawfully; pair it with the modern paper sequence above.

Use the free Google SRE books (https://sre.google/books/) and *Software Engineering at
Google* (https://abseil.io/resources/swe-book) for production and organizational
practice. Legal access details are separated from downloads so the library never
confuses a public upload with an authorized one.
