---
title: "Quiz 6: Amdahl to Round Robin (Chapters 4–5)"
description: Quiz prep from Amdahl's law in chapter 4 (Threads) to Round Robin in chapter 5 (CPU Scheduling). Covers speedup laws, multithreading models, implicit threading, threading issues, scheduling criteria, and FCFS, SJF, SRT, priority, HRN, lottery and RR, with likely quiz questions and 5-minute answers.
tags: [operating-systems, quiz-prep]
---
# Quiz 6: Amdahl to Round Robin (Chapters 4–5)

> [!abstract] This note is for **Quiz 6**: chapter 4 slides **4.11–4.33**, then chapter 5 slides **1–29**
> It starts at Amdahl's law and stops at Round Robin, just before Multilevel Queue. Related notes: [[chapter-3-quiz-4|Quiz 4]] (schedulers, context switch, `fork`/`exec`) and [[14-cores-threads-concurrency|cores, threads, concurrency]].
>
> **Finding things in the book:** your "Chapter 5" deck is **Chapter 6** of the 9th-edition textbook, which is why its slide footers say 6.x. Slide numbers in Part 2 below are the page numbers of the PDF, which match those footers.

> [!warning] Last year's quiz PDF has nothing from this range
> It only covers boot, OS services, OS structures, and context switch/PCB, so the [likely questions](#likely-quiz-questions-and-5-minute-answers) are educated guesses. Every past quiz asked for **one topic as a list or an explanation**. This range also has the first real calculations of the course, so be ready for a **Gantt chart with average waiting time** as well.

## Part 1: Threads (chapter 4)

### 1. Amdahl's law (slide 4.11)

Amdahl's law gives the performance gain from adding cores to an application that has both **serial** and **parallel** parts. **S** is the serial fraction and **N** is the number of cores.

$$
\text{speedup} \le \frac{1}{S + \dfrac{1 - S}{N}}
$$

**The slide's example:** 75% parallel and 25% serial, going from 1 to 2 cores:

$$
\frac{1}{0.25 + \frac{0.75}{2}} = \frac{1}{0.625} = 1.6
$$

**As $N \to \infty$, speedup approaches $1/S$.** The serial part puts a hard ceiling on the gain, so it has a **disproportionate effect** on performance.

| Serial part $S$ | 2 cores | 4 cores | 8 cores | 16 cores | Limit ($1/S$) |
| --- | --- | --- | --- | --- | --- |
| 5% | 1.90 | 3.48 | 5.93 | 9.14 | **20** |
| 10% | 1.82 | 3.08 | 4.71 | 6.40 | **10** |
| 25% | 1.60 | 2.29 | 2.91 | 3.37 | **4** |
| 50% | 1.33 | 1.60 | 1.78 | 1.88 | **2** |

### 2. Gustafson's law (slide 4.12)

Gustafson's law starts from two observations:
- When the **problem gets bigger**, its **sequential part stays constant**.
- When the **number of processors grows**, the **work on each of them stays the same**. (The slide's sentence is cut off after "still"; this is what it's saying.)

$$
S(P) = P - \alpha\,(P - 1)
$$

Here **P** is the number of processors, **S** is the speedup, and **α** is the non-parallelizable fraction.

**Example:** α = 0.25 on 4 processors gives $4 - 0.25 \times 3 = 3.25$. Amdahl's law gives only 2.29 for the same numbers, because it keeps the problem size fixed.

| Aspect | **Amdahl** | **Gustafson** |
| --- | --- | --- |
| Problem size | **Fixed** | **Scales with N** |
| Perspective | **Pessimistic** | **Optimistic** |
| Use case | Latency-bound | Throughput-bound |
| Speedup limit | $1/S$ | **Unbounded (linear)** |

> [!note] Watch the letter P on slide 4.12
> The slide's table writes Amdahl's limit as $\frac{1}{1-P}$. There, **P is the parallel fraction**, so it's the same as $1/S$. In the formula just above it, **P is the number of processors**.

### 3. User threads and kernel threads (slide 4.13)

| | **User threads** | **Kernel threads** |
| --- | --- | --- |
| Managed by | A **user-level thread library** | **The kernel** |
| Examples | **POSIX Pthreads, Windows threads, Java threads** | Virtually all general-purpose OSes: **Windows, Solaris, Linux, Tru64 UNIX, Mac OS X** |

A 4-core system might run hundreds or thousands of kernel threads.

### 4. Multithreading models (slides 4.14–4.18)

These are the ways of mapping user threads onto kernel threads.

<svg viewBox="0 0 720 200" width="100%" style="max-width:720px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Four multithreading models. Many-to-one: four user threads share one kernel thread. One-to-one: each user thread has its own kernel thread. Many-to-many: four user threads are multiplexed onto three kernel threads. Two-level: like many-to-many, but one user thread is bound to its own kernel thread." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q-models-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<text x="90.0" y="18.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">many-to-one</text>
<path d="M36,73 L90,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M72,73 L90,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M108,73 L90,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M144,73 L90,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<circle cx="36" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="36.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="72" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="72.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="108" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="108.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="144" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="144.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="90" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="90.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<text x="270.0" y="18.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">one-to-one</text>
<path d="M225,73 L225,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M270,73 L270,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M315,73 L315,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<circle cx="225" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="225.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="270" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="270.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="315" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="315.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="225" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="225.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<circle cx="270" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="270.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<circle cx="315" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="315.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<text x="450.0" y="18.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">many-to-many</text>
<path d="M396,73 L410,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M432,73 L410,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M432,73 L450,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M468,73 L450,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M468,73 L490,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M504,73 L490,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<circle cx="396" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="396.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="432" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="432.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="468" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="468.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="504" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="504.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="410" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="410.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<circle cx="450" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="450.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<circle cx="490" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="490.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<text x="630.0" y="18.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">two-level</text>
<path d="M576,73 L590,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M612,73 L590,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M612,73 L630,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M648,73 L590,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M648,73 L630,137" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M684,73 L670,137" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:2.2"/>
<circle cx="576" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="576.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="612" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="612.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="648" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="648.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="684" cy="60" r="13" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="684.0" y="64.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">U</text>
<circle cx="590" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="590.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<circle cx="630" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="630.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<circle cx="670" cy="150" r="13" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="670.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">K</text>
<text x="360.0" y="192.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">U = user thread · K = kernel thread · bold line = a user thread bound to its own kernel thread</text>
</svg>

| Model | Mapping | Key points | Examples |
| --- | --- | --- | --- |
| **Many-to-one** | Many user threads → **one** kernel thread | **One thread blocking blocks them all**. Threads **can't run in parallel** on multicore, because only one can be in the kernel at a time. Few systems use it now | Solaris Green Threads, GNU Portable Threads |
| **One-to-one** | Each user thread → **its own** kernel thread | **More concurrency** than many-to-one. Creating a user thread creates a kernel thread, so the number of threads per process is **sometimes restricted due to overhead** | Windows, Linux, Solaris 9 and later |
| **Many-to-many** | Many user threads → many kernel threads | Lets the OS create a **sufficient number** of kernel threads | Solaris before version 9 |
| **Two-level** | Like many-to-many, **but a user thread can also be bound** to a kernel thread | The bound thread gets its own kernel thread | IRIX, HP-UX, Tru64 UNIX, Solaris 8 and earlier |

### 5. Thread libraries and implicit threading (slides 4.19–4.24)

A **thread library** gives the programmer an API for creating and managing threads. It's implemented either **entirely in user space** or as a **kernel-level library** supported by the OS.

What happens under the hood on Linux: `pthread_create()` → system call (`clone()`) → the kernel creates a new thread → the kernel scheduler manages it.

**Implicit threading** means that **compilers and run-time libraries create and manage the threads**, rather than programmers. It's growing in popularity because program correctness gets harder with explicit threads as their number grows. Others include Intel TBB, `java.util.concurrent`, and Microsoft's TPL.

| Method | Idea | Details |
| --- | --- | --- |
| **Thread pools** | Create a number of threads in a pool, where they **await work** | See the three advantages below |
| **OpenMP** | **Compiler directives and an API** for C, C++, FORTRAN, for shared-memory parallel programming | Marks **parallel regions**. `#pragma omp parallel` creates as many threads as there are cores. `#pragma omp parallel for` runs a loop in parallel |
| **Grand Central Dispatch (GCD)** | Apple's technology for Mac OS X and iOS: extensions to C and C++, an API, and a run-time library | A block is written `^{ printf("I am a block"); }`. Blocks go in a **dispatch queue**, and each is assigned to an available thread in a thread pool when removed |

**The three advantages of thread pools:**
1. It's usually **slightly faster** to service a request with an existing thread than to create a new one.
2. The number of threads in the application is **bound to the size of the pool**.
3. **Separating the task from the mechanics of creating it** allows different strategies for running it, such as scheduling it to run periodically.

**GCD's two types of dispatch queue:**
- **Serial**: blocks are removed in FIFO order. The queue is per process and is called the **main queue**. Programmers can create more.
- **Concurrent**: blocks are removed in FIFO order, but **several may be removed at a time**. There are **three system-wide queues**, with priorities low, default, and high.

### 6. Threading issues (slides 4.25–4.33)

#### `fork()` and `exec()`

When a multithreaded process calls `fork()`, what happens to its threads? Some UNIXes have two versions of `fork`.

| Case | What `fork()` duplicates |
| --- | --- |
| `fork()` **followed by `exec()`** | **Only the calling thread**, because `exec()` is about to replace everything anyway |
| `fork()` **without `exec()`** | **All threads** |

`exec()` works as normal: it replaces the running process, **including all its threads**.

#### Signal handling

A **signal** notifies a process that a particular event has occurred.
1. A signal is **generated** by a particular event.
2. It is **delivered** to a process.
3. It is **handled** by one of two signal handlers: the **default** handler, which the kernel runs, or a **user-defined** handler, which can override the default.

Signals can be **synchronous or asynchronous**. In a single-threaded process the signal simply goes to the process. In a multithreaded one, there are **four options**:
1. Deliver it to **the thread the signal applies to**.
2. Deliver it to **every thread** in the process.
3. Deliver it to **certain threads** in the process.
4. Assign **a specific thread to receive all signals** for the process.

#### Thread cancellation

Cancellation terminates a thread before it has finished. The thread being cancelled is the **target thread**.

| **Asynchronous cancellation** | **Deferred cancellation** |
| --- | --- |
| Terminates the target thread **immediately**, at any point | The target thread **periodically checks** whether it should be cancelled, and ends only at **cancellation points** |

A cancellation is only a **request**. What actually happens depends on the thread's state:

| Mode | State | Type |
| --- | --- | --- |
| Off | Disabled | — |
| Deferred | Enabled | Deferred |
| Asynchronous | Enabled | Asynchronous |

- If cancellation is disabled, the request **stays pending** until the thread enables it.
- The **default type is deferred**. Cancellation happens only when the thread reaches a **cancellation point**, such as `pthread_testcancel()`. A **cleanup handler** is then invoked.
- On Linux, thread cancellation is handled through **signals**.

#### Thread-local storage (TLS)

TLS gives **each thread its own copy of some data**, even though threads share the same code. It's useful when you don't control thread creation, for example in a thread pool.

| TLS vs… | Difference |
| --- | --- |
| **Local variables** | Local variables are visible only during one function call. **TLS is visible across function calls** |
| **Static data** | TLS is similar to static data, but **unique to each thread** |

#### Scheduler activations

Both many-to-many and two-level models need **communication between the kernel and the thread library**, to keep the right number of kernel threads allocated to the application.
- They typically use an intermediate structure called a **lightweight process (LWP)**. It **appears to be a virtual processor** on which the process can schedule a user thread, and **each LWP is attached to a kernel thread**.
- **Scheduler activations** provide **upcalls**: a communication mechanism **from the kernel to the upcall handler** in the thread library.
- This lets an application maintain the **correct number of kernel threads**.

## Part 2: CPU scheduling (chapter 5)

### 7. Basic concepts (slides 4–9)

Multiprogramming gives **maximum CPU utilization**. Process execution is a **CPU–I/O burst cycle**: a CPU burst, then an I/O burst, and so on. The **distribution of CPU bursts** is the main concern.

**The CPU scheduler** is the [[chapter-3-quiz-4|short-term scheduler]]. It picks a process from the ready queue and allocates the CPU to it.

**Scheduling decisions can happen when a process:**

| # | Event | Type |
| --- | --- | --- |
| 1 | Switches from **running to waiting** | **Non-preemptive** |
| 2 | Switches from **running to ready** | Preemptive |
| 3 | Switches from **waiting to ready** | Preemptive |
| 4 | **Terminates** | **Non-preemptive** |

So under **non-preemptive** scheduling, a process keeps the CPU until it blocks or finishes.

| **Preemptive** | **Non-preemptive** |
| --- | --- |
| The OS can **interrupt** a process and give the CPU to another | The process **runs without interruption** |
| Responsive, good for high-priority tasks | Simpler, but can delay other tasks |

Preemption raises its own problems: access to **shared data**, preemption while in **kernel mode**, and interrupts during crucial OS activities.

**The dispatcher** comes into play **after the scheduler**. The scheduler *chooses*; the dispatcher *gives the CPU* to the chosen process.

<svg viewBox="0 0 640 130" width="100%" style="max-width:640px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="The scheduler selects process P1 from the ready queue, and the dispatcher then takes P1 to the running state on the CPU." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q-disp-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="40.0" y="24.0" width="46.0" height="40" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="63.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">P4</text>
<rect x="86.0" y="24.0" width="46.0" height="40" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="109.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">P3</text>
<rect x="132.0" y="24.0" width="46.0" height="40" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="155.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">P2</text>
<rect x="178.0" y="24.0" width="46.0" height="40" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="201.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">P1</text>
<text x="132.0" y="16.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">ready queue</text>
<rect x="480.0" y="24.0" width="130.0" height="40" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="545.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">CPU (running)</text>
<path d="M226,44 H477" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q-disp-m)"/>
<text x="350.0" y="36.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">dispatcher takes P1 to running</text>
<path d="M203,106 V68" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q-disp-m)"/>
<text x="203.0" y="122.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">scheduler selects P1</text>
</svg>

