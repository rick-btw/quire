---
title: "Chapter 2 Practice Exercises"
description: Answers to the chapter 2 practice exercises (2.1–2.11) of Silberschatz 9th ed., sized for a 5-minute quiz, with where each topic appears in the slides, the notes, and past quizzes.
tags: [operating-systems, quiz-prep, practice]
---
# Chapter 2 Practice Exercises

Answers to the **Practice Exercises 2.1–2.11** at the end of chapter 2 of *Operating System Concepts* (9th ed.). Every answer is sized for a **5-minute quiz**: short numbered points you can write from memory in about 3–4 minutes. Study notes: [[chapter-2-summary|Chapter 2 Summary]].

## Which ones matter for which quiz

| # | Topic | Slides (71-slide deck) | In the notes | Past quizzes |
| --- | --- | --- | --- | --- |
| 2.1 | Purpose of system calls | ✅ 2.15–2.21 (Quiz 2) | Summary §3 | — |
| 2.2 | Process-management activities | ❌ Textbook §1.6, skipped by the slides | — | — |
| 2.3 | Memory-management activities | ❌ Textbook §1.7, skipped by the slides | — | — |
| 2.4 | Secondary-storage activities | ❌ Textbook §1.8, skipped by the slides | — | — |
| 2.5 | Command interpreter | ✅ 2.8 (Quiz 2) | Summary §2 (purpose only; "why separate" is new here) | Quiz 2 mentioned the CLI, as one of the UI types |
| 2.6 | System calls to start a process | ✅ 2.31 (Quiz 2) | Summary §3 (the FreeBSD example) | — |
| 2.7 | Purpose of system programs | ✅ 2.33–2.40 (Quiz 2) | Summary §4 | — |
| 2.8 | Layered approach: pros and cons | ✅ 2.61 (**Quiz 3**) | [[chapter-2-quiz-3]] §4 | **Quiz 3** described the layered approach |
| 2.9 | Five services | ✅ 2.4–2.7 (Quiz 2) | Summary §1 | **Quiz 2 asked exactly this topic** |
| 2.10 | OS in firmware vs on disk | ✅ 2.70 (**Quiz 3**), plus the chapter 1 boot slides | [[chapter-2-quiz-3]] §8, [[02-boot-process]], [[03-bios-and-uefi]] | Related to **Quiz 1** (boot process) |
| 2.11 | Choosing which OS to boot | ✅ 2.70 (**Quiz 3**), plus the chapter 1 GRUB slides (1.19–1.22) | [[chapter-2-quiz-3]] §8, [[06-grub]] | Related to **Quiz 1** |

