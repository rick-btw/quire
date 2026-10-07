---
title: "Cores, threads, concurrency and parallelism"
description: What a CPU core is, what a thread is, how the OS scheduler maps threads onto cores, and the difference between concurrency and parallelism.
tags: [operating-systems, architecture]
---
# Cores, threads, concurrency and parallelism

*Slides 1.46–1.50 · Part of [[00-overview|Chapter 1 overview]]*

CPU cores and threads are two essential parts of how a processor runs work, and both have a big effect on its overall performance.

## Core vs thread

| | **Core** | **Thread** |
| --- | --- | --- |
| Kind | A **physical** hardware unit | A **logical software** unit |
| Definition | Can **execute instructions independently** | A sequence of instructions that **runs on a single core** |
| Made of | Control unit, ALU, cache (slide 1.47) | Its own CPU state: registers and program counter |

### Inside a multicore chip (slide 1.47)

The figure shows a quad-core processor:

```text
┌──────────────────────────────────────────────┐
│  core 0    core 1    core 2    core 3        │  each core: control unit,
│  L1        L1        L1        L1            │  ALU, cache memory
│  L2        L2        L2        L2            │
│  ─────────── shared level-3 cache ────────── │
│  memory controller      system interface     │
└────────┬───────────────────────┬─────────────┘
         │                       │
     RAM (DIMMs)           I/O interface ── storage
```

- Each core has its own **L1** and **L2** caches. All cores share one **L3** cache. This is the [[12-storage-hierarchy-and-caching|storage hierarchy]] inside the chip.
- The **memory controller** connects to RAM, and the **system interface** connects to I/O.

## Processes, threads, and the scheduler (slides 1.49–1.50)

A **process** is a program in execution ([[16-multiprogramming-and-timesharing|timesharing]]). A process can contain **several threads**.

- **Each thread** has its own **CPU state**: its registers and its place in the code.
- The **threads of one process share** that process's **memory** and **I/O state**.

The OS's **CPU scheduler** decides which threads run on which cores:

```text
Process 1: thread thread …   Process N: thread thread …
             \     |     \       /      |      /
              ───────── OS CPU scheduler ─────────
                 /        |        |        \
             core 1    core 2    core 3    core 4     → 4 threads at a time
```

A machine with 4 cores can **truly run 4 threads at the same instant**. All other threads wait their turn, and the scheduler switches between them. Slide 1.50 shows the same idea on a bigger scale: software threads → scheduler → several CPUs with 2 cores each, each CPU with its own memory cache.

> [!info] Beyond the slides: "8 cores, 16 threads"
> CPU spec sheets often list more threads than cores. That's **hardware multithreading** (Intel calls it Hyper-Threading): each core keeps the state of two threads and switches between them very quickly, for example while one waits for memory. Those "threads" are hardware threads, separate from the software threads above.

## Concurrency vs parallelism (slide 1.48)

| **Concurrent** | **Parallel** |
| --- | --- |
| Supports **two or more actions in progress** at the same time | Supports **two or more actions executing simultaneously** |
| Possible on **one core**: the CPU switches between tasks, so they take turns | Needs **multiple cores or processors** |

- **Every parallel system is concurrent, but not every concurrent system is parallel.**
- On a single core, timesharing gives concurrency without parallelism. Tasks are interleaved, so they only *look* simultaneous.
- On a multicore chip, tasks can run truly in parallel, one per core.

```text
concurrent (1 core):    A A B B A A B B A A      ← interleaved
parallel  (2 cores):    core 1: A A A A A
                        core 2: B B B B B        ← at the same instant
```

Where these cores live, and how many CPUs a system has, is covered in [[13-multiprocessor-systems|multiprocessor systems]].

## Check yourself

> [!question]- What is the difference between a core and a thread?
> A core is a physical unit that can execute instructions independently. A thread is a logical software unit of execution that runs on a core.

> [!question]- What do threads of the same process share, and what is private to each?
> They share the process's memory and I/O state. Each has its own CPU state (registers and program counter).

> [!question]- How many threads can a 4-core CPU run at the same instant (ignoring hardware multithreading)?
> Four. The scheduler takes turns among the rest.

> [!question]- What is the difference between concurrency and parallelism?
> Concurrency means several tasks are in progress, possibly by taking turns on one core. Parallelism means they execute at the same instant on different cores. Parallel implies concurrent, but not the reverse.

---
[[13-multiprocessor-systems|← Multiprocessor systems]] · [[00-overview|Overview]] · [[15-clustered-systems|Next: Clustered systems →]]
