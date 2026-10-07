---
title: "The boot process"
description: How a computer goes from power-on to a running kernel. Covers the bootstrap program, firmware, the MBR, the bootloader, and the step-by-step boot sequence.
tags: [operating-systems, boot]
---
# The boot process

*Slides 1.10–1.12 (details on 1.13–1.24) · Part of [[00-overview|Chapter 1 overview]]*

**Booting** is everything that happens between pressing the power button and the [[01-what-is-an-operating-system|kernel]] running. This note is the big picture. Each piece has its own note:

- [[03-bios-and-uefi|BIOS and UEFI]]: the firmware that runs first.
- [[04-disk-structure|Disk structure]]: sectors, and how a disk is addressed.
- [[05-mbr-and-gpt|MBR and GPT]]: where the boot code and the partition table live.
- [[06-grub|GRUB]]: the Linux bootloader that finds and loads the kernel.

## The bootstrap program

The **bootstrap program** is the first code the computer runs.
- It is loaded at **power-up or reboot**.
- It is typically stored in **ROM or EPROM** (Erasable Programmable Read-Only Memory). Code stored this way is generally known as **firmware**.
- It **initializes all aspects of the system**: CPU registers, device controllers, and memory contents.
- It **loads the OS kernel** and starts its execution.

> [!note] Why does it have to live in ROM?
> Main memory is **volatile**: it is empty when the power comes on (see [[11-storage-structure|storage structure]]). The very first code must sit in **nonvolatile** memory that the CPU can run directly.

## The bootloader

A **bootloader** is a vendor-proprietary image responsible for **bringing up the kernel** on a device. On a PC running Linux, the bootloader is usually [[06-grub|GRUB]].

## The short version

When a computer is turned on, its **BIOS** finds the primary bootable device, usually the hard disk. It then runs the initial bootstrap program from that disk's **master boot record (MBR)**.

The MBR is the **first sector** of the disk. The bootstrap program in it **must be small, because it has to fit in a single sector** (512 bytes, of which 446 are for code).

## Step by step (BIOS + MBR + GRUB)

This is the sequence on slide 1.12, for a Linux PC with a legacy BIOS:

0. **Power on.**
1. The **CPU** powers on and looks for something to run in **ROM** (or EPROM).
2. It finds the **BIOS** (or other firmware) and runs it.
3. The **BIOS** runs. It acts as the bootstrap loader, checks and initializes the hardware, and picks the boot device.
4. The BIOS looks for the **MBR** on that device.
5. It finds the **MBR** (512 bytes). Besides the boot code, the MBR holds useful information about the disk's **partitions**.
6. The MBR is copied into **memory at address `0x7C00`**, and the CPU jumps to it. This code is the first stage of **GRUB**.
7. **GRUB** uses the MBR's information to find **Linux**. It loads the kernel into memory and prepares to run it.
8. **Linux runs.**

> [!warning] A mistake on the slide
> Step 6 on the slide says "physical disk 0x7c00". `0x7C00` is a **physical memory (RAM) address**, not a disk location. The BIOS reads sector 0 from the disk and places it at that address in memory.

```text
power on
   │
   ▼
CPU starts executing firmware in ROM
   │
   ▼
BIOS ── initializes hardware, chooses the boot device
   │    reads sector 0 (the MBR, 512 B) into RAM at 0x7C00
   ▼
MBR boot code = GRUB stage 1 (boot.img)
   │    loads the rest of GRUB
   ▼
GRUB core (core.img) ── has file-system drivers
   │    reads /boot/grub, shows the menu
   ▼
GRUB loads the kernel image into memory
   │
   ▼
kernel runs → OS is up
```

The details of each stage are in [[05-mbr-and-gpt|MBR and GPT]] (what sector 0 contains) and [[06-grub|GRUB]] (stages 1, 1.5, and 2).

## After the kernel starts

At boot the hardware starts in **kernel mode**. Once the OS is loaded, it starts user applications in **user mode** ([[17-dual-mode-and-timer|dual-mode operation]]). From then on the OS sits waiting for events and reacts to [[08-interrupts|interrupts]].

> [!info] Beyond the slides: UEFI machines boot differently
> The steps above are the **legacy BIOS** path. **UEFI** firmware doesn't run code from the MBR. It reads the **GPT**, finds the FAT-formatted **EFI System Partition**, and runs a bootloader *file* from it directly (for example GRUB's `.efi` file or Windows Boot Manager). See [[03-bios-and-uefi|BIOS and UEFI]].

## Check yourself

> [!question]- Where is the bootstrap program stored, and why there?
> In ROM or EPROM (firmware). RAM is volatile and empty at power-on, so the first code must be in nonvolatile memory.

> [!question]- What does the bootstrap program do?
> It initializes all aspects of the system, then loads the OS kernel and starts it.

> [!question]- Why must the MBR's boot code be small?
> It has to fit in a single 512-byte sector, alongside the partition table.

> [!question]- Put these in order: GRUB, BIOS, kernel, MBR, ROM.
> ROM → BIOS → MBR → GRUB → kernel.

> [!question]- What is `0x7C00`?
> The memory address where the BIOS loads the MBR before jumping to it.

---
[[01-what-is-an-operating-system|← What is an operating system?]] · [[00-overview|Overview]] · [[03-bios-and-uefi|Next: BIOS and UEFI →]]
