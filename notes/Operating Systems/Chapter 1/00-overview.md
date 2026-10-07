---
title: "Chapter 1 overview"
description: Map of the chapter 1 notes (Introduction), the reading order, and the ideas that tie the chapter together.
tags: [operating-systems]
---
# Chapter 1 overview

These notes cover chapter 1, *Introduction*, of *Operating System Concepts* (Silberschatz, Galvin and Gagne, 9th ed.). They are built from the lecturer's slides (1.1–1.58), so you shouldn't need the slides themselves.

The chapter is a grand tour. It covers what an operating system is, how a computer starts, how the hardware and the OS talk to each other, and the basic ideas every later chapter builds on.

> [!tip] Short on time?
> [[chapter-1-summary|Chapter 1 Summary]] is the one-page quiz version. These notes are the full version.

## Reading order

### Part 1: What an OS is

| Note | Slides | Covers |
| --- | --- | --- |
| [[01-what-is-an-operating-system]] | 1.4–1.9 | Definition, goals, the four components, points of view, the kernel |

### Part 2: Starting the computer

| Note | Slides | Covers |
| --- | --- | --- |
| [[02-boot-process]] | 1.10–1.12 | Bootstrap program, bootloader, the boot steps from power-on to kernel |
| [[03-bios-and-uefi]] | 1.18, 1.23–1.24 | Firmware, BIOS, UEFI, CSM, making a bootable USB with Rufus |
| [[04-disk-structure]] | 1.14, 1.35 | Tracks, sectors, clusters, CHS and LBA addressing |
| [[05-mbr-and-gpt]] | 1.11, 1.13, 1.15–1.17 | MBR and GPT layouts byte by byte, their limits |
| [[06-grub]] | 1.19–1.22 | How GRUB finds the kernel, its stages, where each piece lives on disk |

### Part 3: How the hardware works

| Note | Slides | Covers |
| --- | --- | --- |
| [[07-computer-system-organization]] | 1.25–1.26, 1.42 | Bus, device controllers, device drivers, the von Neumann model |
| [[08-interrupts]] | 1.27–1.30, 1.34 | Interrupt vector, handling, polling vs vectored, maskable vs non-maskable |
| [[09-io-structure]] | 1.31–1.32 | Interrupt-driven I/O cycle, synchronous vs asynchronous I/O |
| [[10-dma]] | 1.41 | Direct memory access |
| [[11-storage-structure]] | 1.33, 1.35 | Storage units, main memory, secondary storage, HDD and SSD |
| [[12-storage-hierarchy-and-caching]] | 1.36–1.40 | The storage hierarchy, caching |

### Part 4: Computer-system architecture

| Note | Slides | Covers |
| --- | --- | --- |
| [[13-multiprocessor-systems]] | 1.43–1.45, 1.48 | Multiprocessors, AMP vs SMP, multicore vs multiprocessor |
| [[14-cores-threads-concurrency]] | 1.46–1.50 | Cores vs threads, concurrency vs parallelism |
| [[15-clustered-systems]] | 1.51–1.52 | Clusters, high availability, HPC |

### Part 5: OS structure and operations

| Note | Slides | Covers |
| --- | --- | --- |
| [[16-multiprogramming-and-timesharing]] | 1.53–1.54 | Multiprogramming, timesharing, job vs CPU scheduling |
| [[17-dual-mode-and-timer]] | 1.55–1.57 | Traps, user vs kernel mode, system calls, the timer |

### Reference

| Note | Covers |
| --- | --- |
| [[18-glossary]] | Every term and acronym in the chapter, with a link to where it's explained |
| [[chapter-1-summary]] | One-page summary, things to memorize, quiz self-test |

## The ideas that tie the chapter together

**The OS is interrupt driven.** Almost every topic comes back to interrupts.
- Device controllers announce finished I/O with an [[08-interrupts|interrupt]].
- [[10-dma|DMA]] exists to cut the number of interrupts.
- The [[17-dual-mode-and-timer|timer]] uses an interrupt to take the CPU back from a runaway program.
- A system call is a software interrupt (a *trap*) that switches the CPU into kernel mode.

**Speed gaps shape the design.** CPUs are much faster than memory, and memory is much faster than disks.
- The [[12-storage-hierarchy-and-caching|storage hierarchy and caching]] keep the data in use close to the CPU.
- [[09-io-structure|Asynchronous I/O]] and [[16-multiprogramming-and-timesharing|multiprogramming]] keep the CPU busy while slow devices work.

**The OS must protect itself.** The OS is a *control program* ([[01-what-is-an-operating-system|definition]]). Dual mode and the timer are the hardware features that make this control possible.

**More processors.** Systems scale up from one CPU to [[13-multiprocessor-systems|multiprocessors and multicore chips]], then to [[15-clustered-systems|clusters]] of whole machines.

## Not covered by these slides

The lecturer's deck ends at the timer (slide 1.57). Slide 1.2 lists more of the textbook's chapter 1:
- process management
- memory management
- storage management
- protection and security
- kernel data structures
- computing environments
- open-source operating systems

Those sections aren't in the slides, so they aren't in these notes. Several of them get their own chapters later in the course.

---
[[01-what-is-an-operating-system|Start: What is an operating system? →]]
