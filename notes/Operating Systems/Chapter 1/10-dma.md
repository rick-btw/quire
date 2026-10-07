---
title: "Direct memory access (DMA)"
description: Why interrupt-driven I/O is too slow for fast devices, and how DMA moves whole blocks to memory without the CPU, with one interrupt per block.
tags: [operating-systems, hardware]
---
# Direct memory access (DMA)

*Slides 1.41–1.42 · Part of [[00-overview|Chapter 1 overview]]*

## The problem

In plain [[09-io-structure|interrupt-driven I/O]], the CPU copies data between the controller's local buffer and memory, and gets an [[08-interrupts|interrupt]] for each small piece. That's fine for slow devices like a keyboard. For a disk or a network card, it would mean **one interrupt per byte**, and the CPU would spend most of its time handling interrupts.

## The solution: DMA

- DMA is used for **high-speed I/O devices** that can transmit information at **close to memory speeds**.
- The **device controller transfers blocks of data** from its buffer storage **directly to main memory, without CPU intervention**.
- **Only one interrupt is generated per block**, rather than one interrupt per byte.

**How a DMA transfer goes:**
1. The device driver (on the CPU) sets up the transfer: the memory buffer address, the direction, and how many bytes.
2. The controller moves the **whole block** between its buffer and memory by itself. The **CPU is free** to do other work meanwhile.
3. When the block is done, the controller raises **one interrupt** to tell the driver.

| | Interrupt-driven I/O | DMA |
| --- | --- | --- |
| Who moves the data | The CPU | The device controller |
| Interrupts | One per byte (or word) | **One per block** |
| CPU during the transfer | Busy copying and handling interrupts | Free for other work |
| Good for | Slow devices (keyboard, mouse) | Fast devices (disks, network) |

**Example:** reading a 4 KiB block costs **4096 interrupts** byte by byte, but **1 interrupt** with DMA.

In the [[07-computer-system-organization|von Neumann figure]] (slide 1.42), DMA is the arrow that goes **from the device straight to memory**, bypassing the CPU.

## Check yourself

> [!question]- Why do high-speed devices need DMA?
> Without it they would cause one interrupt per byte, overwhelming the CPU. DMA transfers a whole block and interrupts once.

> [!question]- Who moves the data in a DMA transfer, and what does the CPU do?
> The device controller moves the data directly to or from memory. The CPU only sets up the transfer and handles the final interrupt, and is free in between.

---
[[09-io-structure|← I/O structure]] · [[00-overview|Overview]] · [[11-storage-structure|Next: Storage structure →]]
