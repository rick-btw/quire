---
title: "Quiz 4: Chapter 3, Slides 1–48"
description: Quiz 4 prep for chapter 3 (Processes), slides 3.1–3.48. Covers process concept and memory layout, states, the PCB, context switches, scheduling queues and schedulers, creation and termination, zombies and orphans, and IPC, with likely quiz questions and 5-minute model answers.
tags: [operating-systems, quiz-prep]
---
# Quiz 4: Chapter 3, Slides 1–48

> [!abstract] This note is for **Quiz 4**: chapter 3 (*Processes*), **slides 3.1–3.44**, possibly up to **3.48**
> Everything through slide 3.44 is covered in full. Slides 3.45–3.48 (the bounded-buffer code and shared memory) are marked **⚑ only if the range goes to 48**. Earlier chapters: [[00-overview|Chapter 1 overview]], [[chapter-2-summary|Chapter 2 Summary]], [[chapter-2-quiz-3|Quiz 3]]. The rest of chapter 3 (message passing) is in [[chapter-3-quiz-5|Quiz 5: Chapter 3, Slides 45–66]].

> [!warning] Last year's Quiz 4 asked: **"Context switch" and "the parts of the PCB"**
> An answer that described the context switch and listed the **7 PCB fields** got **100**. That's slides 3.12–3.13 and 3.22, so know [the PCB](#4-the-process-control-block-pcb-slides-312-315) and [the context switch](#5-context-switch-slides-313-322) cold. More ideas are in [likely questions](#likely-quiz-questions-and-5-minute-answers).
>
> One thing to do *better* than last year: that answer called the context switch "swapping" and said the process is moved to disk. **That's wrong.** A context switch saves the CPU state into the PCB, and the process stays in memory. Swapping is a different thing, done by the medium-term scheduler ([§8](#8-the-three-schedulers-slides-319320)).

## 1. Process concept (slides 3.4–3.5)

An OS runs many programs:
- **jobs** in batch systems
- **user programs or tasks** in time-shared systems

The textbook uses *job* and *process* almost interchangeably ([[16-multiprogramming-and-timesharing|multiprogramming and timesharing]]).

A **process** is **a program in execution**. Its execution must progress in **sequential** fashion.

| **Program** | **Process** |
| --- | --- |
| **Passive** entity: an executable file stored on disk | **Active** entity: running, with a program counter and resources |
| Becomes a process **when the executable file is loaded into memory** (started by a GUI click, typing its name, …) | One program can be **several processes**, for example several users running the same program |

**The parts of a process:**
- **Text section**: the program code.
- **Current activity**: the **program counter** and the **processor registers**.
- **Stack**: temporary data, meaning function parameters, return addresses, and local variables.
- **Data section**: global variables.
- **Heap**: memory dynamically allocated during run time.

## 2. A process in memory (slides 3.6–3.9)

<svg viewBox="0 0 680 320" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="A process in memory, from address 0 up to max: text (program code), data (global variables), heap (grows up), free space, stack (grows down)." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q4-mem-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q4-mem-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<rect x="140" y="20" width="160" height="50" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="220.0" y="49.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">stack</text>
<text x="316.0" y="49.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">function parameters, return addresses, local variables</text>
<rect x="140" y="70" width="160" height="110" rx="0" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<rect x="140" y="180" width="160" height="40" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="220.0" y="204.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">heap</text>
<text x="316.0" y="204.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">memory allocated at run time (malloc, new)</text>
<rect x="140" y="220" width="160" height="40" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="220.0" y="244.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">data</text>
<text x="316.0" y="244.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">global variables</text>
<rect x="140" y="260" width="160" height="40" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="220.0" y="284.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">text</text>
<text x="316.0" y="284.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">program code</text>
<path d="M220,78 V110" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-mem-m)"/>
<path d="M220,172 V140" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-mem-m)"/>
<text x="316.0" y="118.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">free space: the stack grows down,</text>
<text x="316.0" y="136.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">the heap grows up</text>
<text x="128.0" y="26.0" text-anchor="end" style="fill:var(--text-muted, #777)">max</text>
<text x="128.0" y="304.0" text-anchor="end" style="fill:var(--text-muted, #777)">0</text>
</svg>

The stack and the heap grow **towards each other** into the free space between them.
- The **stack** is for **short-lived, predictable data** with known sizes.
- The **heap** is for **long-lived data**, or data whose **size is only known at run time**.

| | **Stack** | **Heap** |
| --- | --- | --- |
| Stores | Local variables, function parameters, return addresses | Memory **dynamically allocated** at run time |
| Order | **LIFO** (last in, first out) | **No particular order**: allocate and free in any sequence |
| Management | **Automatic**: allocated on entering a function, freed on leaving it | **Manual** (`malloc`/`free` in C, `new`/`delete` in C++) or **garbage-collected** (Java, Python) |
| Speed | **Fast**: ordered structure | **Slower**: pointer indirection and fragmentation |
| Size | **Fixed or limited**. Exceeding it causes a **stack overflow** | **Larger and more flexible** |
| Layout | **Contiguous**, managed by the CPU (through the stack pointer) | Can become **fragmented** over time |

