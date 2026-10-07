---
title: "Interrupts"
description: What interrupts and traps are, how the interrupt vector and handlers work, polling vs vectored systems, maskable vs non-maskable interrupts, priorities, and the interrupt timeline.
tags: [operating-systems, hardware]
---
# Interrupts

*Slides 1.26–1.30, 1.34, 1.55 · Part of [[00-overview|Chapter 1 overview]]*

An **interrupt** is a signal that makes the CPU stop what it's doing, handle an event, and then return. Interrupts are how hardware gets the CPU's attention. For example, a [[07-computer-system-organization|device controller]] interrupts when it finishes an operation.

> [!tip] An operating system is interrupt driven
> When there's nothing to do, the OS waits. Almost everything it does happens in response to an interrupt or a trap.

## Hardware interrupts vs traps

| Hardware interrupt | Software interrupt: **trap** or **exception** |
| --- | --- |
| Raised by a **device** | Raised by **software** |
| A controller finished I/O, or the timer went off | Caused by an **error** (division by zero, invalid memory access) or a **user request** for an OS service (a **system call**) |
| Can arrive at any time | Caused by the instruction currently running |

How traps switch the CPU into kernel mode, and how the timer interrupt works, are in [[17-dual-mode-and-timer|dual mode and the timer]].

## Common functions of interrupts

- An interrupt **transfers control to the interrupt service routine** (ISR) that handles it. This generally happens through the **interrupt vector**: a table holding the **addresses of all the service routines**, indexed by interrupt number.
- The interrupt architecture **must save the address of the interrupted instruction**, so the program can continue afterwards as if nothing happened.
- A **trap** or **exception** is a **software-generated interrupt**, caused either by an error or by a user request.

## Interrupt handling

1. **Save the CPU state.** The OS preserves the state by storing the **registers and the program counter**.
2. **Find out which interrupt occurred**, by one of two methods:
   - **Polling**: a generic routine checks each device in turn to see which one raised the interrupt. It's simple but slow.
   - **Vectored interrupt system**: the interrupting device sends a **number** that indexes the interrupt vector, so the right handler runs immediately. It's fast.
3. **Run the handler.** Separate segments of code decide what action to take for each type of interrupt.
4. **Restore the state** and resume the interrupted program.

| Polling | Vectored |
| --- | --- |
| The CPU asks each device "was it you?" | The device identifies itself with a vector number |
| Simple, slow with many devices | Direct jump to the right ISR, fast |

## Maskable vs non-maskable interrupts

Most CPUs have **two interrupt request lines**:

| Non-maskable interrupt (NMI) | Maskable interrupt |
| --- | --- |
| **Cannot be turned off** | Can be **turned off (masked)** by the CPU, for example before running a critical instruction sequence that must not be interrupted |
| Reserved for serious events such as unrecoverable memory errors | Used by device controllers for normal I/O |

**Interrupt priority levels:** the interrupt mechanism also has priorities. They let the CPU:
- **defer low-priority interrupts** without masking all of them, and
- let a **high-priority interrupt preempt** the handling of a low-priority one.

The slide gives this the title "Storage Structure" (1.34), but its content is about interrupts.

## The interrupt timeline (slides 1.29–1.30)

The figure tracks the CPU and one I/O device over time:

1. The CPU is **executing a user process**, and the device is **idle**.
2. The process makes an **I/O request**. The device starts **transferring**, while the CPU keeps running the user process.
3. The device finishes (**transfer done**) and an **interrupt is signaled**.
4. The CPU briefly switches to **I/O interrupt processing** until the **interrupt is handled**.
5. The CPU returns to the user process, and the device is idle again. The cycle repeats for the next request.

```text
CPU     ██████████████▁▁██████████████▁▁████   ▁▁ = handling the interrupt
device  ▁▁▁▁████████▁▁▁▁▁▁▁▁████████▁▁▁▁▁▁▁▁   ██ = transferring
            ↑       ↑           ↑       ↑
         request  done       request  done
```

The point of the timeline is that **the CPU and the device work at the same time**. The CPU only loses a short moment per interrupt. The full request-to-resume cycle is in [[09-io-structure|I/O structure]]. For fast devices, even one interrupt per byte is too many, which is what [[10-dma|DMA]] solves.

## Check yourself

> [!question]- What is the interrupt vector?
> A table of the addresses of all interrupt service routines, indexed by interrupt number. The CPU uses it to jump to the right handler.

> [!question]- What must be saved when an interrupt happens?
> The address of the interrupted instruction (the program counter) and the CPU registers, so the program can resume.

> [!question]- What is the difference between an interrupt and a trap?
> A hardware interrupt comes from a device. A trap or exception is generated by software, through an error or a system call.

> [!question]- What is the difference between polling and vectored interrupts?
> With polling, the CPU checks each device to find the source. In a vectored system, the device supplies a number that indexes the interrupt vector directly.

> [!question]- What can a non-maskable interrupt do that a maskable one can't?
> It can't be disabled, so it always gets through. That's why it's used for critical errors.

---
[[07-computer-system-organization|← Computer-system organization]] · [[00-overview|Overview]] · [[09-io-structure|Next: I/O structure →]]