The dispatcher does **three things**:
1. **Switches context.**
2. **Switches to user mode.**
3. **Jumps to the proper location** in the user program to restart it.

**Dispatch latency** is the time it takes the dispatcher to stop one process and start another.

### 8. Scheduling criteria (slides 10–12)

| Criterion | Meaning | Goal | Formula |
| --- | --- | --- | --- |
| **CPU utilization** | Keep the CPU as busy as possible | **Max** | |
| **Throughput** | Number of processes **completed per time unit** | **Max** | |
| **Turnaround time** | Time to execute a particular process | **Min** | **Completion − Arrival** |
| **Waiting time** | Time spent **waiting in the ready queue** | **Min** | **Turnaround − Burst** |
| **Response time** | Time from submission until the **first response** is produced, not the output | **Min** | **First start − Arrival** |

**Example (slide 11):** bursts of 24, 3 and 4, run in that order, finish at 24, 27 and 31.
- Average turnaround = (24 + 27 + 31) / 3 = **27.33**
- Average waiting = (0 + 24 + 27) / 3 = **17**

### How to solve a scheduling problem

1. **Draw a timeline.** At every decision point, ask which processes **have arrived** and aren't finished.
2. **Pick** according to the algorithm. For preemptive ones, re-check at **every arrival**.
3. **Write the Gantt chart**, with times under the boundaries.
4. **For each process:** Turnaround = Completion − Arrival, then Waiting = Turnaround − Burst.
5. **Average** them.