## 3. Process states (slides 3.10–3.11)

As a process executes, it **changes state**:

| State | Meaning |
| --- | --- |
| **new** | The process is being created |
| **ready** | Waiting to be **assigned to a processor** |
| **running** | Its instructions are being executed |
| **waiting** | Waiting for some **event** to occur, such as I/O completion |
| **terminated** | It has finished execution |

<svg viewBox="0 0 700 290" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Process state diagram: new to ready (admitted), ready to running (scheduler dispatch), running to ready (interrupt), running to waiting (I/O or event wait), waiting to ready (I/O or event completion), running to terminated (exit)." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q4-states-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q4-states-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<ellipse cx="90.0" cy="45.0" rx="62" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="90.0" y="49.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">new</text>
<ellipse cx="610.0" cy="45.0" rx="62" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="610.0" y="49.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">terminated</text>
<ellipse cx="230.0" cy="140.0" rx="62" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="230.0" y="144.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">ready</text>
<ellipse cx="470.0" cy="140.0" rx="62" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="470.0" y="144.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">running</text>
<ellipse cx="350.0" cy="248.0" rx="62" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="350.0" y="252.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">waiting</text>
<path d="M148,55 Q195,68 208,116" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-states-m)"/>
<text x="186.0" y="80.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">admitted</text>
<path d="M283,153 Q350,188 417,153" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-states-m)"/>
<text x="350.0" y="192.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">scheduler dispatch</text>
<path d="M417,127 Q350,92 283,127" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-states-m)"/>
<text x="350.0" y="98.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">interrupt</text>
<path d="M520,126 Q572,104 592,70" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-states-m)"/>
<text x="574.0" y="106.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">exit</text>
<path d="M496,162 Q486,226 410,244" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-states-m)"/>
<text x="490.0" y="222.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">I/O or event wait</text>
<path d="M290,246 Q222,232 214,166" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-states-m)"/>
<text x="208.0" y="228.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">I/O or event completion</text>
</svg>

| Transition | Caused by |
| --- | --- |
| new → ready | **admitted** by the OS |
| ready → running | **scheduler dispatch**: the short-term scheduler picks it |
| running → ready | an **interrupt**, for example the timer ending its time slice ([[17-dual-mode-and-timer]]) |
| running → waiting | **I/O or event wait** |
| waiting → ready | **I/O or event completion** |
| running → terminated | **exit** |

> [!tip] Two traps examiners love
> - A waiting process **never goes straight back to running**. It returns to **ready** and waits for the scheduler.
> - On one CPU, only **one** process is *running* at a time. Many can be *ready* or *waiting*.

## 4. The process control block (PCB) (slides 3.12, 3.15)

The **PCB** (also called the **task control block**) holds the **information associated with each process**. The OS keeps one per process.

**The 7 fields:**
1. **Process state**: running, waiting, etc.
2. **Program counter**: the location of the next instruction to execute.
3. **CPU registers**: the contents of all process-centric registers.
4. **CPU-scheduling information**: priorities, pointers to scheduling queues.
5. **Memory-management information**: the memory allocated to the process.
6. **Accounting information**: CPU time used, clock time elapsed since start, time limits.
7. **I/O status information**: the I/O devices allocated to the process, its list of open files.

> [!tip] Memory aid: "State, PC, Registers" + "Scheduling, Memory, Accounting, I/O"
> The first three are **what the CPU was doing**. The last four are **what the OS knows about the process**.

**In Linux** the PCB is the C structure **`task_struct`** (slide 3.15):

| Field | Holds |
| --- | --- |
| `pid_t pid` | Process identifier |
| `long state` | State of the process |
| `unsigned int time_slice` | Scheduling information |
| `struct task_struct *parent` | This process's parent |
| `struct list_head children` | This process's children |
| `struct files_struct *files` | List of open files |
| `struct mm_struct *mm` | Address space of this process |

**Threads (slide 3.14).** So far a process has a **single thread** of execution. With **multiple program counters per process**, several parts of it can execute at once. These are **threads**, and the PCB must then store the details of each one. Threads are chapter 4 (see also [[14-cores-threads-concurrency|cores and threads]]).

## 5. Context switch (slides 3.13, 3.22)

When the CPU switches to another process, the system must:
1. **save the state of the old process**, and
2. **load the saved state of the new process**.

This is a **context switch**. A process's **context is represented in its PCB**.