> [!tip] Priority for Quiz 2
> 1. **2.9** (the services, which is last year's Quiz 2 topic)
> 2. **2.1** (system calls)
> 3. **2.7** (system programs)
> 4. **2.6** (`fork`/`exec`)
> 5. **2.5** (command interpreter)
>
> Those five are all in Quiz 2's range. 2.2–2.4 are three quick lists worth memorizing for the midterm, but they aren't in the lecturer's slides.

> [!tip] Priority for Quiz 3
> **2.8** (layered approach), then **2.10** and **2.11** (boot). All three are in slides 2.48–2.71.

---

## 2.1 What is the purpose of system calls?

**Notes:** [[chapter-2-summary|Summary §3]] · **Past quiz:** no · **Slides:** 2.15–2.21

**Answer:**
System calls are the **interface between a running program and the operating system**. They are how a program **requests a service from the kernel**.

1. User programs run in **user mode**. They can't execute privileged instructions or access the hardware directly.
2. When a program needs something only the OS can do, it makes a **system call**. Examples are I/O, opening a file, creating a process, and allocating memory.
3. The call **traps into kernel mode**. The OS performs the service and **returns the result**, then switches back to user mode.
4. This gives programs access to OS services **while keeping the OS in control** of the hardware (protection).

*Example:* `open()`, `read()`, `fork()`. Programs usually reach them through an **API** (POSIX, Win32, Java).

---

## 2.2 What are the five major activities of an OS with regard to process management?

**Notes:** not in the slides (textbook §1.6) · **Past quiz:** no

**Answer:**
1. **Scheduling** processes and threads on the CPUs.
2. **Creating and deleting** both user and system processes.
3. **Suspending and resuming** processes.
4. Providing mechanisms for process **synchronization**.
5. Providing mechanisms for process **communication**.

> [!tip] Memory aid
> **Schedule, Create/delete, Suspend/resume, Synchronize, Communicate.**

---

## 2.3 What are the three major activities of an OS with regard to memory management?

**Notes:** not in the slides (textbook §1.7) · **Past quiz:** no

**Answer:**
1. **Keeping track** of which parts of memory are currently in use, and **by whom**.
2. **Deciding which processes** (or parts of processes) and data to **move into and out of memory**.
3. **Allocating and deallocating** memory space as needed.

> [!tip] Memory aid
> **Track → decide → allocate.**

---

## 2.4 What are the three major activities of an OS with regard to secondary-storage management?

**Notes:** not in the slides (textbook §1.8.2) · **Past quiz:** no

**Answer:**
1. **Free-space management**: keeping track of which disk blocks are unused.
2. **Storage allocation**: assigning disk space to files as they need it.
3. **Disk scheduling**: choosing the order in which pending disk requests are served, so the disk is used efficiently.

*Why it matters:* programs are kept on disk until they're loaded, and they constantly read and write it. The speed of the whole computer can depend on the disk subsystem.

---

## 2.5 What is the purpose of the command interpreter? Why is it usually separate from the kernel?

**Notes:** [[chapter-2-summary|Summary §2]] (purpose only) · **Past quiz:** Quiz 2 mentioned the CLI as a UI type · **Slides:** 2.8

**Answer:**
**Purpose:** it is the user's interface to the OS. It **reads the next command from the user and executes it**. Some commands it runs with its own code, which makes the right system calls. For others it **loads and runs the program named by the command** (e.g. `rm` in UNIX).

**Why separate from the kernel:**
1. **It changes often, and users want a choice.** There are many shells (sh, bash, zsh, …), and each user can pick or replace one **without changing the kernel**.
2. **New commands can be added easily.** When commands are separate programs, adding one doesn't require modifying the shell, let alone the kernel.
3. **It keeps the kernel small and safe.** The shell doesn't need kernel privileges, because it uses system calls like any other program. A bug in the shell crashes only the shell, not the OS.

---

## 2.6 What system calls must a command interpreter or shell execute to start a new process?

**Notes:** [[chapter-2-summary|Summary §3]] (the FreeBSD example) · **Past quiz:** no · **Slides:** 2.31

**Answer:**
1. **`fork()`**: creates a new process, a copy of the shell (the child).
2. **`exec()`**: the child loads the new program into its memory, replacing the shell's copy, and starts running it.
3. **`wait()`**: the shell (the parent) waits for the child to terminate. It skips this if the program runs in the background, and goes straight back to reading commands.

When the program finishes, it calls **`exit()`** with a status: **0 = no error**, **> 0 = an error code**. The shell gets this status from `wait()`.

*On Windows:* `CreateProcess()` does the creating and loading in one call, and `WaitForSingleObject()` waits.

---

## 2.7 What is the purpose of system programs?

**Notes:** [[chapter-2-summary|Summary §4]] · **Past quiz:** no · **Slides:** 2.33–2.40

**Answer:**
System programs provide **a convenient environment for program development and execution**.

1. They sit **between the OS and application programs**. Many are simply **user interfaces to system calls** (`ls`, `cp`, `mkdir`), so users can use OS services **without writing programs** of their own. Others are more complex, such as compilers and loaders.
2. **Most users' view of the OS is defined by the system programs, not by the system calls.**
3. **Categories:**
   - file management
   - status information
   - file modification
   - programming-language support
   - program loading and execution
   - communications
   - background services (daemons)

---

## 2.8 What is the main advantage of the layered approach? What are its disadvantages?

**Notes:** [[chapter-2-quiz-3|Quiz 3 note §4]] · **Past quiz:** Quiz 3 described the layered approach · **Slides:** 2.61 (Quiz 3 range)

**Answer:**
In the layered approach, the OS is divided into layers. **Layer 0 is the hardware, layer N is the user interface**, and each layer uses only the layers below it.

**Main advantage: simplicity of construction and debugging.**
- Layer 1 can be debugged using only the hardware, which is assumed correct. Then layer 2 can be debugged assuming layer 1 works, and so on.
- If an error shows up while debugging a layer, **it must be in that layer**, because everything below it is already verified.
- Each layer hides its data structures and implementation from the layers above (information hiding).

**Disadvantages:**
1. **The layers are hard to define.** Because a layer may only use lower layers, the order needs careful planning, and some dependencies conflict. For example, the disk driver for virtual memory must be below memory management, but where should it go relative to the CPU scheduler?
2. **It is less efficient.** A request passes down through many layers, each adding overhead (passing and modifying parameters), so a system call takes **longer** than in a non-layered OS.

---

## 2.9 List five services provided by an OS and explain how each creates convenience for users. In which cases would it be impossible for user-level programs to provide these services?

**Notes:** [[chapter-2-summary|Summary §1]] · **Past quiz: Quiz 2 (the services)**, the same topic as the first half · **Slides:** 2.4–2.7

**Answer:**
For each service: **+** is the convenience, and **✗** is why a user-level program couldn't provide it.

1. **Program execution.**
   **+** The user just names a program, and the OS loads it into memory, runs it, and ends it (normally or with an error).
   **✗** Loading and running a program means giving it memory and CPU time and protecting it from other programs. Only the OS has the privilege to do that.
2. **I/O operations.**
   **+** Programs read and write without knowing how each device works.
   **✗** Controlling devices uses **privileged instructions**. If user programs could do it, one user could interfere with everyone else's I/O.
3. **File-system manipulation.**
   **+** Users work with named files and directories instead of raw disk blocks.
   **✗** A user program would need direct disk access, and **couldn't enforce permissions** on other users' files.
4. **Communications.**
   **+** Processes exchange data, on one machine or over a network, through messages or shared memory, without managing the transfer.
   **✗** Each process is isolated in its own memory. Only the OS can move data between processes or set up shared memory.
5. **Error detection.**
   **+** The OS watches for errors in the CPU, memory, devices, and programs, and handles them, so users don't have to check everything themselves.
   **✗** Hardware faults and errors like division by zero **trap to the kernel**. A user program can't see or recover from errors in the hardware or in other programs.

**The common reason:** these services need **privileged, kernel-mode** access and must be **fair and protected for all users**. Only the OS, running in kernel mode, can be trusted with that ([[17-dual-mode-and-timer|dual mode]]).

> [!note] If it's just "list the services"
> Last year's Quiz 2 only asked for the list. Write all 9 from [[chapter-2-summary|Summary §1]]: UPIFCE + RAP.

---

## 2.10 Why do some systems store the OS in firmware, while others store it on disk?

**Notes:** [[chapter-2-quiz-3|Quiz 3 note §8]], [[02-boot-process]], [[03-bios-and-uefi]] · **Past quiz:** related to Quiz 1 (boot) · **Slides:** 1.10, 1.18, and 2.70 (Quiz 3 range)

**Answer:**
**Firmware (ROM/EPROM).** Used for **small OSes, simple hardware, and rugged operation**, such as phones, tablets, game consoles, and embedded devices.
- The OS is available **instantly at power-on**, and no disk is needed.
- It **can't easily be infected** by a virus.

**Disk.** Used for **large, general-purpose OSes** (Windows, macOS, UNIX) and **OSes that change frequently**. Firmware is a poor fit for them because:
1. It is **expensive**, so only small amounts are available, and a large OS doesn't fit.
2. **Updating it means rewriting or replacing the chip**, while a disk is easily rewritten.
3. Code runs **slower from firmware** than from RAM.

So these systems keep only a **small bootstrap loader in firmware**. It loads the OS from disk.

---

## 2.11 How could a system be designed to allow a choice of OSes to boot from? What would the bootstrap program need to do?

**Notes:** [[chapter-2-quiz-3|Quiz 3 note §8]], [[06-grub]], [[05-mbr-and-gpt]] · **Past quiz:** related to Quiz 1 (boot) · **Slides:** 1.19–1.22, and 2.70 (Quiz 3 range)

**Answer:**
**Design:**
- The disk is divided into **partitions**, with each OS installed in its own partition.
- The firmware's bootstrap loads a **boot manager** from a fixed place on the disk (the boot block / MBR), instead of loading an OS directly.
- An example is **GRUB**, used for dual-booting Linux and Windows.

**The bootstrap / boot manager must:**
1. **Know which OSes are installed and where.** It reads a configuration listing each OS's partition and kernel location, so it must understand **partition tables and file systems**.
2. **Show a menu** so the user can choose, with a **default** and a **timeout**.
3. **Load the chosen OS's kernel** into memory and jump to it, or **chainload** that OS's own bootloader from the start of its partition.

---
[[chapter-2-summary|← Chapter 2 Summary]] · [[00-overview|Chapter 1 overview]]