> [!tip] Check your work
> Every process's waiting time must be **≥ 0**, and the last number on the Gantt chart must equal the total burst time (if the CPU is never idle). `Waiting = Turnaround − Burst` is much quicker than adding up gaps, and it works for preemptive schedules too.

### 9. FCFS: first-come, first-served (slides 13–14)

Processes run **in arrival order**, without preemption.

**Bursts: P1 = 24, P2 = 3, P3 = 3.** In the order P1, P2, P3:

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 from 0 to 24, P2 from 24 to 27, P3 from 27 to 30." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-fcfs1-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="512.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="276.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="532.0" y="8.0" width="64.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="564.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="596.0" y="8.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="628.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
<text x="532.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">24</text>
<text x="596.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">27</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">30</text>
</svg>

Waiting: P1 = 0, P2 = 24, P3 = 27. **Average = 17.**

The same processes in the order P2, P3, P1:

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P2 from 0 to 3, P3 from 3 to 6, P1 from 6 to 30." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-fcfs2-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="64.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="52.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="84.0" y="8.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="116.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="148.0" y="8.0" width="512.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="404.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
<text x="84.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">3</text>
<text x="148.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">6</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">30</text>
</svg>

Waiting: P1 = 6, P2 = 0, P3 = 3. **Average = 3.**

