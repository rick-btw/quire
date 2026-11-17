---
title: "Quiz 7: Multilevel Queues to Critical Sections (Chapters 5–6)"
description: Quiz 7 prep from Multilevel Queue in chapter 5 (CPU Scheduling) to Strict Alternation in chapter 6 (Process Synchronization). Covers multilevel and feedback queues, real-time scheduling (RM, EDF, LLF), algorithm evaluation and Little's formula, race conditions, and the critical-section problem, with likely quiz questions and 5-minute answers.
tags: [operating-systems, quiz-prep]
---
# Quiz 7: Multilevel Queues to Critical Sections (Chapters 5–6)

> [!abstract] This note is for **Quiz 7**: chapter 5 slides **30–57**, then chapter 6 slides **1–14**
> It picks up where [[chapters-4-5-quiz-6|Quiz 6]] stopped (after Round Robin). The range might end at chapter 6 slide **5**: everything after the producer code is marked **⚑ only if the range goes to 14**.
>
> **Finding things in the book:** your "Chapter 5" deck is **Chapter 6** of the 9th-edition textbook (slide footers 6.x), and your "Chapter 6" deck is **Chapter 5** (footers 5.x). Slide numbers below are the PDF page numbers, which match the footers.

> [!warning] Last year's quiz PDF has nothing from this range
> So the [likely questions](#likely-quiz-questions-and-5-minute-answers) are educated guesses. Every past quiz was **one topic, as a list or an explanation**. This range also has **schedulability calculations** (RM and EDF) and a **Little's formula** one-liner, so be ready for small numeric questions too.

## Part 1: The rest of CPU scheduling (chapter 5)

### 1. Multilevel queue (slides 30–31)

The **ready queue is partitioned into separate queues**, for example:
- **foreground** (interactive) processes, which need less CPU time;
- **background** (batch) processes, which need more.

**A process stays permanently in its queue.** Each queue has **its own scheduling algorithm**, for example **RR for the foreground** and **FCFS for the background**.

**Scheduling must also be done *between* the queues.** There are two ways:

| Method | How | Downside |
| --- | --- | --- |
| **Fixed priority** | Serve **all** of the foreground, then the background | **Starvation** is possible |
| **Time slice** | Each queue gets a **share of CPU time**, e.g. **80%** to the foreground (RR) and **20%** to the background (FCFS) | — |

Slide 31's example has **five queues, from highest to lowest priority**:

<svg viewBox="0 0 640 270" width="100%" style="max-width:640px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Multilevel queue scheduling: five separate ready queues, from highest to lowest priority: system processes, interactive processes, interactive editing processes, batch processes, student processes. A process stays in its queue permanently." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q7-mlq-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<text x="20.0" y="18.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">highest priority</text>
<path d="M40,45 H118" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<rect x="120.0" y="30.0" width="380.0" height="30" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="310.0" y="50.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">system processes</text>
<path d="M500,45 H578" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<path d="M40,89 H118" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<rect x="120.0" y="74.0" width="380.0" height="30" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="310.0" y="94.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">interactive processes</text>
<path d="M500,89 H578" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<path d="M40,133 H118" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<rect x="120.0" y="118.0" width="380.0" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="310.0" y="138.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">interactive editing processes</text>
<path d="M500,133 H578" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<path d="M40,177 H118" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<rect x="120.0" y="162.0" width="380.0" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="310.0" y="182.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">batch processes</text>
<path d="M500,177 H578" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<path d="M40,221 H118" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<rect x="120.0" y="206.0" width="380.0" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="310.0" y="226.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">student processes</text>
<path d="M500,221 H578" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlq-m)"/>
<text x="20.0" y="262.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">lowest priority</text>
<text x="600.0" y="252.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">no moving between queues</text>
</svg>

### 2. Multilevel feedback queue (slides 32–33)

A **multilevel feedback queue** lets a process **move between queues**. **Aging** can be implemented this way: a process that waits too long is moved up.

**An MLFQ scheduler is defined by five parameters:**
1. the **number of queues**;
2. the **scheduling algorithm for each queue**;
3. the method that decides when to **upgrade** (promote) a process;
4. the method that decides when to **demote** a process;
5. the method that decides **which queue a process enters** when it needs service.

**Example (slide 33):** three queues.

<svg viewBox="0 0 660 220" width="100%" style="max-width:660px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Multilevel feedback queue example: new jobs enter Q0, round robin with an 8 ms quantum. A job that doesn't finish moves down to Q1, round robin with a 16 ms quantum, and then to Q2, first-come first-served." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q7-mlfq-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="110.0" y="24.0" width="300.0" height="36" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="130.0" y="47.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">Q0</text>
<text x="280.0" y="47.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">RR, quantum = 8 ms</text>
<path d="M410,42 H480" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlfq-m)"/>
<text x="488.0" y="46.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">finish</text>
<rect x="110.0" y="88.0" width="300.0" height="36" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="130.0" y="111.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">Q1</text>
<text x="280.0" y="111.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">RR, quantum = 16 ms</text>
<path d="M410,106 H480" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlfq-m)"/>
<text x="488.0" y="110.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">finish</text>
<rect x="110.0" y="152.0" width="300.0" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="130.0" y="175.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">Q2</text>
<text x="280.0" y="175.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">FCFS</text>
<path d="M410,170 H480" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlfq-m)"/>
<text x="488.0" y="174.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">finish</text>
<path d="M20,42 H107" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlfq-m)"/>
<text x="60.0" y="34.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">new job</text>
<path d="M260,62 V86" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlfq-m)"/>
<text x="272.0" y="79.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">didn't finish in 8 ms → demoted</text>
<path d="M260,126 V150" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-mlfq-m)"/>
<text x="272.0" y="143.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">didn't finish in 16 more → demoted</text>
<text x="330.0" y="214.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">Q0 has the highest priority; Q1 runs only when Q0 is empty, Q2 only when Q0 and Q1 are</text>
</svg>

