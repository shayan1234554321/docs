---
name: overdrive
description: Optimize code for large-scale data processing, complex algorithms, database queries with millions of rows, and performance-critical operations. Use when dealing with millions of records, complex computations, slow queries, batch processing, or performance bottlenecks.
user-invocable: true
argument-hint: "[target (query, algorithm, process, batch job...)]"
---

Optimize code for large-scale data processing, complex algorithms, database operations on millions of rows, and performance-critical paths. **For real bottlenecks only—not micro-optimizations.**

## MANDATORY PREPARATION

**Before using**: Profile and identify the actual bottleneck, OR work with demonstrably large data (millions of records), OR provably slow algorithms (O(n²) or worse), OR user explicitly states there's a performance issue.

**STEP 0 — Read CLAUDE.md** for project architecture and existing patterns.

**Understand the problem**:
- Data volumes and current vs target performance
- Run frequency (batch vs continuous) and resource constraints

---

## STEP 1 — Diagnose the Bottleneck

**Never guess—always profile first.**
```bash
# Node: node --prof or clinicjs doctor
# Python: python -m cProfile -s cumtime
# Database: EXPLAIN ANALYZE your_query;
```

**Types of bottlenecks**:
- **CPU-Bound**: Complex calculations, sorting, data transformation
- **Memory-Bound**: Large dataset loading, memory leaks, excessive object creation
- **I/O-Bound**: Database queries, file operations, network requests
- **Network-Bound**: Large payloads, sequential requests, missing batching

**Common patterns to look for**:
- **N+1 queries**: Individual queries in loops instead of batch joins
- **Loading all data**: `SELECT *` for large tables instead of streaming/pagination
- **O(n²) algorithms**: Nested loops that can use Map/Set for O(n)
- **Blocking computation**: Heavy sync work that blocks event loops

---

## STEP 2 — Database Optimization

**Always run EXPLAIN ANALYZE first.** Look for Seq Scans, Nested Loops (good or bad depending on size), Hash Joins, and row estimate vs actual mismatches (stale stats).

**Index strategically**:
- High-cardinality columns in WHERE clauses
- Foreign keys (if not already indexed)
- Composite indexes for multi-column filters
- Partial indexes for specific query patterns

**Query patterns**:
- Select only needed columns, not `*`
- Use pagination (LIMIT/OFFSET or cursor-based) for large results
- Batch inserts instead of individual inserts
- Use connection pooling

---

## STEP 3 — Algorithm Optimization

**Target the lowest feasible complexity**: O(1) > O(log n) > O(n) > O(n log n) > O(n²) > O(2^n)

**Use appropriate data structures**:
- Array find O(n) → Map get O(1)
- Memoize repeated calculations
- Use generators for lazy evaluation of large sequences

**Stream large data**: Process in chunks rather than loading everything into memory.

---

## STEP 4 — Memory Optimization

- Use primitives/structured formats over object overhead where possible
- Release references when done (nullify, clear maps)
- Use WeakMap/WeakSet for object-keyed caches
- Batch process—don't hold 10M items in memory at once

---

## STEP 5 — Concurrency & Parallelization

- Parallelize independent operations with `Promise.all`
- Offload CPU-bound work to Worker threads
- Use job queues for background processing of heavy payloads
- Control concurrency with batching to avoid overwhelming resources

---

## STEP 6 — Caching Strategies

- In-memory cache with TTL for frequently accessed data
- LRU cache (e.g., quick-lru) for bounded memory
- Redis/application-level cache for query results

---

## STEP 7 — Generate Report

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Execution Time | ?ms | ?ms | ?% |
| Memory Usage | ?MB | ?MB | ?% |
| DB Queries | ? | ? | ? fewer |

**Document**: Root cause, evidence (profiling output), each optimization applied (what/why/impact), remaining opportunities with trade-offs.

**Validate**: Benchmark before/after, test at production scale, verify correctness, check for memory leaks, monitor under load.

---

## NEVER
- Optimize without profiling
- Guess at bottlenecks (measure, don't guess)
- Break correctness for marginal gains
- Ignore that one bottleneck masks another
- Over-engineer for data that isn't actually large
- Trade maintainability for performance without clear justification
- Skip testing with realistic data volumes