The result depends entirely on arrival order. A short process stuck behind a long one is the **convoy effect**: think of one CPU-bound process and many I/O-bound ones.

### 10. SJF: shortest job first (slides 15–19)

Each process is associated with the **length of its next CPU burst**, and the shortest goes first.
- **SJF is optimal**: it gives the **minimum average waiting time** for a given set of processes.
- **The difficulty is knowing the length of the next CPU burst.** You could ask the user, or estimate it.
- It may also suffer from the **convoy effect** (slide 15), and long jobs can **starve** while shorter ones keep arriving.

**The slide's example:** bursts P1 = 6, P2 = 8, P3 = 7, P4 = 3.

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P4 from 0 to 3, P1 from 3 to 9, P3 from 9 to 16, P2 from 16 to 24." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-sjf-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="80.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="60.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
<rect x="100.0" y="8.0" width="160.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="180.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="260.0" y="8.0" width="186.7" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="353.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="446.7" y="8.0" width="213.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="553.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
<text x="100.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">3</text>
<text x="260.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">9</text>
<text x="446.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">16</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">24</text>
</svg>

Waiting: P1 = 3, P2 = 16, P3 = 9, P4 = 0. **Average = 7.**

> [!warning] Slide 16 lists arrival times (0, 2, 4, 5), but its answer ignores them
> The chart above only works **if all four arrive at time 0**, which is the textbook's version of this example. If the arrival times are real, only P1 is there at time 0, so non-preemptive SJF runs:
>
> <svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 from 0 to 6, P4 from 6 to 9, P3 from 9 to 16, P2 from 16 to 24." xmlns="http://www.w3.org/2000/svg">
> <defs><marker id="g-sjf2-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
> <rect x="20.0" y="8.0" width="160.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
> <text x="100.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
> <rect x="180.0" y="8.0" width="80.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
> <text x="220.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
> <rect x="260.0" y="8.0" width="186.7" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
> <text x="353.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
> <rect x="446.7" y="8.0" width="213.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
> <text x="553.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
> <text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
> <text x="180.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">6</text>
> <text x="260.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">9</text>
> <text x="446.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">16</text>
> <text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">24</text>
> </svg>
>
> Waiting: P1 = 0, P2 = 14, P3 = 5, P4 = 1. **Average = 5.**
>
> **On the quiz:** if arrival times are given, use them. If the instructor reuses this exact table and expects 7, say that you assumed all processes arrive at 0.

