---
title: "Multiprogramming and timesharing"
description: How multiprogramming keeps the CPU busy, how timesharing makes computing interactive, job vs CPU scheduling, swapping, and virtual memory.
tags: [operating-systems, os-basics]
---
# Multiprogramming and timesharing

*Slides 1.53–1.54 · Part of [[00-overview|Chapter 1 overview]]*

These are the two core ideas behind how an OS structures its work.

## Multiprogramming (batch systems)

**Multiprogramming is needed for efficiency.**
- A **single user cannot keep the CPU and I/O devices busy at all times**. Programs constantly stop to wait for I/O, and the CPU would sit idle.
- Multiprogramming **organizes jobs** (code and data) **so the CPU always has one to execute**.

**How it works:**
1. A **subset of the total jobs** in the system is **kept in memory**. The rest wait on disk.
2. **One job is selected and run**. Choosing which jobs to bring into memory is called **job scheduling**.
3. When that job **has to wait** (for I/O, for example), the **OS switches to another job**.
4. The CPU is never idle as long as some job is ready to run.

### Memory layout (slide 1.54)

```text
0      ┌──────────────────┐
       │ operating system │
       ├──────────────────┤
       │ job 1            │
       ├──────────────────┤
       │ job 2            │
       ├──────────────────┤
       │ job 3            │
       ├──────────────────┤
       │ job 4            │
512M   └──────────────────┘
```

The OS occupies the lowest addresses, starting at 0. Several jobs share the rest of the 512 MB at the same time.

## Timesharing (multitasking)

**Timesharing** is the **logical extension** of multiprogramming. The **CPU switches jobs so frequently that users can interact with each job while it is running**. This creates **interactive computing**.

- **Response time should be < 1 second.**
- **Each user has at least one program executing in memory.** A program loaded into memory and executing is called a **process**.
- **If several jobs are ready to run at the same time**, the OS must choose among them. This is **CPU scheduling**.
- **If the processes don't fit in memory**, **swapping** moves them between memory and disk so they can run.
- **Virtual memory** allows the execution of processes that are **not completely in memory**.

## Multiprogramming vs timesharing

| | Multiprogramming (batch) | Timesharing (multitasking) |
| --- | --- | --- |
| Goal | **Efficiency**: keep the CPU busy | **Interactivity**: fast response to users |
| When it switches jobs | When the running job **waits** (e.g. for I/O) | **Very frequently**, even if the job doesn't wait |
| Users | Not interacting while jobs run | Interacting with running programs |
| Response time | Not a concern | **< 1 second** |
| Needs | Job scheduling | CPU scheduling, swapping, virtual memory |

## Job scheduling vs CPU scheduling

| Job scheduling | CPU scheduling |
| --- | --- |
| Which jobs on disk to **bring into memory** | Which job **already in memory** runs **next on the CPU** |

On a single core, the switching makes processes **concurrent** without being **parallel** ([[14-cores-threads-concurrency|concurrency vs parallelism]]). Switching depends on [[08-interrupts|interrupts]]: an I/O request or completion, or the [[17-dual-mode-and-timer|timer]], gives the OS the chance to switch.

Processes, CPU scheduling, swapping, and virtual memory each get their own chapter later in the book.

## Check yourself

> [!question]- Why is multiprogramming needed?
> A single program can't keep the CPU and I/O devices busy, because it often waits for I/O. Keeping several jobs in memory lets the OS switch to another job instead of leaving the CPU idle.

> [!question]- How does timesharing extend multiprogramming?
> It switches between jobs so often (response time under 1 second) that users can interact with each job while it runs.

> [!question]- What is the difference between job scheduling and CPU scheduling?
> Job scheduling picks which jobs to bring into memory. CPU scheduling picks which ready job in memory runs next.

> [!question]- What do swapping and virtual memory solve?
> Processes that don't fit in memory. Swapping moves whole processes between memory and disk. Virtual memory lets a process run while only part of it is in memory.

---
[[15-clustered-systems|← Clustered systems]] · [[00-overview|Overview]] · [[17-dual-mode-and-timer|Next: Dual mode and the timer →]]