1. A new job enters **Q0**, which is served FCFS. When it gets the CPU, it receives **8 ms**.
2. If it **doesn't finish in 8 ms**, it's moved to **Q1**. There it's served FCFS again and receives **16 more ms**.
3. If it **still** hasn't finished, it's preempted and moved to **Q2** (FCFS).

**The effect:** short, interactive jobs finish quickly in Q0, while long CPU-bound jobs sink to the bottom. For example, a 30 ms job gets 8 ms in Q0, 16 ms in Q1, and its last 6 ms in Q2.

| | Multilevel queue | Multilevel feedback queue |
| --- | --- | --- |
| Can a process change queues? | **No**: it stays in its queue permanently | **Yes**: it's promoted or demoted |
| Starvation | Possible with fixed priority | Can be prevented with **aging** |
| Defined by | The queues, each queue's algorithm, scheduling between queues | **The 5 parameters** above |

### 3. Real-time CPU scheduling (slides 34–38)

**Real-time scheduling** guarantees that **deadlines are met**, with **bounded and predictable worst-case behavior**. It **doesn't necessarily mean fast scheduling**.

| **Soft real-time** | **Hard real-time** |
| --- | --- |
| **No guarantee** of when a critical real-time process will be scheduled | A task **must be serviced by its deadline** |

**Two latencies affect performance:**
1. **Interrupt latency**: from the **arrival of an interrupt** to the **start of the routine that services it** (the ISR, interrupt service routine). The CPU first finishes its current instruction, determines the interrupt type, and saves the context.
2. **Dispatch latency**: the time for the scheduler to **take the current process off the CPU and switch to another**.

<svg viewBox="0 0 680 200" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Response interval for a real-time event: interrupt processing, then dispatch latency (a conflict phase followed by a dispatch phase), then the real-time process executes." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q7-latency-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="80.0" width="110.0" height="34" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="75.0" y="101.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">interrupt processing</text>
<rect x="130.0" y="80.0" width="200.0" height="34" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="230.0" y="101.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">conflicts</text>
<rect x="330.0" y="80.0" width="140.0" height="34" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="400.0" y="101.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">dispatch</text>
<rect x="470.0" y="80.0" width="170.0" height="34" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="555.0" y="101.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">real-time process runs</text>
<path d="M20,30 H640" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-latency-m)" marker-start="url(#q7-latency-m)"/>
<text x="330.0" y="22.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">response interval (event → response)</text>
<path d="M130,58 H470" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q7-latency-m)" marker-start="url(#q7-latency-m)"/>
<text x="300.0" y="52.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">dispatch latency</text>
<text x="20.0" y="140.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">event</text>
<text x="130.0" y="140.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">process made available</text>
<text x="640.0" y="140.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">response</text>
<text x="230.0" y="166.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">1. preempt kernel-mode process</text>
<text x="230.0" y="182.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">2. low-priority process releases resources</text>
<text x="400.0" y="166.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">context switch</text>
</svg>

**Dispatch latency has two phases:**
- **Conflict phase**, with two parts:
  1. **Preemption of any process running in kernel mode.** A kernel-mode process usually can't be interrupted immediately, so the system waits until it reaches a safe preemption point.
  2. **Release, by low-priority processes, of resources needed by high-priority processes.** A low-priority process may hold a lock the real-time process needs. This is **priority inversion**: the high-priority process must wait.
- **Dispatch phase**: the actual **context switch**. Save the current process's state, load the real-time process's state.

Even after the interrupt has been handled, there can be **significant delay** before the real-time process actually runs.

**Why it matters:**
- **Predictability**: dispatch latency must be bounded.
- **Performance**: minimizing it improves responsiveness.
- **Design**: it drives choices like **preemptible kernels**, **priority-inheritance protocols**, and resource-management strategies.

### 4. Priority-based scheduling and periodic processes (slide 39)

For real-time scheduling, the scheduler must support **preemptive, priority-based scheduling**. On its own that only guarantees **soft** real-time; **hard** real-time also needs a way to **meet deadlines**.

Real-time processes are often **periodic**: they need the CPU at constant intervals. Each one has:

| Symbol | Meaning |
| --- | --- |
| **t** | Processing time (the CPU burst) |
| **d** | Deadline |
| **p** | Period |

These satisfy **0 ≤ t ≤ d ≤ p**, and the **rate** of a periodic task is **1/p**. In all the slide examples, the deadline is the start of the next period.

The **CPU utilization (process load)** of a set of tasks is

$$
U = \sum_i \frac{t_i}{p_i}
$$

### 5. Rate-monotonic scheduling (slides 40–43)

- **Priority = the inverse of the period**: a **shorter period means a higher priority**.
- It's **static**: priorities are fixed at the start, so no time is spent computing them, and they're used **preemptively**.

**Example (slide 40):** P1 has t = 20, p = 50, so its rate is 1/50 = 0.02. P2 has t = 35, p = 100, rate 0.01. **P1 has the higher priority.**

<svg viewBox="0 0 680 110" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 0–20, P2 20–50, P1 50–70, P2 70–75, idle 75–100, P1 100–120, P2 120–150, P1 150–170, P2 170–175, idle 175–200; deadlines at P1 50, P1, P2 100, P1 150, P1, P2 200." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-rm_ok-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<path d="M180.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_ok-m)"/>
<text x="180.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M340.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_ok-m)"/>
<text x="340.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1, P2</text>
<path d="M500.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_ok-m)"/>
<text x="500.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M660.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_ok-m)"/>
<text x="660.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1, P2</text>
<rect x="20.0" y="34.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="52.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="84.0" y="34.0" width="96.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="132.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="180.0" y="34.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="212.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="244.0" y="34.0" width="16.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<rect x="260.0" y="34.0" width="80.0" height="32" rx="0" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:3 3"/>
<rect x="340.0" y="34.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="372.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="404.0" y="34.0" width="96.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="452.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="500.0" y="34.0" width="64.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="532.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="564.0" y="34.0" width="16.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<rect x="580.0" y="34.0" width="80.0" height="32" rx="0" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:3 3"/>
<text x="20.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="84.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">20</text>
<text x="148.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">40</text>
<text x="212.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">60</text>
<text x="276.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">80</text>
<text x="340.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">100</text>
<text x="404.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">120</text>
<text x="468.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">140</text>
<text x="532.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">160</text>
<text x="596.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">180</text>
<text x="660.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">200</text>
<text x="340.0" y="106.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">dashed = CPU idle</text>
</svg>