<svg viewBox="0 0 700 400" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Context switch between process P0 and P1: P0 executes, an interrupt or system call makes the OS save P0's state into PCB0 and reload P1's state from PCB1, P1 executes, then the OS saves into PCB1 and reloads from PCB0. Each process is idle while the other runs." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q4-switch-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q4-switch-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<text x="110.0" y="22.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">process P₀</text>
<text x="350.0" y="22.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">operating system</text>
<text x="590.0" y="22.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">process P₁</text>
<path d="M110,40 V80" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:5;stroke-linecap:round"/>
<path d="M110,84 V326" style="fill:none;stroke:var(--text-muted, #777);stroke-width:2.2;stroke-dasharray:1 6;stroke-linecap:round"/>
<path d="M110,330 V385" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:5;stroke-linecap:round"/>
<path d="M590,40 V138" style="fill:none;stroke:var(--text-muted, #777);stroke-width:2.2;stroke-dasharray:1 6;stroke-linecap:round"/>
<path d="M590,142 V243" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:5;stroke-linecap:round"/>
<path d="M590,247 V385" style="fill:none;stroke:var(--text-muted, #777);stroke-width:2.2;stroke-dasharray:1 6;stroke-linecap:round"/>
<text x="94.0" y="62.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">executing</text>
<text x="94.0" y="205.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">idle</text>
<text x="94.0" y="360.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">executing</text>
<text x="606.0" y="92.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">idle</text>
<text x="606.0" y="195.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">executing</text>
<text x="606.0" y="320.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">idle</text>
<rect x="250" y="70" width="200" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="350.0" y="89.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">save state into PCB₀</text>
<rect x="250" y="118" width="200" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="350.0" y="137.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">reload state from PCB₁</text>
<rect x="250" y="250" width="200" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="350.0" y="269.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">save state into PCB₁</text>
<rect x="250" y="298" width="200" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="350.0" y="317.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">reload state from PCB₀</text>
<path d="M350,101 V117" style="fill:none;stroke:var(--text-muted, #777);stroke-width:2.2;stroke-dasharray:1 6;stroke-linecap:round"/>
<path d="M350,281 V297" style="fill:none;stroke:var(--text-muted, #777);stroke-width:2.2;stroke-dasharray:1 6;stroke-linecap:round"/>
<path d="M114,80 L248,84" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-switch-m)"/>
<text x="178.0" y="70.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">interrupt or system call</text>
<path d="M450,134 L586,140" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-switch-m)"/>
<path d="M586,244 L452,262" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-switch-m)"/>
<text x="522.0" y="238.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">interrupt or system call</text>
<path d="M250,314 L114,330" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-switch-m)"/>
</svg>

**Step by step (slide 3.13):**
1. P₀ is executing when an **interrupt or system call** occurs.
2. The OS **saves P₀'s state into PCB₀**.
3. The OS **reloads P₁'s state from PCB₁**.
4. **P₁ executes**, while P₀ is idle.
5. On the next interrupt or system call, the OS **saves into PCB₁** and **reloads from PCB₀**, and **P₀ continues** exactly where it stopped.

**Cost:**
- **Context-switch time is overhead.** The system does **no useful work** while switching.
- The **more complex the OS and the PCB**, the **longer** the context switch.
- The time **depends on hardware support**. Some CPUs provide **multiple sets of registers**, so several contexts can be loaded at once and a switch is just changing which set is used.

| Context switch | Swapping |
| --- | --- |
| Saves and loads **CPU state** (registers, PC) through the **PCB** | Moves a **whole process between memory and disk** |
| The process **stays in memory** | The process **leaves memory** |
| Happens **constantly** (milliseconds), on interrupts and system calls | Done occasionally by the **medium-term scheduler** |

## 6. Scheduling queues (slides 3.16–3.18)

**Goal:**
- **Maximize CPU use.**
- Quickly switch processes onto the CPU for **time sharing**.

The **process scheduler** selects among available processes for the next execution on the CPU. It maintains **scheduling queues**:

| Queue | Contains |
| --- | --- |
| **Job queue** | **All processes** in the system |
| **Ready queue** | Processes **in main memory, ready and waiting** to execute |
| **Device queues** | Processes **waiting for an I/O device**. There is one per device |

**Processes migrate among the various queues.** The queues are linked lists of PCBs, with a header pointing to the first and last PCB (slide 3.17).

The **queueing diagram** (slide 3.18) shows the queues, the resources, and how processes flow between them:

<svg viewBox="0 0 700 330" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Queueing diagram: processes enter the ready queue and get the CPU. They leave the CPU to finish, or because of an I/O request (into an I/O queue), an expired time slice, forking a child, or waiting for an interrupt, and then return to the ready queue." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q4-queue-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q4-queue-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<rect x="150" y="20" width="150" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="225.0" y="41.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">ready queue</text>
<circle cx="520" cy="37" r="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="520.0" y="41.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">CPU</text>
<path d="M30,37 H147" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<path d="M300,37 H493" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<path d="M544,37 H665" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<path d="M532,58 Q600,60 600,84 V290" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M600,95 H583" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<rect x="440" y="78" width="140" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="510.0" y="99.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">I/O request</text>
<path d="M440,95 H413" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<rect x="270" y="78" width="140" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="340.0" y="99.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">I/O queue</text>
<path d="M270,95 H225" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<circle cx="200" cy="95" r="22" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="200.0" y="99.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">I/O</text>
<path d="M178,95 H80" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M600,160 H583" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<rect x="440" y="143" width="140" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="510.0" y="164.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">time slice expired</text>
<path d="M440,160 H80" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M600,225 H583" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<rect x="440" y="208" width="140" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="510.0" y="229.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">fork a child</text>
<path d="M440,225 H413" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<ellipse cx="340.0" cy="225.0" rx="72" ry="20" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="340.0" y="229.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">child executes</text>
<path d="M268,225 H80" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M600,290 H583" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<rect x="440" y="273" width="140" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="510.0" y="294.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">wait for an interrupt</text>
<path d="M440,290 H413" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-queue-m)"/>
<ellipse cx="340.0" cy="290.0" rx="72" ry="20" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="340.0" y="294.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">interrupt occurs</text>
<path d="M268,290 H80" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M80,290 V37" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
</svg>

A process leaves the CPU for one of five reasons:
1. It **finishes**.
2. It issues an **I/O request**, and goes into that device's I/O queue.
3. Its **time slice expires**.
4. It **forks a child** and waits for it.
5. It **waits for an interrupt**.

In every case except the first, it eventually comes back to the **ready queue**.

## 7. Multitasking on mobile (slide 3.21)

- **Early iOS** allowed only **one** process to run, with the others suspended. Because of limited screen space and the UI, iOS has:
  - **one foreground process**, controlled through the user interface;
  - **multiple background processes**, in memory and running but not on the display, **with limits**. They are allowed a single short task, receiving event notifications, or specific long-running tasks like audio playback.
- **Android** runs foreground and background processes **with fewer limits**.
  - A background process uses a **service** to do its work.
  - The service **keeps running even if the background process is suspended**.
  - A service has **no user interface** and **small memory use**.

## 8. The three schedulers (slides 3.19–3.20)

| | **Short-term** (CPU scheduler) | **Long-term** (job scheduler) | **Medium-term** |
| --- | --- | --- | --- |
| Decides | **Which ready process runs next**, and allocates the CPU | **Which processes are brought into the ready queue** | **Which process to remove from memory** for a while |
| Runs | **Very often** (milliseconds), so it **must be fast** | **Rarely** (seconds, minutes), so it **may be slow** | When memory is overcommitted |
| Controls | — | The **degree of multiprogramming** (how many processes are in memory) | **Decreases** the degree of multiprogramming |
| Mechanism | Dispatch | Admission | **Swapping**: remove from memory to disk, **swap back in** later to continue |

The short-term scheduler is sometimes the **only** scheduler in a system.

**I/O-bound vs CPU-bound.** "Bound" means **limited by**.

| **I/O-bound process** | **CPU-bound process** |
| --- | --- |
| Spends more time doing **I/O** than computing | Spends more time doing **computations** |
| **Many short** CPU bursts | **Few very long** CPU bursts |
| Limited by **I/O speed** | Limited by **CPU speed** |

The **long-term scheduler strives for a good process mix** of both. With only I/O-bound processes the CPU sits idle; with only CPU-bound processes the devices sit idle.

## 9. Process creation (slides 3.23–3.30)

The system must provide mechanisms for **process creation** and **termination**.

- **Parent processes create children**, which in turn create other processes, forming a **tree of processes**.
- Each process is identified and managed by a **process identifier (pid)**.

