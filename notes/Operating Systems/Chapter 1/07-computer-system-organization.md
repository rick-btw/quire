---
title: "Computer-system organization"
description: How CPUs, device controllers, and memory are connected by a shared bus, what device controllers and drivers do, and the von Neumann model of a modern computer.
tags: [operating-systems, hardware]
---
# Computer-system organization

*Slides 1.25–1.26, 1.37, 1.42 · Part of [[00-overview|Chapter 1 overview]]*

## The big picture

- One or more **CPUs** and several **device controllers** connect through a **common bus**, which gives them access to **shared memory**.
- The CPUs and the devices **execute concurrently**, competing for memory cycles.

```text
   CPU(s)        disk          USB           graphics
     │         controller    controller      adapter
     │             │             │              │
═════╪═════════════╪═════════════╪══════════════╪═════  common bus
     │
  memory (shared)
```

## Device controllers

- **Each device controller is in charge of one particular type of device**, such as disks, USB, or graphics.
- **Each controller has a local buffer** of its own.
- **I/O happens between the device and the controller's local buffer.**
- **The CPU moves data** between main memory and those local buffers.
- When it finishes an operation, the **controller tells the CPU by causing an [[08-interrupts|interrupt]]**.
- I/O devices and the CPU **can execute concurrently**. The CPU doesn't have to watch the device while it works.

For high-speed devices, copying through the CPU is too slow. [[10-dma|DMA]] lets the controller write straight into memory instead.

## Device drivers

The OS has a **device driver for each device controller**. The driver **understands the controller** and provides a **uniform interface** between the controller and the kernel. The rest of the OS doesn't need to know how each device works. The I/O steps a driver goes through are in [[09-io-structure|I/O structure]].

```text
kernel ⇄ device driver ⇄ device controller (local buffer) ⇄ device
 (software, part of the OS)  (hardware)
```

## How a modern computer works: the von Neumann architecture

Slide 1.42 shows a **von Neumann architecture**: **instructions and data are both stored in the same memory**.

The figure has three boxes: the **CPU** (×N, with a cache, running a thread of execution), **memory** (holding instructions and data), and a **device** (×M).

| Between | What flows |
| --- | --- |
| CPU ⇄ memory | The **instruction-execution cycle** (fetching instructions) and **data movement** |
| CPU → device | **I/O requests** |
| CPU ⇄ device | **Data** |
| Device → CPU | **Interrupts** |
| Device ⇄ memory | **DMA**, which bypasses the CPU |

**The instruction-execution cycle:**
1. **Fetch** an instruction from memory into the instruction register.
2. **Decode** it. This may require fetching **operands** from memory into registers.
3. **Execute** it.
4. **Store** the result back in memory if needed.

Devices signal completion with [[08-interrupts|interrupts]], and with [[10-dma|DMA]] they move data directly to and from memory. The (×N) and (×M) mean the picture holds for any number of CPUs and devices. Systems with many CPUs are covered in [[13-multiprocessor-systems|multiprocessor systems]].

## Check yourself

> [!question]- Where does I/O data first go when a device reads input?
> Into the device controller's local buffer. The CPU (or DMA) then moves it to main memory.

> [!question]- How does a device controller tell the CPU it's done?
> It causes an interrupt.

> [!question]- What does a device driver provide?
> A uniform interface between the device controller and the kernel. It understands the specific controller so the rest of the OS doesn't have to.

> [!question]- What defines a von Neumann architecture?
> Instructions and data are stored together in the same memory. The CPU repeatedly fetches, decodes, and executes instructions from it.

---
[[06-grub|← GRUB]] · [[00-overview|Overview]] · [[08-interrupts|Next: Interrupts →]]