$U = 20/50 + 35/100 = 0.4 + 0.35 = 0.75$. That's **below the bound for 2 tasks (0.828)**, so the set is **guaranteed schedulable**. Note that P2 gets preempted at 50, when P1's second period begins.

**The utilization bound (Liu & Layland, 1973).** *n* periodic tasks are guaranteed schedulable under RM if

$$
U = \sum_i \frac{C_i}{T_i} \le n\left(2^{1/n} - 1\right)
$$

| n | 1 | 2 | 3 | 4 | → ∞ |
| --- | --- | --- | --- | --- | --- |
| **Bound** | 1.000 | **0.828** | 0.780 | 0.757 | **ln 2 ≈ 0.693** |

- The test is **sufficient, not necessary**. If U is at or below the bound, the set is schedulable. **If U is above it, the test is inconclusive**, and an exact test (response-time analysis) is needed.
- **Harmonic periods**, where each period is a multiple of the shorter ones (like 50 and 100), can reach **U = 1.0**.

**A missed deadline (slides 42–43):** P1 has t = 25, p = 50, and P2 has t = 35, p = 80. $U = 25/50 + 35/80 = 0.9375 > 0.828$:

<svg viewBox="0 0 680 110" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 0–25, P2 25–50, P1 50–75, P2 75–85; deadlines at P1 50, P2 ✗ 80, P1 100, P1 150, P2 160." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-rm_miss-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<path d="M220.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_miss-m)"/>
<text x="220.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M340.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_miss-m)"/>
<text x="340.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P2 ✗</text>
<path d="M420.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_miss-m)"/>
<text x="420.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M620.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_miss-m)"/>
<text x="620.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M660.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-rm_miss-m)"/>
<text x="660.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P2</text>
<rect x="20.0" y="34.0" width="100.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="70.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="120.0" y="34.0" width="100.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="170.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="220.0" y="34.0" width="100.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="270.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="320.0" y="34.0" width="40.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="340.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<text x="20.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="120.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">25</text>
<text x="220.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">50</text>
<text x="320.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">75</text>
<text x="340.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">80</text>
<text x="360.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">85</text>
<text x="420.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">100</text>
<text x="620.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">150</text>
<text x="660.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">160</text>
<text x="340.0" y="106.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">P2 still needs 5 more at its deadline (80) and finishes at 85: deadline missed</text>
</svg>

P1 runs 0–25. P2 runs 25–50, then **P1 preempts it** at 50 (P1 has the shorter period). P2 only gets the CPU back at 75, and **misses its deadline at 80**.

### 6. Earliest deadline first, EDF (slides 44–45)

- **Priorities follow deadlines**: the **earlier the deadline, the higher the priority**.
- It's **dynamic**: priorities change as deadlines approach.
- It **isn't just for periodic processes**.

**The same tasks as the missed-deadline example** (P1: 25 every 50, P2: 35 every 80):

