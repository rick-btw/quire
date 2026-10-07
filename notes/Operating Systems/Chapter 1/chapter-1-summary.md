---
title: "Chapter 1 Summary"
description: Quiz-prep summary of Silberschatz chapter 1. Covers the boot process, interrupts, storage, multiprocessors, and dual-mode operation.
tags: [operating-systems, quiz-prep]
---
# Chapter 1 Summary

Source: the chapter 1 slides for *Operating System Concepts* (Silberschatz, 9th ed.). The full notes start at [[00-overview|Chapter 1 overview]].

> [!warning] Last year's Quiz 1 was a single question: **"The boot process"** (فرآیند بوت شدن)
> A numbered 7-step answer with the MBR byte sizes got full marks. Know [the boot process](#2-the-boot-process) cold, then interrupts, dual mode, and multiprocessors.

## 1. What an operating system is

An OS is **a program that acts as an intermediary between the user and the computer hardware**.

**Three goals:**
1. Execute user programs and make solving user problems easier.
2. Make the computer system **convenient** to use.
3. Use the hardware **efficiently**.

**Four components of a computer system:** hardware (CPU, memory, I/O) → **OS** (controls and coordinates hardware use) → application programs (compilers, browsers, games) → users (people, machines, other computers).

**Two definitions of the OS:**
- **Resource allocator**: manages all resources and settles conflicting requests efficiently and fairly.
- **Control program**: controls program execution to prevent errors and improper use.

**Kernel**: *"the one program running at all times on the computer."* Everything else is either a **system program** (ships with the OS) or an **application program**. There is no universally accepted definition of an OS.

What the OS should optimize depends on the point of view. Users want convenience and performance. Shared mainframes must keep every user happy. Handhelds are optimized for usability and battery life. Embedded systems have little or no UI.

## 2. The boot process

### Key terms

| Term | Meaning |
| --- | --- |
| **Firmware** | Software embedded directly in a piece of hardware to control its basic operations |
| **Bootstrap program** | Loaded at power-up or reboot. Stored in **ROM/EPROM** (firmware). Initializes the system, then loads the kernel and starts it |
| **BIOS** | *Basic Input/Output System*. Firmware on the motherboard that initializes hardware during boot and provides runtime services |
| **MBR** | *Master Boot Record*. The **first sector (sector 0)** of the disk, **512 bytes**. Holds the boot code and the partition table |
| **Bootloader** | Vendor-specific image that brings up the kernel. The code in the MBR is a boot loader |
| **GRUB** | *GNU GRand Unified Bootloader*. Linux's bootloader |

### The steps (memorize these)

1. **Power on.**
2. The **CPU** starts and looks in **ROM** (or EPROM).
3. It finds the **BIOS** (firmware) and runs it.
4. The BIOS **initializes the hardware** (the bootstrap loader runs).
5. The BIOS finds the primary bootable device and reads its **MBR** (sector 0, 512 bytes).
6. The MBR is copied into memory at address **`0x7C00`**, and its boot code (**GRUB** stage 1) runs.
7. GRUB uses the partition info to find the **kernel**, loads it into memory, and starts it.
8. The **OS is running**.

> [!tip] Short version for the exam
> Power on → CPU reads ROM → **BIOS** runs and initializes hardware → BIOS loads the **MBR** (512 B = 446 B boot code + 64 B partition table + 2 B signature) → MBR code hands control to the **bootloader (GRUB)** → GRUB loads the **kernel** → OS starts.

> [!note] The slide says "physical disk 0x7c00"
> `0x7C00` is a **memory (RAM) address**, not a disk location. If you mention it, call it a memory address.

### Inside the MBR (512 bytes)

| Part | Size |
| --- | --- |
| Boot code (GRUB stage 1, `boot.img`) | **446 B** |
| Partition table: **4 entries × 16 B** | **64 B** |
| Magic number / boot signature (`0x55AA`) | **2 B** |

446 + 64 + 2 = **512**. Four 16-byte entries is why MBR allows only **4 primary partitions**.

The bootstrap code must be **small** because it has to fit in a **single sector**.

### GRUB's stages

GRUB is too big for 446 bytes, so it is **split into stages**:

| Stage | File | Where | Job |
| --- | --- | --- | --- |
| 1 | `boot.img` (446 B) | MBR, sector 0 | Points (by LBA) to stage 1.5 or 2 |
| 1.5 | `core.img` (32,256 B) | Empty sectors 1–62 | Contains **file-system drivers** so it can find stage 2 by path |
| 2 | `/boot/grub` | A normal partition | Shows the boot menu, loads the kernel |

There are two ways a bootloader can find the kernel:
1. Read **raw disk sectors** at hardcoded locations without understanding the file system.
2. **Understand the file system** and open the kernel by its file path. This needs a driver per file system, but there are no hardcoded sectors or map files, and the MBR doesn't need updating when kernels move.

**GRUB uses approach 2.**

### MBR vs GPT, BIOS vs UEFI

| | MBR | GPT |
| --- | --- | --- |
| Full name | Master Boot Record | GUID Partition Table |
| Partitions | 4 primary (16 B entries) | 128 entries (128 B each) |
| Addressing | **32-bit LBA** × 512 B sectors → max **2 TiB** | 64-bit LBA, uses **GUIDs/UUIDs** |
| Firmware | BIOS | Part of the **UEFI** standard (also usable with some BIOSes) |

GPT exists because of MBR's limits: $2^{32} \times 512\ \text{B} = 2\ \text{TiB}$.

- **UEFI** (*Unified Extensible Firmware Interface*) is the modern replacement for BIOS.
- **CSM** (*Compatibility Support Module*) lets UEFI boot old BIOS-style disks. "UEFI with CSM" is mixed mode, offering both kinds of boot entries. **Disabling CSM** enables UEFI-only features such as **fast boot** but blocks BIOS-only features.

**Disk geometry:** a disk surface is divided into **tracks** (rings). Tracks are divided into **sectors**, and a **cluster** is a group of sectors.

## 3. Interrupts and I/O

**Organization:** one or more CPUs and **device controllers** share memory over a common **bus**. Each controller handles one device type and has a **local buffer**. The CPU moves data between main memory and those buffers, and the **controller raises an interrupt** when it finishes.

### Interrupts

- An interrupt transfers control to the **interrupt service routine** through the **interrupt vector**, a table of ISR addresses.
- The **address of the interrupted instruction** must be saved, along with the registers and program counter.
- A **trap / exception** is a **software-generated interrupt**, caused by an error or by a user request (a system call).
- **An OS is interrupt driven.**
- There are two ways to tell which interrupt occurred: **polling** (ask each device) or a **vectored** interrupt system (the device supplies an index into the vector).
- CPUs have two interrupt lines: **non-maskable** (critical errors, can't be ignored) and **maskable** (can be turned off temporarily).
- **Priority levels** let the CPU defer low-priority interrupts, and let a high-priority interrupt preempt a low-priority one.

### Interrupt-driven I/O cycle

1. The device driver initiates I/O.
2. The controller starts the I/O.
3. The CPU keeps working, checking for interrupts between instructions.
4. The controller finishes (input ready, output done, or error) and **signals an interrupt**.
5. The CPU receives it and jumps to the **interrupt handler**.
6. The handler processes the data and returns.
7. The CPU **resumes** the interrupted task.

### Two styles of I/O

| Synchronous | Asynchronous |
| --- | --- |
| Control returns to the user program **only after the I/O completes** | Control returns **without waiting** for the I/O |
| CPU idles (wait instruction or wait loop) | The program can make a **system call** to wait if it needs to |
| At most **one** outstanding I/O request | Many requests at once, tracked in the **device-status table** (type, address, state per device) |

### DMA (Direct Memory Access)

DMA is used for **high-speed devices**. The controller moves a **whole block** between its buffer and main memory **without the CPU**, so there is **one interrupt per block instead of one per byte**.

## 4. Storage

- **Bit** → **byte** = 8 bits (the smallest convenient unit) → **word**, the architecture's native unit (64-bit registers give 8-byte words).
- 1 KB = **1024** B, MB = $1024^2$, GB = $1024^3$, and so on. Networking is measured in **bits**.
- **Main memory**: the only large storage the CPU accesses **directly**. Random access, **volatile**.
- **Secondary storage**: large and **non-volatile**. Includes HDDs (platters → tracks → sectors) and **SSDs** (faster, non-volatile).

**Hierarchy, from fast/small/expensive/volatile down to slow/large/cheap/non-volatile:**
registers → cache → main memory → SSD → hard disk → optical disk → magnetic tape.

**Caching** copies data in use from slower to faster storage. The faster storage is checked first: a **hit** uses the data directly, a **miss** copies it into the cache. The cache is smaller than what it caches, so the design problems are **cache size and replacement policy**. Main memory acts as a cache for secondary storage.

**Device driver**: one per device controller. It gives the kernel a **uniform interface** to the controller.

## 5. Computer-system architecture

**Multiprocessor systems** are also called **parallel** or **tightly-coupled** systems. Three advantages:
1. **Increased throughput**
2. **Economy of scale** (shared peripherals, storage, power)
3. **Increased reliability**: graceful degradation, fault tolerance

| Asymmetric multiprocessing | Symmetric multiprocessing (SMP) |
| --- | --- |
| Each processor gets a **specific task** | **Every processor performs all tasks** |
| | Each CPU has its own registers and cache, and they share memory |

**Core vs thread:** a **core** is a *physical* unit that executes instructions independently. A **thread** is a *logical software* unit that runs on a core.

**Multicore vs multiprocessor:** multicore means **one CPU chip with several cores**, while multiprocessor means **several CPUs**. Multicore is the choice for running a single program faster.

**Concurrent vs parallel:**
- **Concurrent**: two or more actions *in progress* at the same time (they can be interleaved on one core).
- **Parallel**: two or more actions *executing simultaneously* (needs multiple cores or CPUs).

**Clustered systems:** multiple *whole systems* work together, usually sharing storage over a **SAN** (storage-area network).
- They provide **high availability**: the service survives failures.
- **Asymmetric** clustering keeps one machine in **hot-standby**. **Symmetric** clustering has all nodes running apps and monitoring each other.
- **HPC** clusters need apps written for parallelism. A **DLM** (distributed lock manager) prevents conflicting operations.

## 6. OS structure and operations

| Multiprogramming (batch) | Timesharing (multitasking) |
| --- | --- |
| Goal: **efficiency**, keeping the CPU always busy | Goal: **interactivity** |
| Several jobs in memory, one chosen by **job scheduling** | The CPU switches jobs **so often** that users can interact with each one |
| Switches when a job **waits** (e.g. for I/O) | **Response time < 1 second** |
| | Needs **CPU scheduling**, **swapping**, and **virtual memory** (run processes not entirely in memory) |

Timesharing is the **logical extension** of multiprogramming. A program loaded in memory and executing is a **process**.

### Dual-mode operation

- There are two modes, **user mode** and **kernel mode**, distinguished by a **mode bit** provided by the hardware (in the textbook, kernel = 0 and user = 1).
- **Privileged instructions** run only in kernel mode.
- A **system call** switches to kernel mode, and the return switches back to user mode.
- Purpose: the OS **protects itself** and other components from user code.
- Modern CPUs support **multi-mode** operation, for example a **VMM** mode for guest virtual machines.

**Software interrupts (traps)** come from software errors (division by zero) or requests for OS service. Other problems the OS must handle include infinite loops and processes modifying each other or the OS.

### Timer

The timer prevents infinite loops and processes **hogging** the CPU.
- The OS sets a counter, which is a **privileged** instruction.
- The physical clock decrements the counter, and **an interrupt fires at zero**.
- The OS sets it before scheduling a process so it can **regain control** or terminate a process that runs too long.

## Numbers and keywords to memorize

| | |
| --- | --- |
| MBR | sector 0, **512 B** = **446** code + **64** table (4 × **16**) + **2** signature |
| MBR loaded at | memory address **`0x7C00`** |
| GRUB `core.img` | **32,256 B**, sectors 1–62 |
| MBR limit | 32-bit LBA → **2 TiB**, **4** primary partitions |
| GPT | **128** entries × **128 B**, GUIDs, UEFI |
| Timesharing response | **< 1 s** |
| DMA | **1 interrupt per block** |
| 1 KB | **1024 B** |

> [!tip] How to write a one-question answer
> - Answer in **numbered steps** or a **two-column comparison**. It's fast to grade and easy to get full marks.
> - **Define every acronym once**: BIOS, MBR, GRUB, UEFI, DMA, SMP.
> - **Throw in the numbers** (512 / 446 / 64). They show precision and are what set last year's full-mark answer apart.
> - If the question is a comparison (e.g. multiprogramming vs timesharing), give the **goal**, the **mechanism**, and an **example** for each side.

## Self-test

> [!question]- What are the steps of the boot process?
> Power on → CPU looks in ROM → BIOS runs and initializes hardware → BIOS reads the MBR (sector 0) → MBR is loaded at `0x7C00` and its bootloader code runs → GRUB finds and loads the kernel → OS runs.

> [!question]- What is in the MBR, and why is the boot code so small?
> 446 B boot code, 64 B partition table (4 × 16 B), and a 2 B signature, 512 B in total. It has to fit in one sector.

> [!question]- Why does GRUB have stages?
> Its full code can't fit in the 446 bytes of the MBR. Stage 1 (`boot.img`) points to stage 1.5 (`core.img`, which has file-system drivers), and that loads stage 2 (`/boot/grub`), which loads the kernel.

> [!question]- Why was GPT introduced?
> MBR uses 32-bit LBA with 512 B sectors, giving a 2 TiB maximum, and has only 4 primary partitions. GPT uses GUIDs, holds 128 entries, and is part of UEFI.

> [!question]- What is the difference between a trap and an interrupt?
> An interrupt is hardware-generated, by a device. A trap or exception is software-generated, caused by an error or a system-call request.

> [!question]- Why use DMA?
> High-speed devices would otherwise cause one interrupt per byte. DMA transfers a whole block straight to memory with one interrupt per block, without CPU involvement.

> [!question]- What is the difference between symmetric and asymmetric multiprocessing?
> In SMP every processor does all tasks. In asymmetric multiprocessing each processor gets a specific task.

> [!question]- What is the difference between multicore and multiprocessor?
> Multicore is one CPU with several cores. Multiprocessor is several CPUs.

> [!question]- What is the difference between concurrent and parallel?
> Concurrent means several actions are in progress at once. Parallel means they execute at the same instant.

> [!question]- Why does the OS need dual mode and a timer?
> Dual mode lets the OS protect itself: privileged instructions run only in kernel mode. The timer lets the OS regain control from a process that loops forever.