<svg viewBox="0 0 700 310" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Tree of processes in Linux: init (pid 1) is the parent of login, kthreadd and sshd. login starts bash, which runs ps and emacs. kthreadd starts khelper and pdflush. sshd starts another sshd, which runs tcsh." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q4-tree-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q4-tree-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<path d="M350,35 L150,115" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M350,35 L350,115" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M350,35 L550,115" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M150,115 L140,195" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M350,115 L280,195" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M350,115 L420,195" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M550,115 L550,195" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M140,195 L70,275" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M140,195 L210,275" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M550,195 L550,275" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<ellipse cx="350.0" cy="35.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="350.0" cy="35.0" rx="58" ry="23" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="350.0" y="32.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">init</text>
<text x="350.0" y="46.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 1</text>
<ellipse cx="150.0" cy="115.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="150.0" cy="115.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="150.0" y="112.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">login</text>
<text x="150.0" y="126.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 8415</text>
<ellipse cx="350.0" cy="115.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="350.0" cy="115.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="350.0" y="112.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">kthreadd</text>
<text x="350.0" y="126.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 2</text>
<ellipse cx="550.0" cy="115.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="550.0" cy="115.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="550.0" y="112.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">sshd</text>
<text x="550.0" y="126.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 3028</text>
<ellipse cx="140.0" cy="195.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="140.0" cy="195.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="140.0" y="192.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">bash</text>
<text x="140.0" y="206.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 8416</text>
<ellipse cx="280.0" cy="195.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="280.0" cy="195.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="280.0" y="192.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">khelper</text>
<text x="280.0" y="206.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 6</text>
<ellipse cx="420.0" cy="195.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="420.0" cy="195.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="420.0" y="192.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pdflush</text>
<text x="420.0" y="206.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 200</text>
<ellipse cx="550.0" cy="195.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="550.0" cy="195.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="550.0" y="192.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">sshd</text>
<text x="550.0" y="206.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 3610</text>
<ellipse cx="70.0" cy="275.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="70.0" cy="275.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="70.0" y="272.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">ps</text>
<text x="70.0" y="286.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 9298</text>
<ellipse cx="210.0" cy="275.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="210.0" cy="275.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="210.0" y="272.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">emacs</text>
<text x="210.0" y="286.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 9204</text>
<ellipse cx="550.0" cy="275.0" rx="58" ry="23" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="550.0" cy="275.0" rx="58" ry="23" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="550.0" y="272.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">tcsh</text>
<text x="550.0" y="286.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">pid = 4005</text>
</svg>

In Linux (slide 3.25), **`init` (pid 1)** is the root of the tree. Its children are:
- **`login`**, which starts the user's `bash`, which runs `ps` and `emacs`;
- **`kthreadd`**, which creates kernel threads;
- **`sshd`**, which accepts remote logins.

**The options a system can offer:**

| Choice | Options |
| --- | --- |
| **Resource sharing** | (1) Parent and children share **all** resources. (2) Children share a **subset** of the parent's resources. (3) Parent and child share **no** resources |
| **Execution** | (1) Parent and children execute **concurrently**. (2) The parent **waits** until its children terminate |
| **Address space** | (1) The child is a **duplicate of the parent**: an exact copy of its code, data, and stack, made by `fork()`. (2) The child **has a new program loaded** into it, with `exec()` |

**In UNIX:**
- **`fork()`** creates a new process by **duplicating the calling process**. The child gets a **separate copy** of the parent's address space.
- **`exec()`** is used after `fork()` to **replace the process's memory space with a new program**. This is how shells launch programs ([[chapter-2-practice-exercises|exercise 2.6]]).

```c
pid_t pid = fork();            // 1. create a new process
if (pid == 0) {                // in the child:
    execvp("program", args);   // 2. replace its memory with a new program
} else {                       // in the parent:
    wait(NULL);                // 3. wait for the child to finish
}
```

`fork()` **returns twice**: **0 in the child**, and the **child's pid in the parent**. That return value is how the code above knows which branch it's in.

**What `exec()` does (slide 3.30):**
- **Code replacement**: the current process's code, data, heap, and stack are **discarded**.
- **A new program is loaded**: execution starts from its entry point.
- **Same PID**: the process ID **stays the same**, and everything else is replaced.
- **No return**: if it succeeds, `exec()` **never returns**. If it fails (for example, file not found), it **returns −1** and sets `errno`.

`vfork()` is a variant of `fork()` with a different memory-handling strategy.

## 10. Process termination (slides 3.31–3.39)

**Normal exit:**
- The process executes its last statement and asks the OS to delete it, with **`exit()`**.
- It **returns status data from the child to the parent**, which receives it through `wait()`.
- The OS **deallocates the process's resources**.

**Killed by its parent:** a parent can end a child with **`abort()`**. Three reasons:
1. The child has **exceeded its allocated resources**.
2. The **task** assigned to the child is **no longer required**.
3. The **parent is exiting**, and the OS doesn't allow a child to continue without its parent.

**Cascading termination.** Some OSes don't allow a child to exist after its parent has terminated. **All children, grandchildren, etc. are terminated**, and the **OS initiates** it.

**`wait()`.** The parent waits for a child to terminate with `pid = wait(&status);`. It returns the **status information and the pid** of the terminated child.

### Zombies and orphans

- **Zombie**: a child that has terminated, but whose **parent hasn't called `wait()` yet**.
- **Orphan**: a child whose **parent terminated without calling `wait()`**, while the child was still running.

**The zombie, in detail (slide 3.33):**
1. When a process exits, **its memory and resources are freed**, but **its entry in the process table remains**.
2. When the parent calls `wait()`, it reads the child's exit status and **the zombie is removed**. Its PID and table entry can then be reused.
3. If the parent **never** calls `wait()`, the zombie stays in the table, which is a **resource leak**.