<svg viewBox="0 0 680 110" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 0–25, P2 25–60, P1 60–85, P2 85–100, P1 100–125, P2 125–145, idle 145–150, P1 150–160; deadlines at P1 50, P2 80, P1 100, P1 150, P2 160." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-edf-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<path d="M220.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-edf-m)"/>
<text x="220.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M340.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-edf-m)"/>
<text x="340.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P2</text>
<path d="M420.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-edf-m)"/>
<text x="420.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M620.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-edf-m)"/>
<text x="620.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P1</text>
<path d="M660.0,8 V31" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#g-edf-m)"/>
<text x="660.0" y="6.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">P2</text>
<rect x="20.0" y="34.0" width="100.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="70.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="120.0" y="34.0" width="140.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="190.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="260.0" y="34.0" width="100.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="310.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="360.0" y="34.0" width="60.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="390.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="420.0" y="34.0" width="100.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="470.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="520.0" y="34.0" width="80.0" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="560.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="600.0" y="34.0" width="20.0" height="32" rx="0" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:3 3"/>
<rect x="620.0" y="34.0" width="40.0" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="640.0" y="54.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<text x="20.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="120.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">25</text>
<text x="220.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">50</text>
<text x="260.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">60</text>
<text x="340.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">80</text>
<text x="360.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">85</text>
<text x="420.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">100</text>
<text x="520.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">125</text>
<text x="600.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">145</text>
<text x="620.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">150</text>
<text x="660.0" y="83.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">160</text>
<text x="340.0" y="106.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">no deadline missed</text>
</svg>

At t = 50, P1's new deadline (100) is **later** than P2's (80), so **P2 keeps running** and finishes at 60. That's the difference from RM. **No deadline is missed.**

> [!note] A typo on slide 44
> It says "the required time for P1 is 25 and the **deadline** for P2 is 35". It means P2's **required time** is 35. Its deadline is 80.

**Schedulability (slide 45):**
- **EDF is optimal on a single processor.** If the load $\sum t_i/p_i \le 1$, EDF meets **all** deadlines. If the load is above 1, **no algorithm can**.
- **RM** guarantees all *m* tasks meet their deadlines if $\sum t_i/p_i \le m(2^{1/m} - 1)$. This is sufficient but not necessary.

| | **Rate-monotonic (RM)** | **Earliest deadline first (EDF)** |
| --- | --- | --- |
| Priority based on | **Period** (shorter = higher) | **Deadline** (earlier = higher) |
| Priorities | **Static**, fixed at the start | **Dynamic**, change over time |
| Guaranteed schedulable if | $U \le n(2^{1/n} - 1)$ (≈ 0.828 for 2) | $U \le 1$ |
| Overhead | Low: nothing to compute at run time | Higher: deadlines are compared at run time |
| Periodic tasks only? | Yes | No |

### 7. Least laxity first, LLF (slides 46–50)

**Laxity** is how much slack a task has: the **deadline minus the remaining execution time**. The slide writes it as $L_i = D_i - C_i$. At time *t*, with remaining time *c*:

$$
L = D - (t + c)
$$

**How LLF works:**
1. **Find the task with the least laxity.** It gets the highest priority, because it's the closest to missing its deadline.
2. **Execute** it, and update its remaining execution time.
3. **Recompute the laxity** of every other task as time passes.

**Properties:**
- It's a **job-level dynamic priority** algorithm. **Every instant is a scheduling event**, because laxities change all the time.
- **Advantage**: it gives some **advance knowledge of which task is going to miss** its deadline.
- **Disadvantages**:
  - **enormous computation demand**, since every instant is a scheduling event;
  - **poor performance when several tasks have the same least laxity**, because they keep preempting each other.

**Example (slides 48–50):**

| Task | Release | Execution time C | Deadline D | Period T |
| --- | --- | --- | --- | --- |
| T1 | 0 | 2 | 6 | 6 |
| T2 | 0 | 2 | 8 | 8 |
| T3 | 0 | 3 | 10 | 10 |

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: T1 0–2, T2 2–4, T3 4–7, T1 7–9, T2 9–11, T3 11–12, T1 12–14, T3 14–16, T2 16–18, T1 18–20, T3 20–23, idle 23–24." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-llf-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="46.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T1</text>
<rect x="73.3" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="100.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T2</text>
<rect x="126.7" y="8.0" width="80.0" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="166.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T3</text>
<rect x="206.7" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="233.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T1</text>
<rect x="260.0" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="286.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T2</text>
<rect x="313.3" y="8.0" width="26.7" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="326.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T3</text>
<rect x="340.0" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="366.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T1</text>
<rect x="393.3" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="420.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T3</text>
<rect x="446.7" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="473.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T2</text>
<rect x="500.0" y="8.0" width="53.3" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="526.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T1</text>
<rect x="553.3" y="8.0" width="80.0" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="593.3" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">T3</text>
<rect x="633.3" y="8.0" width="26.7" height="32" rx="0" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:3 3"/>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="73.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">2</text>
<text x="126.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">4</text>
<text x="180.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">6</text>
<text x="233.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">8</text>
<text x="286.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">10</text>
<text x="340.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">12</text>
<text x="393.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">14</text>
<text x="446.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">16</text>
<text x="500.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">18</text>
<text x="553.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">20</text>
<text x="606.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">22</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">24</text>
</svg>

- **At t = 0:** L1 = 6 − (0 + 2) = **4**, L2 = 8 − (0 + 2) = 6, L3 = 10 − (0 + 3) = 7. **T1 runs.**
- **At t = 2:** T1 is done. L2 = 8 − (2 + 2) = **4**, L3 = 10 − (2 + 3) = 5. **T2 runs.** At t = 3 both have laxity 4; ties are broken arbitrarily, and T2 continues.
- **At t = 6:** T1's second job arrives. L1 = 12 − (6 + 2) = 4, L3 = 10 − (6 + 1) = **3**. **T3 continues** to 7.
- **The rest:** T1 7–9, T2 9–11, T3 11–12, T1 12–14, T3 14–16, T2 16–18, T1 18–20, T3 20–23. **No deadline is missed.**