#### Predicting the next burst: exponential averaging (slides 17–19)

The next burst can only be estimated, on the assumption that it's similar to previous ones. With $t_n$ the actual length of the $n$th burst and $\tau_{n+1}$ the prediction for the next:

$$
\tau_{n+1} = \alpha\, t_n + (1 - \alpha)\,\tau_n \qquad 0 \le \alpha \le 1
$$

| α | Result | Meaning |
| --- | --- | --- |
| **0** | $\tau_{n+1} = \tau_n$ | **Recent history doesn't count** |
| **1** | $\tau_{n+1} = t_n$ | **Only the last actual burst counts** |
| **½** | Common choice | Recent and past history weigh equally |

Expanding the formula, each older burst has **less weight** than the one after it.

**Slide 19's example** (α = ½, $\tau_0$ = 10):

| Actual burst $t_i$ | | 6 | 4 | 6 | 4 | 13 | 13 | 13 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Guess $\tau_i$** | 10 | 8 | 6 | 6 | 5 | 9 | 11 | 12 |

For example, the first prediction after $t_0 = 6$ is $0.5 \times 6 + 0.5 \times 10 = 8$.

### 11. SRT: shortest remaining time first (slides 20–21)

SRT is **preemptive SJF**. When a new process arrives with a shorter remaining time than the running one, it takes the CPU.
- SRT and SJF behave the same **if no new process arrives**.
- The slide's last point, as I read it: **preempting isn't worthwhile if the gain is less than a context switch**.

**Example:** arrivals and bursts P1 (0, 8), P2 (1, 4), P3 (2, 9), P4 (3, 5).

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 from 0 to 1, P2 from 1 to 5, P4 from 5 to 10, P1 from 10 to 17, P3 from 17 to 26." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-srt-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="24.6" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="32.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="44.6" y="8.0" width="98.5" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="93.8" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="143.1" y="8.0" width="123.1" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="204.6" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
<rect x="266.2" y="8.0" width="172.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="352.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="438.5" y="8.0" width="221.5" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="549.2" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
<text x="44.6" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">1</text>
<text x="143.1" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">5</text>
<text x="266.2" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">10</text>
<text x="438.5" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">17</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">26</text>
</svg>

| | P1 | P2 | P3 | P4 |
| --- | --- | --- | --- | --- |
| Completion | 17 | 5 | 26 | 10 |
| Turnaround | 17 | 4 | 24 | 7 |
| **Waiting** | 9 | 0 | 15 | 2 |

**Average waiting = 26 / 4 = 6.5.**

### 12. Priority scheduling (slides 22–23)

Each process has a **priority number**, and the CPU goes to the highest priority. **A smaller integer means a higher priority.** It can be **preemptive or non-preemptive**.
- **SJF is a special case**: the priority is the inverse of the predicted next burst.
- **Problem: starvation.** Low-priority processes may never run.
- **Solution: aging.** Increase a process's priority as time passes.

