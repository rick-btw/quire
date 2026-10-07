---
title: "Storage structure"
description: Bits, bytes, words, and storage units, main memory vs secondary storage, volatility, and hard disks vs solid-state disks.
tags: [operating-systems, storage]
---
# Storage structure

*Slides 1.33, 1.35 · Part of [[00-overview|Chapter 1 overview]]*

## Units of storage

- A **bit** is the basic unit of storage. It holds one of two values, 0 or 1. All other storage is built from collections of bits.
- A **byte** is **8 bits**, and on most computers it is the **smallest convenient chunk** of storage. Most computers have an instruction to move a byte, but none to move a single bit.
- A **word** is a computer architecture's **native unit of data**, made of one or more bytes. A machine with 64-bit registers and 64-bit memory addressing typically has **64-bit (8-byte) words**. The computer executes many operations in its word size rather than a byte at a time.

| Unit | Bytes | Power of two |
| --- | --- | --- |
| kilobyte (KB) | 1,024 | $2^{10}$ |
| megabyte (MB) | 1,024² | $2^{20}$ |
| gigabyte (GB) | 1,024³ | $2^{30}$ |
| terabyte (TB) | 1,024⁴ | $2^{40}$ |
| petabyte (PB) | 1,024⁵ | $2^{50}$ |

- **Manufacturers round off.** They call a megabyte 1 million bytes and a gigabyte 1 billion bytes, which is why a "1 TB" disk shows up as about 931 GB.
- **Networking is the exception.** Network speeds are measured in **bits** (Mbps), because networks move data one bit at a time.

> [!info] Beyond the slides: KiB vs KB
> Strictly, 1,024 bytes is a **kibibyte (KiB)**, and the IEC standard reserves "kilobyte" for 1,000. The slides and the textbook use KB = 1,024. Notes like [[05-mbr-and-gpt|MBR and GPT]] write TiB and MiB where the binary meaning matters.

## Volatile vs nonvolatile

- **Volatile** storage loses its contents when the power is turned off.
- **Nonvolatile** storage keeps its contents without power.

This is why the [[02-boot-process|bootstrap program]] lives in nonvolatile ROM/EPROM: RAM is empty at power-on.

## Main memory

**Main memory** (RAM) is the **only large storage medium the CPU can access directly**. Programs must be in main memory to run.
- It is **random access**: any location can be read in the same time.
- It is **typically volatile**.

It isn't used for everything because it is **too small** to hold all programs and data, and it **forgets everything** when the power goes off.

## Secondary storage

**Secondary storage** is an **extension of main memory** that provides **large, nonvolatile** storage capacity.

| | Hard disk (HDD) | Solid-state disk (SSD) |
| --- | --- | --- |
| How it works | Rigid metal or glass **platters** covered with magnetic recording material | Electronic memory (various technologies, mostly flash). No moving parts |
| Organization | Surface divided into **tracks**, subdivided into **sectors** (see [[04-disk-structure]]) | Numbered blocks |
| Speed | Slower | **Faster** than hard disks |
| Volatile? | No | No |
| Trend | Declining | **Becoming more popular** |

The **disk controller** determines the logical interaction between the device and the computer ([[07-computer-system-organization|device controllers]]).

How all these storage types rank by speed, cost, and size is in [[12-storage-hierarchy-and-caching|storage hierarchy and caching]].

## Check yourself

> [!question]- What is the difference between a byte and a word?
> A byte is always 8 bits. A word is the architecture's native data size, for example 8 bytes on a 64-bit machine.

> [!question]- Why is main memory not enough on its own?
> It is too small to hold every program and all data, and it is volatile, so it loses everything when the power goes off.

> [!question]- Which storage can the CPU access directly?
> Main memory (and its own registers and cache). Secondary storage must be loaded into memory first.

---
[[10-dma|← DMA]] · [[00-overview|Overview]] · [[12-storage-hierarchy-and-caching|Next: Storage hierarchy and caching →]]