> [!note] A slip on slide 50
> At t = 6 the slide computes L1 = 6 − (0 + 2). T1's new job is released at 6 with deadline **12**, so it should be 12 − (6 + 2). It comes out as 4 either way.

### 8. Algorithm evaluation (slides 51–57)

How do you choose a scheduling algorithm? **First decide the criteria, then evaluate the algorithms** against them. There are four methods:

| Method | How | Pros and cons |
| --- | --- | --- |
| **1. Deterministic modeling** | A type of **analytic evaluation**: take one **predetermined workload** and compute each algorithm's performance on it | **Simple and fast**, but needs **exact input numbers** and **only applies to those inputs** |
| **2. Queueing models** | Describe arrivals and CPU and I/O bursts **probabilistically** (commonly exponential, described by the mean). Model the system as a **network of servers**, each with a queue | Computes utilization, average queue length, average wait, etc. **Limited** by its assumptions |
| **3. Simulations** | A **programmed model** of the computer system, with the **clock as a variable**. It's driven by random numbers following distributions, or by **trace tapes** recording real events | **More accurate** than queueing models, but expensive to build and run |
| **4. Implementation** | Actually **implement the scheduler** and test it in real systems | The only fully accurate method, but **high cost and high risk**, and environments vary |

**Deterministic example (slides 51–52):** five processes arriving at 0, with bursts P1 = 10, P2 = 29, P3 = 3, P4 = 7, P5 = 12.