**The orphan, in detail (slide 3.34):** in UNIX, when a parent terminates, its children **don't die**. Instead:
- **`init` (PID 1)**, or **`systemd`** on modern Linux, **adopts** the orphan.
- So the child keeps running and is still cleaned up properly when it exits.

| | **Zombie** | **Orphan** |
| --- | --- | --- |
| Definition | Has **terminated** but **still has an entry** in the process table | Its **parent terminated** while it is **still running** |
| Cause | The parent **didn't call `wait()`** to collect the exit status | The parent **exited before the child** finished |
| State | **Not running**, just a record in the process table | **Actively running** |
| Resources | **No CPU or memory**, but **keeps its PID** | Uses CPU and memory normally |
| Cleanup | Removed when the parent **calls `wait()`** | **Adopted by `init`/`systemd`** |
| Risk | Too many zombies can **exhaust the PID space** | Safe unless mismanaged |

**The orphan example (slide 3.35):**
- The parent calls `exit(0)` immediately, while the child does `sleep(10)`.
- The child becomes an **orphan**, is adopted by `init`/`systemd`, and still prints "Child still running" ten seconds later.

### UNIX vs Windows (slides 3.37–3.39)

| Feature | **UNIX** | **Windows** |
| --- | --- | --- |
| Zombie handling | **Manual**, via `wait()` | **Automatic** cleanup |
| Orphan handling | **Re-parented** by `init`/`systemd` | **Runs independently** |
| Process hierarchy | **Enforced** via reaping | **Logical only** |
| Developer control | **High** (manual cleanup) | **Moderate** (job objects optional) |
| Good for | Servers, daemons, scripting | GUI apps, services, automation |

**Advantages of UNIX's approach:**
- **Explicit control over cleanup.** Requiring `wait()` gives developers fine-grained control over a child's lifecycle and exit status.
- **Efficient resource management.** A zombie is a signal that the parent hasn't acknowledged the child's termination, which is useful for debugging and auditing.
- **Robust service management.** `systemd` re-parents orphans and enforces cleanup policies, which suits daemons and background jobs.

**Advantages of Windows' approach:**
- **A simpler process model.** There's no need to reap children, because Windows cleans up terminated processes automatically.
- **Independent children.** A child can outlive its parent without re-parenting, which is simpler for long-running tasks and GUI apps.
- **Optional control through job objects.** Processes can be grouped, and cascading termination enforced only when it's needed.

## 11. Multiprocess architecture: Chrome (slide 3.40)

Many browsers ran as a **single process**, so **one misbehaving website could hang or crash the whole browser**. Chrome is **multiprocess**, with **3 types of processes**:

| Process | Job |
| --- | --- |
| **Browser** | Manages the **user interface**, and **disk and network I/O** |
| **Renderer** | **Renders web pages** (HTML, JavaScript). **A new one for each website** opened. It runs in a **sandbox** that restricts disk and network I/O, **minimizing the effect of security exploits** |
| **Plug-in** | **One for each type** of plug-in |

## 12. Interprocess communication (slides 3.41–3.44)

| **Independent process** | **Cooperating process** |
| --- | --- |
| **Cannot affect or be affected** by other processes | **Can affect or be affected** by other processes, including by **sharing data** |

**Four reasons for cooperating processes** (memory aid: "**I C M C**"):
1. **Information sharing.** Several processes need the same data.
2. **Computation speed-up.** A task is split into parts that run in parallel ([[14-cores-threads-concurrency|parallelism]]).
3. **Modularity.** The system is built as separate cooperating processes.
4. **Convenience.** A user does several things at once, such as editing, printing, and compiling.

Cooperating processes need **interprocess communication (IPC)**. There are **two models**:

<svg viewBox="0 0 700 300" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="The two IPC models. (a) Message passing: process A sends a message into a message queue in the kernel, and process B receives it. (b) Shared memory: processes A and B both read and write a shared memory region; the kernel is only involved in setting it up." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q4-ipc-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q4-ipc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<rect x="30" y="30" width="120" height="40" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="90.0" y="55.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">process A</text>
<rect x="190" y="30" width="120" height="40" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="250.0" y="55.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">process B</text>
<rect x="20" y="150" width="300" height="90" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="170.0" y="230.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-weight:600">kernel</text>
<rect x="50" y="170" width="40" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="70.0" y="190.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">m₀</text>
<rect x="90" y="170" width="40" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="110.0" y="190.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">m₁</text>
<rect x="130" y="170" width="40" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="150.0" y="190.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">m₂</text>
<rect x="170" y="170" width="40" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="190.0" y="190.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">m₃</text>
<rect x="210" y="170" width="40" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="230.0" y="190.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">…</text>
<rect x="250" y="170" width="40" height="32" rx="0" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="270.0" y="190.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">mₙ</text>
<path d="M90,72 V167" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-ipc-m)"/>
<path d="M250,167 V73" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-ipc-m)"/>
<text x="70.0" y="125.0" text-anchor="end" style="fill:var(--text-muted, #777);font-size:12px">send</text>
<text x="270.0" y="125.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">receive</text>
<text x="170.0" y="280.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">(a) message passing</text>
<rect x="400" y="20" width="260" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="530.0" y="43.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">process A</text>
<rect x="400" y="78" width="260" height="44" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="530.0" y="105.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">shared memory</text>
<rect x="400" y="144" width="260" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="530.0" y="167.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">process B</text>
<rect x="400" y="200" width="260" height="40" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="530.0" y="225.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-weight:600">kernel</text>
<path d="M530,58 V75" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-ipc-m)" marker-start="url(#q4-ipc-m)"/>
<path d="M530,124 V141" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q4-ipc-m)" marker-start="url(#q4-ipc-m)"/>
<text x="530.0" y="280.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">(b) shared memory</text>
</svg>

| | **Message passing** | **Shared memory** |
| --- | --- | --- |
| How | Processes **send and receive messages**, through the kernel | Processes **read and write a shared region** of memory |
| Who controls it | **The OS** | **The user processes**, not the OS (slide 3.48) |
| Speed | Slower: a system call per message | **Faster**: the kernel is only involved in setting up the region |
| Main issue | — | The processes must **synchronize** their access (chapter 5) |
| Good for | Smaller amounts of data, and communication between computers | Large amounts of data on one machine |

The textbook rows above (speed, "good for") add to the slides. Chapter 2 introduced the same two models ([[chapter-2-summary|Chapter 2 Summary]] §3).

### The producer–consumer problem (slide 3.44)

This is the classic **paradigm for cooperating processes**: a **producer** process **produces information** that a **consumer** process **consumes**.
- With an **unbounded buffer**, there is **no practical limit** on the buffer's size.
- With a **bounded buffer**, the buffer has a **fixed size**.

> [!note]- ⚑ Slides 3.45–3.48, only if the range goes to 48: the bounded buffer in shared memory
> **The shared data:** `item buffer[BUFFER_SIZE];` (with `BUFFER_SIZE` = 10), and two indices.
> - **`in`** is the next free slot.
> - **`out`** is the next full slot.
>
> **Producer:** `while (((in + 1) % BUFFER_SIZE) == out) ;` busy-waits while the buffer is full. Then `buffer[in] = next_produced; in = (in + 1) % BUFFER_SIZE;`.
>
> **Consumer:** `while (in == out) ;` busy-waits while the buffer is empty. Then `next_consumed = buffer[out]; out = (out + 1) % BUFFER_SIZE;`.
>
> **The catch:** the solution is correct, but it can only use **`BUFFER_SIZE − 1`** slots, which is 9 of 10. "Empty" is `in == out`, and "full" is `(in + 1) % BUFFER_SIZE == out`. If all 10 slots could fill, `in` would come back around to equal `out`, and a full buffer would look exactly like an empty one. So one slot is always left unused.
>
> **Shared memory (slide 3.48):**
> - It is an area of memory **shared among the processes that wish to communicate**.
> - Communication is **under the control of the user processes, not the OS**.
> - The major issue is giving the processes a way to **synchronize their actions** when they access the shared memory (chapter 5).

## Likely quiz questions and 5-minute answers

The first one is last year's exact question. The others are ranked by how likely they seem.

> [!question]- 1. "Explain the context switch. What does the PCB contain?" (last year's Quiz 4)
> **Context switch:** when the CPU switches from one process to another (on an interrupt or system call), the OS **saves the state of the running process into its PCB** and **loads the saved state of the next process from its PCB**. The next process then continues exactly where it left off. Context-switch time is **pure overhead**, because no useful work is done during it. It is longer for a more complex OS or PCB, and shorter with hardware support, such as multiple register sets.
> **PCB (7 fields):** process state · program counter · CPU registers · CPU-scheduling information (priority, queue pointers) · memory-management information · accounting information (CPU time used, time limits) · I/O status information (allocated devices, open files).

> [!question]- 2. "Draw and explain the process state diagram."
> Draw the 5 states: **new, ready, running, waiting, terminated**.
> - new → ready: **admitted**.
> - ready → running: **scheduler dispatch**.
> - running → ready: **interrupt** (for example, the time slice ends).
> - running → waiting: **I/O or event wait**.
> - waiting → ready: **I/O or event completion**.
> - running → terminated: **exit**.
>
> Add that only one process runs on a CPU at a time, and that a waiting process goes back to *ready*, not straight to running.

> [!question]- 3. "Explain the short-term, long-term and medium-term schedulers."
> **Short-term (CPU) scheduler:** picks which ready process runs next. Runs every few milliseconds, so it must be fast.
> **Long-term (job) scheduler:** picks which processes enter the ready queue. Runs rarely (seconds or minutes), controls the **degree of multiprogramming**, and aims for a good mix of **I/O-bound** processes (many short CPU bursts) and **CPU-bound** processes (few long bursts).
> **Medium-term scheduler:** reduces the degree of multiprogramming by **swapping**: it removes a process from memory to disk, and later swaps it back in to continue.

> [!question]- 4. "What is the difference between a zombie and an orphan process?"
> **Zombie:** the child has terminated, but the parent **hasn't called `wait()`**. Its resources are freed, but its **process-table entry and PID remain**. It's removed when the parent calls `wait()`. Too many zombies can exhaust the PIDs.
> **Orphan:** the **parent terminated** while the child is **still running**. In UNIX it's **adopted by `init` (PID 1) or `systemd`**, which later cleans it up. Some systems use **cascading termination** instead and kill the children.

> [!question]- 5. "Explain process creation in UNIX (fork and exec)."
> A parent creates children with **`fork()`**, forming a tree of processes, each identified by a **pid**. `fork()` **duplicates** the calling process; the child gets a copy of the parent's address space. `fork()` returns **0 to the child** and **the child's pid to the parent**. The child usually calls **`exec()`**, which **replaces its memory with a new program**: same PID, everything else discarded, and it never returns on success. The parent can run concurrently or **`wait()`** for the child.
> **Options:** resource sharing (all, a subset, or none), execution (concurrent, or the parent waits), address space (a duplicate, or a new program).

> [!question]- 6. "Describe the parts of a process in memory." or "Stack vs heap?"
> From address 0 up: **text** (code), **data** (global variables), **heap** (dynamic, run-time allocations, growing upwards), free space, and **stack** (parameters, return addresses, local variables, growing downwards). The process also has the **program counter and registers**.
> **Stack:** LIFO, automatic, fast, limited (stack overflow). **Heap:** any order, manual (`malloc`/`free`) or garbage-collected, slower, larger, can fragment.

> [!question]- 7. "Why do processes cooperate? What are the two IPC models?"
> **Four reasons:** information sharing, computation speed-up, modularity, convenience.
> **Two models:**
> - **Message passing**: send and receive through the kernel. Easier, works between computers, slower.
> - **Shared memory**: a common memory region controlled by the processes. Fast, but they must synchronize.

> [!question]- 8. "Why is Chrome multiprocess?"
> In a single-process browser, one bad website can crash everything. Chrome has three kinds of process:
> - a **browser** process (UI, disk and network I/O);
> - a **renderer per website** (HTML and JavaScript, running in a **sandbox** that limits disk and network access, so exploits do less damage);
> - a **plug-in** process per plug-in type.
>
> A crash or exploit stays inside one renderer.

> [!question]- 9. "When can a parent terminate a child? What is cascading termination?"
> **With `abort()`**, when the child has **exceeded its allocated resources**, when its **task is no longer needed**, or when the **parent is exiting** and the OS doesn't let children outlive their parent.
> **Cascading termination** is that last case: when a process ends, the **OS** terminates all its children, grandchildren, and so on.

> [!question]- 10. "Why can the bounded buffer only hold BUFFER_SIZE − 1 items?" (⚑ only if the range is 1–48)
> "Empty" is `in == out`. If the buffer could fill completely, `in` would wrap around to equal `out` again, and a full buffer would be indistinguishable from an empty one. So "full" is defined as `(in + 1) % BUFFER_SIZE == out`, which leaves one slot unused.

> [!tip] How to write the answer
> - **Name the parts with their counts:** 5 states, 7 PCB fields, 3 queues, 3 schedulers, 4 reasons to cooperate, 2 IPC models.
> - **Draw the state diagram** whenever states come up. It takes 30 seconds and shows everything at once.
> - **Use a two-column table for "difference" questions**: zombie vs orphan, program vs process, stack vs heap, I/O-bound vs CPU-bound.

## Numbers and keywords to memorize

| | |
| --- | --- |
| Process parts | text, data, heap, stack, + PC and registers |
| States | **5**: new, ready, running, waiting, terminated |
| PCB fields | **7**: state, PC, registers, scheduling, memory, accounting, I/O |
| Linux PCB | `task_struct` |
| Queues | **3**: job, ready, device |
| Schedulers | **3**: short-term (ms, fast), long-term (s/min, degree of multiprogramming), medium-term (swapping) |
| `fork()` returns | **0** in the child, the **child's pid** in the parent |
| `exec()` | Same PID, new program, **no return** on success (**−1** on failure) |
| `abort()` reasons | **3** |
| Zombie / orphan | Terminated but not `wait()`ed / parent died first, adopted by `init` (PID 1) |
| Chrome process types | **3**: browser, renderer, plug-in |
| Reasons to cooperate | **4**: information sharing, speed-up, modularity, convenience |
| IPC models | **2**: shared memory, message passing |
| Bounded buffer (⚑) | Holds **BUFFER_SIZE − 1** items |
