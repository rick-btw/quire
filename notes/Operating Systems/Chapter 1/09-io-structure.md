---
title: "I/O structure"
description: The interrupt-driven I/O cycle step by step, synchronous vs asynchronous I/O, and the device-status table.
tags: [operating-systems, hardware]
---
# I/O structure

*Slides 1.31–1.32 · Part of [[00-overview|Chapter 1 overview]]*

I/O is how the CPU gets data to and from devices through their [[07-computer-system-organization|device controllers]]. This note covers the steps of one I/O operation and the two ways a program can wait for it.

## The interrupt-driven I/O cycle (slide 1.32)

| Step | Who | What happens |
| --- | --- | --- |
| 1 | CPU | The **device driver initiates I/O**. It tells the controller what to do |
| 2 | I/O controller | The controller **initiates I/O** on the device |
| — | CPU | Meanwhile, the CPU runs other work, **checking for interrupts between instructions** |
| 3 | I/O controller | The **input is ready, output is complete, or an error occurred**. The controller **generates an interrupt signal** |
| 4 | CPU | The CPU **receives the interrupt** and transfers control to the **interrupt handler** |
| 5 | CPU | The **interrupt handler processes the data** and returns from the interrupt |
| 6 | CPU | The CPU **resumes processing the interrupted task** |
| 7 | — | The cycle starts again with the next I/O request |

```text
        CPU                                   I/O controller
 1  driver initiates I/O ──────────────► 2  initiates I/O
    CPU keeps executing,                      │
    checks for interrupts                     ▼
    between instructions              3  input ready / output done /
                                          error → interrupt signal
 4  CPU receives interrupt ◄──────────────────┘
    → interrupt handler
 5  handler processes data, returns
 6  CPU resumes the interrupted task
 7  └──► next I/O request (back to 1)
```

How the CPU finds and runs the handler is in [[08-interrupts|interrupts]].

## Synchronous vs asynchronous I/O (slide 1.31)

Once an I/O operation starts, there are two options for what happens to the program that asked for it.

| | **Synchronous I/O** | **Asynchronous I/O** |
| --- | --- | --- |
| When control returns to the user program | **Only when the I/O completes** | **Right away**, without waiting for completion |
| What the CPU does meanwhile | Waits. Either a **wait instruction** idles the CPU until the next interrupt, or a **wait loop** spins (which competes for memory access) | Runs other work |
| Outstanding requests | **At most one at a time**. No simultaneous I/O | **Many**, tracked in the device-status table |
| If the program needs the result | It already has it | It makes a **system call** asking the OS to let it wait for the I/O to complete |

Asynchronous I/O is what lets the CPU stay busy while slow devices work. That's the same idea behind [[16-multiprogramming-and-timesharing|multiprogramming]].

## The device-status table

With asynchronous I/O, many devices can be busy at once, so the OS keeps track of them in a **device-status table**.

- There is **one entry per I/O device**, giving its **type, address, and state** (idle, busy, …).
- When an interrupt arrives, the OS **indexes into the table** to find the device's status, and **updates the entry** to record the interrupt.
- Busy devices can also have a **queue of waiting requests** attached to their entry.

An illustration (not from the slides):

| Device | Status | Waiting requests |
| --- | --- | --- |
| keyboard | idle | none |
| disk 1 | busy | read block 1024 for process A → write block 77 for process B |
| printer | busy | print job from process C |

## Check yourself

> [!question]- In the I/O cycle, what does the CPU do while the controller works?
> It keeps executing other instructions, checking for an interrupt between each one.

> [!question]- What is the difference between synchronous and asynchronous I/O?
> With synchronous I/O, control returns only after the I/O completes, so there is at most one outstanding request. With asynchronous I/O, control returns immediately. A system call can wait for completion, and a device-status table tracks the many outstanding requests.

> [!question]- What's in a device-status table entry?
> The device's type, address, and state. Busy devices may also have a queue of pending requests.

---
[[08-interrupts|← Interrupts]] · [[00-overview|Overview]] · [[10-dma|Next: DMA →]]