**Example (all arriving at 0):** (burst, priority) P1 (10, 3), P2 (1, 1), P3 (2, 4), P4 (1, 5), P5 (5, 2).

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P2 from 0 to 1, P5 from 1 to 6, P1 from 6 to 16, P3 from 16 to 18, P4 from 18 to 19." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-prio-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="33.7" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="36.8" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="53.7" y="8.0" width="168.4" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="137.9" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P5</text>
<rect x="222.1" y="8.0" width="336.8" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="390.5" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="558.9" y="8.0" width="67.4" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="592.6" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="626.3" y="8.0" width="33.7" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="643.2" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
<text x="53.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">1</text>
<text x="222.1" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">6</text>
<text x="558.9" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">16</text>
<text x="626.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">18</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">19</text>
</svg>

Waiting: P1 = 6, P2 = 0, P3 = 16, P4 = 18, P5 = 1. **Average = 41 / 5 = 8.2.**

### 13. HRN: highest response ratio next (slide 24)

For each process, compute

$$
N = \frac{W + S}{S}
$$

where **W** is its waiting time so far and **S** is its estimated run time. **The highest N runs next.**

Since $N = 1 + W/S$:
- **As W grows, priority grows.** That **prevents starvation**, because even a long job eventually wins.
- **A larger S lowers the priority** (the slide: S > 1 decreases it, S < 1 increases it), so short jobs are favored.
- S is generally constant and W is dynamic.

