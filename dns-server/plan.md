# ShieldBlock DNS Server: Engineering Evolution Roadmap

## Table of Contents

- [Engineering Principles](#engineering-principles)
- [Phase 1: Minimal DNS-over-TLS Forwarder](#phase-1--minimal-dns-over-tls-forwarder)
- [Phase 2: Basic DNS Filtering](#phase-2--basic-dns-filtering)
- [Phase 3: User Authentication & Analytics Writes](#phase-3--user-authentication--direct-analytics-writes)
- [Phase 4: Authentication Cache](#phase-4--authentication-cache)
- [Phase 5: Connection-Scoped Authentication](#phase-5--connection-scoped-authentication)
- [Phase 6: Parallel Query Processing](#phase-6--parallel-query-processing)
- [Phase 7: Single Writer Architecture](#phase-7--single-writer-architecture)
- [Phase 8: DNS Response Cache](#phase-8--dns-response-cache)
- [Phase 9: Async Analytics Pipeline](#phase-9--async-analytics-pipeline)
- [Phase 10: Production Blocklists](#phase-10--production-blocklists)
- [Phase 11: Trie/Radix Domain Matching](#phase-11--trieradix-domain-matching)
- [Phase 12: Load Testing & Capacity Discovery](#phase-12--load-testing--capacity-discovery)
- [Phase 13: Profiling & Benchmarking](#phase-13--profiling--benchmarking)
- [Phase 14: Memory Optimization](#phase-14--memory-optimization)
- [Phase 15: Containerized Development](#phase-15--containerized-development)
- [Phase 16: Local Multi-Service Infrastructure](#phase-16--local-multi-service-infrastructure)
- [Phase 17: Hot Reloadable Blocklists](#phase-17--hot-reloadable-blocklists)
- [Phase 18: Distributed Resolver Architecture](#phase-18--distributed-resolver-architecture)
- [Phase 19: Upstream Resilience & Failure Handling](#phase-19--upstream-resilience--failure-handling)
- [Phase 20: Self-hosted Recursive Resolution](#phase-20--self-hosted-recursive-resolution)
- [Phase 21: Production Hardening](#phase-21--production-hardening)
- [Final Outcome](#final-outcome)

## Engineering Principles

1. Start with the simplest architecture possible.
2. Add complexity only when bottlenecks are measurable.
3. Optimize only after profiling.
4. Keep latency-critical paths minimal.
5. Prefer lifecycle-aware optimizations.
6. Separate critical and non-critical workloads.
7. Favor observability before scalability.
8. Prefer evidence-driven optimization over intuition.
9. Design around failure, not only success.
10. Document every architectural tradeoff.
11. Every operational dependency increases:
  - maintenance burden
  - operational state
  - cognitive complexity
  - failure surface area
12. Prefer graceful degradation over hard failure.
13. Unbounded queues are hidden outages.
14. Tail latency matters more than average latency.
15. Reject overload early instead of failing unpredictably.
16. Invalid configuration should fail fast.
17. External dependencies must be treated as unreliable.

---

## Phase 1: Minimal DNS-over-TLS Forwarder

### Goal

- Build the smallest possible working DoT resolver.

### Scope

Client → ShieldBlock → Cloudflare

### Features

- DoT server on :853
- valid TLS cert
- accept encrypted DNS queries
- forward upstream
- return responses

### Lightweight Operational Visibility

Very early visibility:

- structured logs
- request timing logs
- connection open/close logs

### Learn

- TLS sockets
- DNS forwarding
- persistent TCP connections
- DNS request lifecycle
- structured logging basics

### Immediate Improvement

- You now understand the complete encrypted DNS request lifecycle.

### Bottleneck

- No filtering. No users. No analytics.
- Everything depends on upstream.

---

## Phase 2: Basic DNS Filtering

### Goal

- Turn the resolver into an actual ad blocker.

### Scope

- Exact-match blocking only.

### Features

- in-memory hashmap blocklists
- return 0.0.0.0
- basic logging

### Lightweight Testing

Simple correctness tests:

- blocked domain tests
- allowed domain tests
- malformed request tests

### Learn

- DNS response crafting
- hot-path operations
- in-memory lookups
- table-driven testing

### Immediate Improvement

- The project becomes a functioning DNS ad blocker.

### Bottleneck

Problems:

- exact matching only
- no categories
- no user-specific policies
- no scalability concerns yet

---

## Phase 3: User Authentication & Direct Analytics Writes

### Goal

- Introduce personalized filtering and observability.

### Scope

Users authenticate via:

- {config hash}.dns.shieldblock.in

### Features

- extract SNI
- parse user hash
- user bitmask policies
- direct analytical DB writes
- internal metrics
- basic /healthz
- basic /readyz

### Analytics Stored

- user hash
- queried domain
- blocked/allowed
- response latency
- timestamp

### Lightweight Operational Visibility

Minimal metrics endpoint:

- request counters
- blocked counters
- auth lookup counters
- basic latency histograms

### Lightweight Failure Testing

Basic fault simulation:

- DB unavailable
- malformed SNI
- auth lookup failure

### Learn

- SNI-based authentication
- connection identity
- analytics modeling
- write-heavy systems
- operational visibility basics
- failure-oriented thinking
- health endpoint semantics

### Immediate Improvement

Users now get:

- personalized filtering
- policy-based blocking
- query analytics
- measurable resolver behavior

### Failure Discovered

- System behavior became difficult to reason about without visibility.

### Why It Happened

- Architectural complexity increased beyond intuitive debugging.

### Architectural Fix

- Introduce lightweight internal metrics.

### Tradeoff Introduced

- Minor instrumentation overhead.

### Bottleneck

Every DNS query performs:

- authentication lookup
- analytics DB write

Problems:

- repeated auth work
- increased latency
- DB dependency inside hot path

---

## Phase 4: Authentication Cache

### Goal

- Reduce repeated authentication DB lookups.

### Features

- in-memory auth cache
- cache-aside pattern
- TTL invalidation

### Lightweight Monitoring

Track:

- cache hit ratio
- cache miss ratio
- cache memory usage

### Learn

- cache hit ratios
- TTL semantics
- cache invalidation
- observability-driven tuning

### Immediate Improvement

Reduces:

- auth DB pressure
- lookup latency

### Bottleneck

- Authentication still occurs per DNS query.
- Cache reduces pain. It does not remove root inefficiency.

---

## Phase 5: Connection-Scoped Authentication

### Key Observation

- DoT clients reuse persistent TLS connections.
- Authentication is connection-scoped, not query-scoped.

### Goal

- Remove authentication from query hot path.

### Features

- authenticate during TLS handshake
- store policy in connection context
- reuse policy across queries

### Lightweight Benchmarking

Compare:

- per-query auth latency
- connection-scoped auth latency

### Learn

- lifecycle-aware optimization
- hot vs cold paths
- protocol-aware engineering
- microbenchmarking

### Immediate Improvement

Massive reduction in:

- auth lookups
- cache usage
- allocations
- latency

### Failure Discovered

- Repeated authentication work consumed unnecessary resources.

### Why It Happened

- Authentication logic ignored TLS connection lifecycle.

### Architectural Fix

- Move authentication into connection establishment phase.

### Tradeoff Introduced

- Connection state management complexity increases.

### Bottleneck

- Queries are still handled sequentially.

---

## Phase 6: Parallel Query Processing

### Goal

- Utilize multicore concurrency.

### Features

- goroutine worker model
- parallel DNS processing
- parallel upstream resolution
- panic recovery wrappers
- per-connection isolation

### Lightweight Concurrency Testing

Run:

- race detector
- concurrent request tests
- worker saturation tests

### Learn

- Go scheduler
- multicore scaling
- concurrent workloads
- race conditions
- failure isolation

### Immediate Improvement

Better:

- throughput
- CPU utilization
- concurrent user handling

### Bottleneck

- Concurrent TCP writes corrupt DNS responses.

---

## Phase 7: Single Writer Architecture

### Goal

- Fix TCP write races safely.

### Features

- dedicated writer goroutine
- response channels
- worker/writer separation

### Lightweight Queue Monitoring

Track:

- response queue depth
- writer backlog
- dropped responses

### Learn

- producer-consumer architectures
- synchronization patterns
- socket safety
- backpressure awareness

### Immediate Improvement

- Stable concurrent DNS processing.

### Failure Discovered

- Concurrent workers writing to the same TCP socket caused response corruption.

### Why It Happened

- TCP sockets are byte streams, not message-aware channels.
- Concurrent writes interleaved packet data.

### Architectural Fix

- Dedicated single-writer goroutine.

### Tradeoff Introduced

- Additional coordination complexity.

### Bottleneck

- Real latency sources now become visible:
- upstream latency
- repeated queries
- analytics latency

---

## Phase 8: DNS Response Cache

### Goal

- Reduce upstream dependency and latency.

### Features

- TTL-aware DNS cache
- positive cache
- negative cache
- blocked-response cache
- request deadlines
- upstream timeout propagation

### Lightweight Observability

Track:

- cache hit ratio
- eviction rate
- stale entry count
- memory growth

### Learn

- DNS TTL semantics
- cache invalidation
- hit-rate analysis
- memory-performance tradeoffs
- timeout propagation

### Immediate Improvement

Huge reduction in:

- upstream traffic
- external dependency
- query latency

### Bottleneck

- Memory usage increases significantly.

---

## Phase 9: Async Analytics Pipeline

### Observation

- Analytics writes affect DNS latency.
- Analytics is non-critical work.
- DNS resolution is latency-critical.

### Goal

- Decouple analytics from DNS hot path.

### Features

- message queue
- async producers
- consumer workers
- batched DB writes
- bounded queues
- enqueue deadlines

### Architecture

```
Resolver
↓
Queue
↓
Consumers
↓
Analytics DB
```

### Queue Overflow Policies

Under pressure:

- drop newest analytics
- probabilistic sampling
- bounded memory usage

### Lightweight Queue Safety

Track:

- queue depth
- enqueue latency
- consumer lag
- dropped analytics events

### Graceful Degradation

Under pressure:

- analytics may be dropped
- DNS resolution must continue

### Learn

- event-driven systems
- buffering
- backpressure
- eventual consistency
- graceful degradation
- overload protection

### Immediate Improvement

- DNS latency no longer depends on DB performance.

### Failure Discovered

- Slow analytics writes degraded DNS response times.

### Why It Happened

- Non-critical operations existed inside latency-sensitive paths.

### Architectural Fix

- Asynchronous analytics pipeline.

### Tradeoff Introduced

- Analytics becomes eventually consistent.

### Bottleneck

- Filtering quality remains limited.

---

## Phase 10: Production Blocklists

### Goal

- Improve filtering quality.

### Features

- categorized blocklists
- ads
- trackers
- malware
- adult
- social categories

### Use

- [HaGeZi Blocklists](https://github.com/hagezi/dns-blocklists)

### Lightweight Quality Monitoring

Track:

- false positive reports
- category hit counts
- blocked domain frequency

### Learn

- large dataset handling
- category-driven filtering
- false-positive handling

### Immediate Improvement

- Production-grade filtering quality.

### Bottleneck

- Hashmaps become inefficient for suffix matching.

---

## Phase 11: Trie/Radix Domain Matching

### Goal

- Efficient wildcard and suffix domain matching.

### Features

- reversed trie
- radix tree
- wildcard matching

### Lightweight Benchmarking

Benchmark:

- hashmap lookup speed
- trie lookup speed
- memory consumption

### Learn

- memory locality
- compressed trees
- algorithmic optimization

### Immediate Improvement

Efficient handling of:

- *.doubleclick.net

### Bottleneck

- System complexity makes performance assumptions unreliable.

---

## Phase 12: Load Testing & Capacity Discovery

### Goal

- Discover real system limits under realistic traffic.

### Motivation

The system now includes:

- concurrency
- caches
- async pipelines
- advanced filtering
- Performance assumptions are no longer trustworthy.

### Features

- synthetic DNS traffic generation
- throughput testing
- stress testing
- saturation analysis
- tail latency measurement
- upstream failure simulation

### Use

- [dnsperf](https://www.dnsperf.com/)
- [k6](https://k6.io)
- [Vegeta](https://github.com/tsenart/vegeta)

### Learn

- saturation behavior
- p95/p99 latency
- throughput collapse
- queue buildup
- coordinated omission
- capacity planning

### Immediate Improvement

Performance tuning becomes:

- measurable
- reproducible
- evidence-driven

### Failure Discovered

- Latency spikes dramatically near saturation.

### Why It Happened

- Queue buildup and contention amplified wait times.

### Architectural Fix

- Concurrency tuning and queue balancing.

### Tradeoff Introduced

- System tuning becomes workload-dependent.

### Bottleneck

- Performance bottlenecks still lack precise attribution.

---

## Phase 13: Profiling & Benchmarking

### Goal

- Stop guessing performance bottlenecks.

### Features

- pprof
- flamegraphs
- allocation profiling
- mutex profiling
- latency histograms
- benchmark suites

### Use

- [Go pprof](https://pkg.go.dev/net/http/pprof)

### Learn

- CPU profiling
- allocation analysis
- GC profiling
- mutex contention analysis
- evidence-driven optimization

### Immediate Improvement

- Optimization becomes data-driven instead of intuition-driven.

---

## Phase 14: Memory Optimization

### Goal

- Reduce allocation overhead and GC pauses.

### Features

- sync.Pool
- reusable buffers
- reusable DNS messages
- allocation reduction

### Lightweight GC Monitoring

Track:

- allocation rate
- GC pause duration
- heap growth
- pool reuse efficiency

### Learn

- Go memory internals
- escape analysis
- GC behavior

### Immediate Improvement

Lower:

- memory churn
- latency spikes
- GC pauses

### Bottleneck

- Local development and infrastructure management become increasingly complex.

---

## Phase 15: Containerized Development

### Goal

- Create reproducible development environments.

### Features

- containerization
- Dockerfile
- multistage builds
- minimal runtime images
- health checks
- graceful shutdown
- worker draining
- queue draining
- startup config validation

### Operational Necessity

Local setups became:

- inconsistent
- machine-dependent
- difficult to reproduce

### Operational Tooling

- [Docker](https://www.docker.com)
- [GitHub Actions](https://github.com/features/actions)

### Learn

- container isolation
- runtime packaging
- reproducible environments
- automated validation
- graceful lifecycle handling
- fail-fast configuration validation

### Immediate Improvement

Consistent:

- development
- testing
- CI environments

---

## Phase 16: Local Multi-Service Infrastructure

### Goal

- Run the entire infrastructure stack reproducibly.

### Features

Local stack:

- resolver
- Redis
- analytics DB
- queue broker
- metrics stack
- blocklist updater

### Lightweight Operational Visibility

Introduce basic dashboards for:

- request rate
- cache hit ratio
- queue depth
- upstream latency

### Learn

- inter-container networking
- local orchestration
- service dependencies
- infrastructure reproducibility

### Immediate Improvement

- Full-stack local infrastructure testing becomes practical.

### Bottleneck

- Live blocklist updates require downtime.

---

## Phase 17: Hot Reloadable Blocklists

### Goal

- Update filters without downtime.

### Features

- background blocklist updater
- atomic map swaps
- lock-free reads
- feature flags

### Graceful Degradation

If updates fail:

- continue using last known good blocklists

### Learn

- immutable structures
- synchronization-free updates
- fail-safe deployment behavior
- controlled feature rollout

### Immediate Improvement

- Zero-downtime blocklist refreshes.

### Bottleneck

- Single-machine scaling limitations appear.

---

## Phase 18: Distributed Resolver Architecture

### Goal

- Scale horizontally.

### Features

- multiple resolver nodes
- shared cache
- regional deployments
- load balancing
- stateless resolver design

### Learn

- distributed systems
- consistency models
- failover strategies
- horizontal scalability

### Immediate Improvement

Higher:

- scalability
- availability
- regional performance

### Operational Necessity

Distributed systems now require:

- centralized visibility
- reproducible infrastructure
- configuration consistency
- image distribution
- synthetic monitoring

### Operational Tooling

#### Monitoring & Metrics

- [Prometheus](https://prometheus.io)
- [Grafana](https://grafana.com)

#### Centralized Logging

- [Loki](https://grafana.com/oss/loki/)
- [Elastic Stack](https://www.elastic.co/elastic-stack)

#### Infrastructure as Code

- [Terraform](https://developer.hashicorp.com/terraform)

#### Configuration Management

- [Ansible](https://www.ansible.com)

#### Artifact Management

- [GitHub Container Registry](https://ghcr.io)
- [Docker Hub](https://hub.docker.com)

### Bottleneck

- Single upstream dependency creates fragility.

---

## Phase 19: Upstream Resilience & Failure Handling

### Goal

- Survive unreliable upstream resolvers without affecting users.

### Features

- multiple upstream providers
- upstream health tracking
- adaptive upstream selection
- timeout tuning
- retry policies
- exponential backoff
- upstream cooldown windows
- circuit breakers
- half-open recovery states
- client rate limiting
- token bucket throttling
- admission control
- overload shedding

### Example Upstreams

- Cloudflare
- Google
- Quad9

### Graceful Degradation

Under partial upstream failure:

- serve stale cache entries
- reduce retry aggressiveness
- temporarily disable expensive analytics

### Lightweight Reliability Metrics

Track:

- upstream failure rate
- retry amplification
- stale cache serving frequency
- throttle activation rate
- admission rejection rate

### Learn

- resilience engineering
- tail latency mitigation
- cascading failure prevention
- backpressure systems
- overload handling
- circuit breaker behavior

### Immediate Improvement

Resolver becomes:

- fault tolerant
- outage resistant
- safer for public exposure

### Operational Necessity

Request flows now involve:

- retries
- queues
- failover
- async pipelines
- distributed latency sources
- Operational debugging becomes difficult.

### Operational Tooling

#### Distributed Tracing

- [OpenTelemetry](https://opentelemetry.io)
- [Jaeger](https://www.jaegertracing.io)

#### Secrets Management

- [HashiCorp Vault](https://www.vaultproject.io)

#### Reliability & Alerting

#### Concepts:

- SLIs
- SLOs
- error budgets
- actionable alerts
- saturation alerts

#### Tools:

- Alertmanager
- Grafana alerts

#### Synthetic Monitoring:

- regional DNS probes
- external latency checks
- uptime verification

---

## Phase 20: Self-hosted Recursive Resolution

### Goal

- Remove external upstream dependency entirely.

### Features

- recursive resolution
- root hints
- DNSSEC validation
- authoritative hierarchy traversal

### Use

- [Unbound](https://nlnetlabs.nl/projects/unbound/about/)

### Learn

- recursive DNS
- authoritative resolution
- root/TLD hierarchy
- DNSSEC

### Immediate Improvement

- Greater:
- privacy
- independence
- control

### Bottleneck

- Operational complexity increases significantly.

---

## Phase 21: Production Hardening

### Goal

- Survive hostile real-world internet traffic.

### Features

- abuse detection
- amplification protection
- adaptive rate limiting
- ECS stripping
- malformed packet protection
- connection caps
- slow-client handling
- NXDOMAIN flood protection
- random subdomain attack mitigation
- cache poisoning protection
- slow TLS exhaustion handling

### Learn

- defensive infrastructure engineering
- internet abuse patterns
- attack surface reduction

### Immediate Improvement

- Internet-safe public resolver infrastructure.

### Operational Necessity

Large-scale distributed infrastructure now requires:

- orchestration
- automated reconciliation
- zero-downtime deployments
- autoscaling
- declarative operations

### Operational Tooling

#### Container Orchestration

- [Kubernetes](https://kubernetes.io)

#### GitOps & Declarative Delivery

- [Argo CD](https://argo-cd.readthedocs.io)

#### Security & Supply Chain Scanning

- [Trivy](https://trivy.dev)
- [Dependabot](https://github.com/dependabot)

#### Deployment Reliability Concepts

- rolling deployments
- canary deployments
- blue-green deployments
- graceful shutdown
- connection draining
- zero-drop deploys

### Final Outcome

By the end, ShieldBlock naturally evolves into a project covering:

- DNS
- TLS
- Networking
- Concurrency
- Caching
- Event-driven systems
- Distributed systems
- Performance engineering
- Benchmarking
- Profiling
- Memory optimization
- Reliability engineering
- Resilience engineering
- Observability
- Infrastructure engineering
- Containerization
- CI/CD
- Infrastructure as Code
- Distributed tracing
- Configuration management
- Production operations
- Security engineering
- GitOps
- Kubernetes

