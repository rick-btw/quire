---
title: "Multiprocessor systems"
description: Single-processor vs multiprocessor systems, the advantages of multiprocessing, asymmetric vs symmetric multiprocessing, and multicore vs multiprocessor.
tags: [operating-systems, architecture]
---
# Multiprocessor systems

*Slides 1.43–1.45, 1.48 · Part of [[00-overview|Chapter 1 overview]]*

## Single-processor systems

- **Most systems use a single general-purpose processor.**
- **Most systems also have special-purpose processors**, such as the small processors inside disk controllers or keyboards. They run limited, device-specific code, not user programs, so having them doesn't make a system a multiprocessor.

## Multiprocessor systems

**Multiprocessor systems** have two or more processors in close communication, sharing the bus, memory, and devices. They are also known as **parallel systems** or **tightly-coupled systems**, and they are growing in use and importance.

### Advantages

1. **Increased throughput.** More work gets done in less time. The speed-up with *N* processors is **less than *N***, because the processors spend time coordinating and competing for shared resources.
2. **Economy of scale.** It can cost less than several single-processor systems, because the processors **share** peripherals, storage, and power supplies.
3. **Increased reliability.** If one processor fails, the others carry on. There are two levels:
   - **Graceful degradation**: the system keeps providing service in proportion to the surviving hardware.
   - **Fault tolerance**: the system keeps working even when a component fails.

### Two types

| Asymmetric multiprocessing (AMP) | Symmetric multiprocessing (SMP) |
| --- | --- |
| **Each processor is assigned a specific task** | **Each processor performs all tasks** |
| A boss–worker relationship: one processor controls and assigns work to the others | All processors are peers |
| | The most common type today |

### SMP architecture (slide 1.44)

```text
 ┌──────────┐  ┌──────────┐  ┌──────────┐
 │  CPU 0   │  │  CPU 1   │  │  CPU 2   │
 │registers │  │registers │  │registers │
 │  cache   │  │  cache   │  │  cache   │
 └────┬─────┘  └────┬─────┘  └────┬─────┘
      └─────────────┼─────────────┘
                 memory
```

Each CPU has its **own registers and cache**, and all CPUs **share the same physical memory**. Because the caches are private, copies of the same data must be kept consistent ([[12-storage-hierarchy-and-caching|cache coherency]]).

## Multicore: multiple cores on one chip

Slide 1.45 shows a **dual-core design**: **two CPU cores on a single chip**, each with its own registers and cache, sharing memory. Systems can be built as:
- **Multi-chip**: several separate processor chips.
- **Multicore**: several cores on one chip.
- **Systems containing all chips**, including a **chassis containing multiple separate systems**, such as blade servers.

> [!info] Beyond the slides: why multicore
> Multicore chips are more efficient than several single-core chips. Communication on one chip is faster than between chips, and one multicore chip uses much less power.

## Multicore vs multiprocessor (slide 1.48)

| Multicore | Multiprocessor |
| --- | --- |
| **One CPU** (chip) with several cores | **Several CPUs** |
| The slide's rule of thumb: to make **a single program run faster**, use a multicore processor | A quad-processor system executes four processes at a time, and an octa-processor system eight |

A multicore chip only speeds up one program if that program is written with several threads, so the cores have work to share ([[14-cores-threads-concurrency|cores and threads]]). Both kinds of system can run instructions on separate cores or processors at the same time. That is **parallelism**, explained in the same note.

The next step up from a multiprocessor is linking whole computers together: [[15-clustered-systems|clustered systems]].

## Check yourself

> [!question]- What are the three advantages of multiprocessor systems?
> Increased throughput, economy of scale, and increased reliability (graceful degradation or fault tolerance).

> [!question]- Why is the speed-up with N processors less than N?
> The processors spend time coordinating and competing for shared resources like memory and the bus.

> [!question]- What is the difference between asymmetric and symmetric multiprocessing?
> In AMP, each processor is assigned a specific task, and one processor directs the others. In SMP, every processor performs all tasks as a peer.

> [!question]- What is the difference between graceful degradation and fault tolerance?
> With graceful degradation, service continues in proportion to the surviving hardware. With fault tolerance, the system keeps operating despite a component failure.

> [!question]- What is the difference between multicore and multiprocessor?
> Multicore is one CPU chip with several cores. Multiprocessor is several CPUs.

---
[[12-storage-hierarchy-and-caching|← Storage hierarchy and caching]] · [[00-overview|Overview]] · [[14-cores-threads-concurrency|Next: Cores, threads, concurrency →]]