HRN is normally non-preemptive: N is recomputed each time the CPU becomes free. (This isn't on the slide.)

### 14. Lottery scheduling (slide 25)

It's literally a lottery. Each process holds **N cards (tickets)**, and cards are drawn at random. A higher number doesn't mean a higher priority, only a **higher chance of winning**.

### 15. Round Robin (slides 26–29)

Each process gets a small unit of CPU time, the **time quantum q**, usually **10–100 ms**. When it runs out, the process is **preempted and added to the end of the ready queue**. A **timer interrupt** every quantum schedules the next process ([[17-dual-mode-and-timer|the timer]]).

With **n** processes and quantum **q**:
- Each process gets **1/n of the CPU** in chunks of at most q.
- **No process waits more than (n − 1)q** before its next turn.

**Example, q = 4:** P1 = 24, P2 = 3, P3 = 3.

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 from 0 to 4, P2 from 4 to 7, P3 from 7 to 10, P1 from 10 to 14, P1 from 14 to 18, P1 from 18 to 22, P1 from 22 to 26, P1 from 26 to 30." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-rr-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="85.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="62.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="105.3" y="8.0" width="64.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="137.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="169.3" y="8.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="201.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="233.3" y="8.0" width="85.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="276.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="318.7" y="8.0" width="85.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="361.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="404.0" y="8.0" width="85.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="446.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="489.3" y="8.0" width="85.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="532.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="574.7" y="8.0" width="85.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="617.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">0</text>
<text x="105.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">4</text>
<text x="169.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">7</text>
<text x="233.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">10</text>
<text x="318.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">14</text>
<text x="404.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">18</text>
<text x="489.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">22</text>
<text x="574.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">26</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">30</text>
</svg>

| | P1 | P2 | P3 |
| --- | --- | --- | --- |
| Turnaround | 30 | 7 | 10 |
| **Waiting** | 6 | 4 | 7 |
| Response | 0 | 4 | 7 |

Average waiting = 17 / 3 = **5.67**. RR typically has a **higher average turnaround than SJF, but better response**.

**Choosing q:**

| q | Effect |
| --- | --- |
| **Very large** | RR becomes **FIFO** |
| **Very small** | Too many context switches, so **overhead is too high** |
| **Rule of thumb** | q should be **large compared to the context-switch time** (q is 10–100 ms, a context switch is under 10 μs), and **80% of CPU bursts should be shorter than q** |

**Context switches for one process of length 10 (slide 28):** q = 12 → 0 switches, q = 6 → 1, q = 1 → 9.

**Average turnaround doesn't simply improve as q grows (slide 29).** For bursts 6, 3, 1, 7, it goes:

| q | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Avg turnaround** | 11.0 | 11.5 | 10.75 | 11.5 | 12.25 | 10.5 | 10.5 |

> [!tip] A tie that trips people up
> If a new process arrives at the same moment a quantum ends, put the **new process ahead of the one being preempted**. Slide 26 says a process arriving at the start of a quantum should get the highest priority, for a lower response time.

### Comparing the algorithms

| Algorithm | Preemptive? | Picks | Strength | Weakness |
| --- | --- | --- | --- | --- |
| **FCFS** | No | Earliest arrival | Simple | **Convoy effect** |
| **SJF** | No | Shortest next burst | **Minimum average waiting** | Burst length unknown, long jobs can starve |
| **SRT** | **Yes** | Shortest remaining time | Better for short jobs | Same as SJF, more switches |
| **Priority** | Either | Highest priority | Importance-aware | **Starvation**, fixed by **aging** |
| **HRN** | No | Highest $(W+S)/S$ | **No starvation** | Needs estimated run time |
| **Lottery** | Depends on the design | Random card | Share follows the number of cards | No guarantees |
| **RR** | **Yes** | Next in the circular queue | **Good response**, fair | Higher turnaround, depends on q |

### Practice problem

Arrival, burst, priority (smaller = higher): **P1 (0, 7, 2), P2 (2, 4, 1), P3 (4, 1, 4), P4 (5, 4, 3).** Work out the Gantt chart and average waiting time for each algorithm before opening the answers.

> [!example]- Answers (each checked with a simulator)
> | Algorithm | Order (time boundaries) | Waiting P1, P2, P3, P4 | Average |
> | --- | --- | --- | --- |
> | **FCFS** | P1 0–7, P2 7–11, P3 11–12, P4 12–16 | 0, 5, 7, 7 | **4.75** |
> | **SJF** | P1 0–7, P3 7–8, P2 8–12, P4 12–16 | 0, 6, 3, 7 | **4** |
> | **SRT** | P1 0–2, P2 2–4, P3 4–5, P2 5–7, P4 7–11, P1 11–16 | 9, 1, 0, 2 | **3** |
> | **Priority, non-preemptive** | P1 0–7, P2 7–11, P4 11–15, P3 15–16 | 0, 5, 11, 6 | **5.5** |
> | **Priority, preemptive** | P1 0–2, P2 2–6, P1 6–11, P4 11–15, P3 15–16 | 4, 0, 11, 6 | **5.25** |
> | **RR, q = 2** | P1 0–2, P2 2–4, P1 4–6, P3 6–7, P2 7–9, P4 9–11, P1 11–13, P4 13–15, P1 15–16 | 9, 3, 2, 6 | **5** |
> | **HRN** | P1 0–7, P3 7–8, P2 8–12, P4 12–16 | 0, 6, 3, 7 | **4** |
>
> **HRN at t = 7:** P2 = (5 + 4) / 4 = 2.25, P3 = (3 + 1) / 1 = 4, P4 = (2 + 4) / 4 = 1.5, so P3 goes. At t = 8: P2 = 2.5, P4 = 1.75, so P2 goes.

## Likely quiz questions and 5-minute answers

Ranked by how likely they seem. These are guesses, since no past quiz covers this range.

> [!question]- 1. "Given these processes, draw the Gantt chart and find the average waiting time" (FCFS, SJF, SRT, Priority or RR)
> Use [the method above](#how-to-solve-a-scheduling-problem): pick from what has **arrived**, write the chart, then **Turnaround = Completion − Arrival** and **Waiting = Turnaround − Burst**, and average. State any assumption, such as "all arrive at 0". Try the [practice problem](#practice-problem).

> [!question]- 2. "Explain the scheduling criteria."
> 1. **CPU utilization**: keep the CPU busy (maximize).
> 2. **Throughput**: processes completed per time unit (maximize).
> 3. **Turnaround time**: completion − arrival (minimize).
> 4. **Waiting time**: time in the ready queue, turnaround − burst (minimize).
> 5. **Response time**: from submission until the first response, first start − arrival (minimize).

> [!question]- 3. "State Amdahl's law. An application is X% serial; what's the speedup on N cores?"
> $\text{speedup} \le 1 / (S + (1-S)/N)$, where S is the serial fraction and N is the number of cores. For 25% serial on 2 cores: 1 / (0.25 + 0.375) = **1.6**. As N → ∞, the speedup approaches **1/S**, here 4, so the serial part limits the gain however many cores are added.

> [!question]- 4. "Compare Amdahl's and Gustafson's laws."
> **Amdahl:** the problem size is **fixed**, so it's pessimistic, and speedup is limited to $1/S$. **Gustafson:** the problem **grows with the processors** while the sequential part stays constant, so it's optimistic, with speedup $S(P) = P - \alpha(P-1)$, which is unbounded (linear). Amdahl suits latency-bound work, and Gustafson throughput-bound work.

> [!question]- 5. "Explain the multithreading models."
> 1. **Many-to-one:** many user threads on one kernel thread. One blocking blocks all, and there's no parallelism on multicore (Solaris Green Threads).
> 2. **One-to-one:** each user thread has its own kernel thread. More concurrency, but thread count may be limited by overhead (Windows, Linux).
> 3. **Many-to-many:** many user threads on many kernel threads, so the OS can create enough of them (Solaris before 9).
> 4. **Two-level:** like many-to-many, but a user thread can also be bound to a kernel thread (IRIX, HP-UX).

> [!question]- 6. "Preemptive vs non-preemptive scheduling. When do scheduling decisions happen?"
> **Four moments:** a process goes (1) running → waiting, (2) running → ready, (3) waiting → ready, or (4) terminates. **1 and 4 are non-preemptive**, and the others are preemptive. Non-preemptive: the process keeps the CPU until it blocks or finishes; simple, but it can delay others. Preemptive: the OS can take the CPU away; responsive, but raises shared-data and kernel-mode issues.

> [!question]- 7. "What does the dispatcher do? What is dispatch latency?"
> After the scheduler chooses a process, the dispatcher gives it the CPU: it (1) **switches context**, (2) **switches to user mode**, and (3) **jumps to the proper location** in the program to restart it. **Dispatch latency** is the time to stop one process and start another.

> [!question]- 8. "Explain Round Robin. How does the time quantum affect it?"
> Each process gets a quantum q (10–100 ms), then is preempted and moved to the end of the ready queue. With n processes, each gets 1/n of the CPU and waits at most **(n − 1)q**. **Large q** makes it FIFO. **Small q** means too much context-switch overhead. q should be large compared to a context switch, and **80% of CPU bursts should be shorter than q**. It has better response than SJF, but usually higher turnaround.

> [!question]- 9. "What is starvation? How is it solved?"
> Starvation is when a low-priority process **never gets the CPU**, a problem in priority scheduling. **Aging** solves it: priority increases as a process waits. **HRN** avoids it similarly: $N = (W+S)/S$ grows as the waiting time W grows.

> [!question]- 10. "Explain SJF and how the next CPU burst is predicted."
> SJF runs the process with the shortest next CPU burst, which is **optimal for average waiting time**. The burst length isn't known, so it's estimated by **exponential averaging**: $\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n$. α = 0 ignores recent history, α = 1 uses only the last burst, and ½ is common. The preemptive version is **SRT**.

> [!question]- 11. "Explain the threading issues."
> 1. **`fork`/`exec`:** with `exec` right after, duplicate only the calling thread; without it, duplicate all threads.
> 2. **Signals:** deliver to the relevant thread, every thread, certain threads, or one designated thread.
> 3. **Cancellation:** asynchronous (immediately) or deferred (at cancellation points, the default).
> 4. **Thread-local storage:** each thread's own copy of data, visible across function calls.
> 5. **Scheduler activations:** upcalls from the kernel to the thread library, using LWPs, to keep the right number of kernel threads.

> [!question]- 12. "What is a thread pool? What are its advantages?" or "What is implicit threading?"
> **Implicit threading** leaves thread creation and management to compilers and run-time libraries: thread pools, OpenMP, GCD.
> A **thread pool** is a set of threads created up front that await work. **Advantages:** (1) it's usually faster to use an existing thread than to create one; (2) the thread count is bounded by the pool size; (3) separating the task from how it's created allows strategies like periodic runs.

> [!tip] How to write the answer
> - **Calculations:** show the Gantt chart and one line per process. Partial credit needs visible work.
> - **Lists:** give the count first ("there are 5 criteria…"), then one line each.
> - **Formulas:** define every letter, then give a small number example.

## Numbers and formulas to memorize

| | |
| --- | --- |
| Amdahl | $1 / (S + (1-S)/N)$; limit $1/S$ |
| Gustafson | $S(P) = P - \alpha(P-1)$ |
| Multithreading models | **4**: many-to-one, one-to-one, many-to-many, two-level |
| Implicit threading | **3**: thread pools, OpenMP, GCD |
| Thread-pool advantages | **3** |
| Signal delivery options | **4** |
| Cancellation | Asynchronous / **deferred (default)** |
| Scheduling decision points | **4**; 1 and 4 are non-preemptive |
| Dispatcher steps | **3**: context, user mode, jump |
| Criteria | **5**: maximize utilization and throughput, minimize turnaround, waiting, response |
| Turnaround | Completion − Arrival |
| Waiting | Turnaround − Burst |
| Response | First start − Arrival |
| Exponential averaging | $\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n$ |
| Priority | **Smaller number = higher**; starvation → aging |
| HRN | $N = (W+S)/S$, highest first |
| RR | q = 10–100 ms; wait ≤ $(n-1)q$; **80%** of bursts shorter than q |