**FCFS**, average waiting **28 ms**:

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 0–10, P2 10–39, P3 39–42, P4 42–49, P5 49–61." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-det_fcfs-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="104.9" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="72.5" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="124.9" y="8.0" width="304.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="277.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="429.2" y="8.0" width="31.5" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="444.9" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="460.7" y="8.0" width="73.4" height="32" rx="0" style="fill:var(--text-muted, #777);fill-opacity:0.16;stroke:var(--text-muted, #777)"/>
<text x="497.4" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
<rect x="534.1" y="8.0" width="125.9" height="32" rx="0" style="fill:var(--yellow, #e5b567);fill-opacity:0.28;stroke:var(--yellow, #e5b567)"/>
<text x="597.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P5</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="124.9" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">10</text>
<text x="429.2" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">39</text>
<text x="460.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">42</text>
<text x="534.1" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">49</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">61</text>
</svg>

**Non-preemptive SJF**, average waiting **13 ms**:

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P3 0–3, P4 3–10, P1 10–20, P5 20–32, P2 32–61." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-det_sjf-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="31.5" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="35.7" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="51.5" y="8.0" width="73.4" height="32" rx="0" style="fill:var(--text-muted, #777);fill-opacity:0.16;stroke:var(--text-muted, #777)"/>
<text x="88.2" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
<rect x="124.9" y="8.0" width="104.9" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="177.4" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="229.8" y="8.0" width="125.9" height="32" rx="0" style="fill:var(--yellow, #e5b567);fill-opacity:0.28;stroke:var(--yellow, #e5b567)"/>
<text x="292.8" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P5</text>
<rect x="355.7" y="8.0" width="304.3" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="507.9" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="51.5" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">3</text>
<text x="124.9" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">10</text>
<text x="229.8" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">20</text>
<text x="355.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">32</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">61</text>
</svg>

**RR** (q = 10), average waiting **23 ms**:

<svg viewBox="0 0 680 66" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Gantt chart: P1 0–10, P2 10–20, P3 20–23, P4 23–30, P5 30–40, P2 40–50, P5 50–52, P2 52–61." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="g-det_rr-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker></defs>
<rect x="20.0" y="8.0" width="104.9" height="32" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="72.5" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P1</text>
<rect x="124.9" y="8.0" width="104.9" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="177.4" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="229.8" y="8.0" width="31.5" height="32" rx="0" style="fill:var(--accent, #6c99bb);fill-opacity:0.38;stroke:var(--accent, #6c99bb)"/>
<text x="245.6" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P3</text>
<rect x="261.3" y="8.0" width="73.4" height="32" rx="0" style="fill:var(--text-muted, #777);fill-opacity:0.16;stroke:var(--text-muted, #777)"/>
<text x="298.0" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P4</text>
<rect x="334.8" y="8.0" width="104.9" height="32" rx="0" style="fill:var(--yellow, #e5b567);fill-opacity:0.28;stroke:var(--yellow, #e5b567)"/>
<text x="387.2" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P5</text>
<rect x="439.7" y="8.0" width="104.9" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="492.1" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<rect x="544.6" y="8.0" width="21.0" height="32" rx="0" style="fill:var(--yellow, #e5b567);fill-opacity:0.28;stroke:var(--yellow, #e5b567)"/>
<text x="555.1" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P5</text>
<rect x="565.6" y="8.0" width="94.4" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="612.8" y="28.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">P2</text>
<text x="20.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">0</text>
<text x="124.9" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">10</text>
<text x="229.8" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">20</text>
<text x="261.3" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">23</text>
<text x="334.8" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">30</text>
<text x="439.7" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">40</text>
<text x="544.6" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">50</text>
<text x="565.6" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">52</text>
<text x="660.0" y="57.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">61</text>
</svg>

So for this workload, **SJF is best**. The slide's "FCS" means FCFS.

**Little's formula (slide 54).** In steady state, the rate at which processes leave a queue equals the rate at which they arrive, so:

$$
n = \lambda \times W
$$

Here **n** is the average queue length, **λ** the average arrival rate, and **W** the average waiting time in the queue. It's **valid for any scheduling algorithm and any arrival distribution**.

**Example:** 7 processes arrive per second and there are normally 14 in the queue, so W = n / λ = 14 / 7 = **2 seconds**.

## Part 2: Process synchronization (chapter 6)

### 9. Background (slides 4–6)

- Processes can execute **concurrently**, and may be **interrupted at any time**, partway through.
- **Concurrent access to shared data can make it inconsistent.**
- Keeping data consistent needs mechanisms that ensure **orderly execution** of cooperating processes.

The illustration is a **producer–consumer that fills all the buffers**. The [[chapter-3-quiz-5|Quiz 5 bounded buffer]] could only use `BUFFER_SIZE − 1` slots. This version adds a shared integer **`counter`** of full buffers, starting at 0. The **producer increments** it and the **consumer decrements** it.

```c
/* producer */                         /* consumer */
while (true) {                         while (true) {
    /* produce next_produced */            while (counter == 0)
    while (counter == BUFFER_SIZE)              ;   /* do nothing */
        ;   /* do nothing */                next_consumed = buffer[out];
    buffer[in] = next_produced;             out = (out + 1) % BUFFER_SIZE;
    in = (in + 1) % BUFFER_SIZE;            counter--;
    counter++;                              /* consume next_consumed */
}                                      }
```

Each piece looks correct on its own, but **run concurrently, `counter` can end up wrong**.

### 10. Race condition (slide 7) ⚑

`counter++` and `counter--` are **not single steps**. In machine language each one is three:

| `counter++` | `counter--` |
| --- | --- |
| `register1 = counter` | `register2 = counter` |
| `register1 = register1 + 1` | `register2 = register2 - 1` |
| `counter = register1` | `counter = register2` |

**One bad interleaving, starting with `counter = 5`:**

| Step | Who | Does | Result |
| --- | --- | --- | --- |
| S0 | Producer | `register1 = counter` | register1 = 5 |
| S1 | Producer | `register1 = register1 + 1` | register1 = 6 |
| | | *context switch* | |
| S2 | Consumer | `register2 = counter` | register2 = 5 |
| S3 | Consumer | `register2 = register2 - 1` | register2 = 4 |
| | | *context switch* | |
| S4 | Producer | `counter = register1` | counter = **6** |
| | | *context switch* | |
| S5 | Consumer | `counter = register2` | counter = **4** |

One item was produced and one consumed, so `counter` should still be **5**, but it ends at **4**. With S4 and S5 swapped, it would end at 6.

A **race condition** is when several processes access and change shared data concurrently, and **the result depends on the order in which they happen to run**. The fix is to let **only one process at a time** manipulate `counter`.

### 11. The critical-section problem (slides 8–10) ⚑

- There are **n processes** {P₀, …, Pₙ₋₁}. Each has a **critical section**: a segment of code that changes common variables, updates a table, writes a file, etc.
- **When one process is in its critical section, no other may be in its own.**
- The **critical-section problem** is to **design a protocol** that guarantees this.

Each process must **ask permission** in an **entry section**. The critical section may be followed by an **exit section**, and the rest is the **remainder section**:

```c
do {
    /* entry section */        // ask permission
        /* critical section */
    /* exit section */         // announce you're done
        /* remainder section */
} while (true);
```

**Any solution must satisfy three requirements:**

| # | Requirement | Meaning |
| --- | --- | --- |
| 1 | **Mutual exclusion** | If Pᵢ is executing in its critical section, **no other process** can be executing in its own |
| 2 | **Progress** | If **no one is in a critical section** and some processes want in, the choice of who enters next **can't be postponed indefinitely**. Only processes trying to enter take part in the decision |
| 3 | **Bounded waiting** | After a process asks to enter, there's a **limit on how many times others can enter first**. Nobody waits forever |

There are two assumptions:
- **Each process executes at a nonzero speed**: it keeps making progress.
- **Nothing is assumed about the relative speed** of the processes: a solution can't depend on timing.

> [!tip] Memory aid: "**M**ust **P**ass **B**oth" — **M**utual exclusion · **P**rogress · **B**ounded waiting
> Mutual exclusion is about safety ("never two inside"). Progress and bounded waiting are about liveness ("someone gets in" and "everyone eventually gets in").

### 12. Critical sections inside the OS kernel (slide 11) ⚑

The kernel itself has shared data, such as lists of open files and memory allocation. There are two approaches:

| **Preemptive kernel** | **Non-preemptive kernel** |
| --- | --- |
| A process **can be preempted while running in kernel mode** | A process runs **until it exits kernel mode, blocks, or voluntarily yields** the CPU |
| Must be carefully designed to avoid races on kernel data. More responsive, and suits real-time ([§3](#3-real-time-cpu-scheduling-slides-3438)) | **Essentially free of race conditions in kernel mode**, because only one process is active in the kernel at a time |

### 13. Strict alternation (slides 12–14) ⚑

The first attempt at a solution for **two processes**, P₀ and P₁. They share **`int turn`**, initially 0. For Pᵢ, the other process is Pⱼ:

```c
do {
    while (turn == j) ;     // wait while it's j's turn
        /* critical section */
    turn = j;               // give the turn to the other process
        /* remainder section */
} while (true);
```

| Requirement | Met? | Why |
| --- | --- | --- |
| **Mutual exclusion** | ✅ **Yes** | `turn` can only be 0 or 1, so only one process can pass the `while` |
| **Progress** | ❌ **No** | The processes are forced to take **strict turns**. If Pᵢ finishes and hands the turn to Pⱼ, but **Pⱼ doesn't want to enter** (it's busy in its remainder section), **Pᵢ must wait** until Pⱼ enters and exits once, even though the critical section is empty |
| **Bounded waiting** | ✅ Yes | A process waits for at most one turn of the other |

**Trace from slide 14** (turn = 0 at the start):

| Step | Process 0 (i = 0, j = 1) | Process 1 (i = 1, j = 0) |
| --- | --- | --- |
| 1 | `turn == 1`? No, so it doesn't wait | `turn == 0`? Yes, so it waits |
| 2 | Enters the critical section | Still waiting |
| 3 | Executes the critical section | Still blocked |
| 4 | Sets `turn = 1` | `turn == 0`? No, so it stops waiting |
| 5 | Exits to the remainder section | Enters the critical section |
| 6 | `turn == 1`? Yes, so it waits | Executes the critical section |
| 7 | `turn == 1`? No, so it stops waiting | Sets `turn = 0` |
| 8 | Enters the critical section | Exits to the remainder, checks `turn == 0`? Yes, so it waits |

The fix for the progress problem is **Peterson's solution** (slide 15), which adds a `flag[]` array so a process only waits if the other one **actually wants** to enter. That's the start of the next part of the chapter.

## Practice problems

> [!example]- 1. Real-time: P1 (t = 2, p = 5) and P2 (t = 4, p = 7). Is the set schedulable under RM? Under EDF?
> $U = 2/5 + 4/7 = 0.4 + 0.571 = 0.971$.
> - **RM:** 0.971 > 0.828, so the bound test is **inconclusive**. Simulate it: P1 0–2, P2 2–5, then **P1 preempts at 5** (shorter period) and runs 5–7. At t = 7, P2 has done only 3 of its 4 units, so it **misses its deadline**. Not schedulable.
> - **EDF:** U = 0.971 ≤ 1, so it's **schedulable**. P1 0–2, P2 2–6 (at t = 5, P2's deadline 7 is earlier than P1's new deadline 10, so P2 keeps running), P1 6–8, P2 8–12, and so on, with no misses.

> [!example]- 2. MLFQ (slide 33's queues): jobs A = 5 ms, B = 20 ms, C = 30 ms all arrive at 0. In which queue does each one finish?
> - **A** finishes in **Q0**: it needs 5 ≤ 8.
> - **B** uses 8 in Q0, then needs 12 ≤ 16, so it finishes in **Q1**.
> - **C** uses 8 in Q0 and 16 in Q1, then finishes its last 6 in **Q2**.

> [!example]- 3. Little's formula: 10 processes arrive per second, and each waits 3 seconds on average. What's the average queue length?
> n = λ × W = 10 × 3 = **30 processes**.

> [!example]- 4. LLF: at t = 4, task X has deadline 12 and 5 units left, and task Y has deadline 10 and 2 units left. Which runs?
> L_X = 12 − (4 + 5) = **3**, L_Y = 10 − (4 + 2) = 4. **X runs**, because it has the least laxity, even though Y's deadline is earlier. EDF would have picked Y.

## Likely quiz questions and 5-minute answers

Ranked by how likely they seem. These are guesses, since no past quiz covers this range.

> [!question]- 1. "What are the three requirements for a solution to the critical-section problem?" (if the range reaches 14)
> 1. **Mutual exclusion**: if a process is in its critical section, no other process can be in its critical section.
> 2. **Progress**: if no process is in a critical section and some want to enter, choosing the next one can't be postponed indefinitely.
> 3. **Bounded waiting**: after a process requests entry, there's a limit on how many times others can enter before it.
>
> Assumptions: every process runs at a nonzero speed, and nothing is assumed about relative speeds. The structure is entry section → critical section → exit section → remainder section.

> [!question]- 2. "Compare multilevel queue and multilevel feedback queue scheduling."
> **Multilevel queue:** the ready queue is split into separate queues (e.g. foreground with RR, background with FCFS). **A process stays in its queue permanently.** Between queues: fixed priority (starvation possible) or time slices (e.g. 80% / 20%).
> **Multilevel feedback queue:** processes **can move between queues**, and aging can be implemented this way. It's defined by 5 parameters: the number of queues, each queue's algorithm, when to upgrade, when to demote, and which queue a process enters. Example: Q0 RR 8 ms → Q1 RR 16 ms → Q2 FCFS, demoting jobs that don't finish.

> [!question]- 3. "Compare rate-monotonic and EDF scheduling." or "Is this task set schedulable?"
> **RM:** static priority = 1/period (shorter period = higher priority). Schedulable if $U = \sum t_i/p_i \le n(2^{1/n} - 1)$ (≈ 0.828 for 2 tasks, → 0.693). The test is sufficient but not necessary.
> **EDF:** dynamic priority, earlier deadline = higher. Optimal on one CPU: schedulable if and only if U ≤ 1.
> **Example:** 25/50 + 35/80 = 0.9375. RM misses P2's deadline at 80, but EDF meets every deadline.

> [!question]- 4. "Explain a race condition with an example."
> When several processes access shared data concurrently and **the result depends on the order** of execution. `counter++` and `counter--` are each three machine steps (load into a register, change it, store it). If the producer and consumer interleave (load 5, +1 → 6, load 5, −1 → 4, store 6, store 4), `counter` ends at **4** instead of 5. The fix is to let only one process at a time into the code that changes `counter`: the critical section.

> [!question]- 5. "Soft vs hard real-time. What are interrupt latency and dispatch latency?"
> **Soft real-time:** no guarantee of when a critical process is scheduled. **Hard real-time:** tasks must be serviced by their deadlines.
> **Interrupt latency:** from an interrupt's arrival to the start of its service routine (ISR).
> **Dispatch latency:** the time to stop one process and start another. It has a **conflict phase** (preempting a kernel-mode process, and low-priority processes releasing resources the high-priority one needs) and a **dispatch phase** (the context switch).

> [!question]- 6. "How are CPU-scheduling algorithms evaluated?"
> 1. **Deterministic modeling**: compute performance on a fixed workload. Simple and fast, but only valid for those numbers. (Example: FCFS 28, SJF 13, RR 23 ms.)
> 2. **Queueing models**: probabilistic arrivals and bursts, with the system as a network of queues. Uses Little's formula, $n = \lambda W$.
> 3. **Simulation**: a programmed model with a clock variable, driven by random distributions or trace tapes. More accurate.
> 4. **Implementation**: build it and test it in a real system. Most accurate, but high cost and risk.

> [!question]- 7. "Explain least laxity first."
> Laxity = deadline − (current time + remaining execution time): the slack before a task would miss its deadline. LLF always runs the task with the **least laxity**, recomputing at every instant, so it's job-level dynamic priority.
> **Advantage:** it warns early which task will miss its deadline.
> **Disadvantages:** enormous computation, since every instant is a scheduling event, and poor performance when tasks tie for least laxity.

> [!question]- 8. "Why does strict alternation fail as a critical-section solution?"
> It uses a shared `turn`: Pᵢ waits while `turn == j`, enters, then sets `turn = j`. **Mutual exclusion holds**, because only the process whose turn it is can enter. **Progress fails**: the processes must alternate strictly, so if Pⱼ doesn't want to enter, Pᵢ can't enter again even though the critical section is empty. Peterson's solution fixes this with `flag[]`.

> [!question]- 9. "Preemptive vs non-preemptive kernels."
> **Preemptive:** a process can be preempted in kernel mode. It's more responsive and better for real-time, but kernel data needs protection from races.
> **Non-preemptive:** a process runs until it leaves kernel mode, blocks, or yields, so only one is ever active in the kernel. It's essentially free of race conditions in kernel mode.

> [!question]- 10. "State Little's formula and give an example."
> $n = \lambda \times W$: the average queue length equals the arrival rate times the average waiting time, in steady state, for any scheduling algorithm and arrival distribution. With 7 processes arriving per second and 14 in the queue, W = 14 / 7 = **2 seconds**.

> [!tip] How to write the answer
> - **Schedulability questions:** compute **U first**, compare it to the right bound (RM: $n(2^{1/n}-1)$, EDF: 1), and say whether the RM test is conclusive. If you have time, draw the Gantt chart with the **deadline arrows**.
> - **Lists:** give the count first ("three requirements…", "five parameters…"), then one line each.
> - **Race conditions:** show the **register-level interleaving** with actual numbers. That's what makes the answer convincing.

## Numbers and formulas to memorize

| | |
| --- | --- |
| Multilevel queue | Process stays in its queue. Between queues: **fixed priority** (starvation) or **time slice** (80% / 20%) |
| MLFQ parameters | **5**: number of queues, each queue's algorithm, upgrade, demote, entry queue |
| MLFQ example | Q0 RR **8 ms** → Q1 RR **16 ms** → Q2 **FCFS** |
| Latencies | **Interrupt** (to ISR start) and **dispatch** (conflict + dispatch phases) |
| Periodic task | **0 ≤ t ≤ d ≤ p**; rate = 1/p |
| Utilization | $U = \sum t_i / p_i$ |
| RM bound | $n(2^{1/n} - 1)$: **0.828** for 2, **0.780** for 3, **→ 0.693** |
| EDF bound | **U ≤ 1** (optimal on one CPU) |
| Laxity | $L = D - (t + c)$ |
| Evaluation methods | **4**: deterministic, queueing, simulation, implementation |
| Little's formula | $n = \lambda \times W$ |
| Deterministic example | FCFS **28**, SJF **13**, RR **23** ms |
| Critical-section requirements | **3**: mutual exclusion, progress, bounded waiting |
| CS structure | entry → critical → exit → remainder |
| Strict alternation | Mutual exclusion ✅, **progress ❌** |
