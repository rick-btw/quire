---
title: "Clustered systems"
description: Clusters of whole computers sharing storage over a SAN. Covers high availability, asymmetric vs symmetric clustering, HPC clusters, and distributed lock managers.
tags: [operating-systems, architecture]
---
# Clustered systems

*Slides 1.51–1.52 · Part of [[00-overview|Chapter 1 overview]]*

A **clustered system** is like a [[13-multiprocessor-systems|multiprocessor system]], but made of **multiple whole systems working together**. Each node is a complete computer with its own CPUs, memory, and OS.

```text
 computer ── interconnect ── computer ── interconnect ── computer
     │                          │                           │
     └──────────────── storage-area network ────────────────┘
                         (shared storage)
```

- The nodes are usually **sharing storage via a storage-area network (SAN)**.
- The nodes are connected by an interconnect, usually a fast local network. That makes clusters **loosely coupled**, unlike tightly coupled multiprocessors.

## High availability

Clusters provide a **high-availability service: one that survives failures**. If one node fails, another takes over its work. With shared storage, the surviving node can reach the same data.

| **Asymmetric clustering** | **Symmetric clustering** |
| --- | --- |
| **One machine is in hot-standby mode.** It does nothing but monitor the active server, and takes over if that server fails | **Multiple nodes are running applications** and **monitoring each other** |
| Simple, but the standby hardware sits idle | More efficient, because all hardware does useful work. Needs more than one application to run |

## High-performance computing (HPC)

- **Some clusters are for high-performance computing**: many nodes work on one big problem together.
- **Applications must be written to use parallelization.** The program has to be split into parts that run on different nodes at the same time ([[14-cores-threads-concurrency|parallelism]]).

## Distributed lock manager (DLM)

When several nodes share the same storage, two of them could change the same data at once and corrupt it. **Some clusters have a distributed lock manager (DLM) to avoid conflicting operations.** A node must hold the lock on a piece of data before it can change it.

## Multiprocessor vs cluster

| | Multiprocessor | Cluster |
| --- | --- | --- |
| Made of | Several CPUs in **one** computer | Several **whole computers** |
| Coupling | Tightly coupled (shared memory and bus) | Loosely coupled (network) |
| Shares | Memory, bus, devices | Storage (through a SAN) |
| Survives the failure of | A processor (graceful degradation) | A whole machine (high availability) |

## Check yourself

> [!question]- How is a cluster different from a multiprocessor?
> A cluster links whole computers over a network, sharing storage through a SAN. A multiprocessor has several CPUs in one computer sharing memory.

> [!question]- What is the difference between asymmetric and symmetric clustering?
> In asymmetric clustering, one machine is a hot standby that only monitors the active server and takes over if it fails. In symmetric clustering, all nodes run applications and monitor each other.

> [!question]- What is a DLM for?
> It prevents conflicting operations on shared data, by making nodes hold a lock before they change it.

> [!question]- What do HPC applications need in order to benefit from a cluster?
> They must be written to use parallelization, so their work can be split across nodes.

---
[[14-cores-threads-concurrency|← Cores, threads, concurrency]] · [[00-overview|Overview]] · [[16-multiprogramming-and-timesharing|Next: Multiprogramming and timesharing →]]
