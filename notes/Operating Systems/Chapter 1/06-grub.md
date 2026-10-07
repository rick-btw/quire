---
title: "GRUB bootloader"
description: How GNU GRUB finds and loads the kernel. Covers its file-system-aware design, its stages, where each stage lives on MBR and GPT disks, and the boot menu.
tags: [operating-systems, boot]
---
# GRUB bootloader

*Slides 1.12–1.13, 1.16, 1.19–1.22 · Part of [[02-boot-process|the boot process]]*

**GNU GRUB** (GRand Unified Bootloader) is the standard bootloader for Linux. **GRUB 2** is the current version. Its job is the last step of booting: find the kernel image, load it into memory, and start it.

## Two ways a bootloader can find the kernel

| | Approach 1: raw sectors | Approach 2: file-system aware |
| --- | --- | --- |
| How | Loads kernel images by **directly accessing disk sectors**, without understanding the file system | **Understands the file system**, so kernel images are found by their actual **file paths** |
| Needs | Hardcoded sector locations, or map files listing them | A **driver for each supported file system**, built into the bootloader |
| Adding or moving a kernel | Requires **updating the MBR** | Nothing to update |

**GRUB uses approach 2.** The file-system drivers make GRUB far too big for the 446 bytes of boot code in the [[05-mbr-and-gpt|MBR]]. So **the bootloader is split into multiple stages** to fit the MBR boot scheme.

## GRUB's stages

| Stage | Image | Size | Where on an MBR disk | What it does |
| --- | --- | --- | --- | --- |
| 1 | `boot.img` | 446 B | MBR, sector 0 | Contains an **LBA48 pointer** (a 48-bit sector address) to stage 1.5 or stage 2. It loads the next stage |
| 1.5 | `core.img` | 32,256 B | Empty sectors 1–62, right after the MBR | Contains **file-system drivers**, so it can find stage 2 **by full path and file name** |
| 2 | `/boot/grub/` | Varies | A directory inside a normal partition | GRUB's modules and configuration. It shows the menu and loads the kernel |

```text
BIOS ─► boot.img (stage 1, in the MBR)
          │  jumps to a fixed sector address
          ▼
        core.img (stage 1.5, in the gap after the MBR)
          │  has file-system drivers, opens a path
          ▼
        /boot/grub/ (stage 2, a directory in a partition)
          │  shows the menu, reads the chosen kernel file
          ▼
        kernel
```

Stage 1 is too small to understand file systems, so it can only jump to a fixed sector. Stage 1.5 is the first stage that can open files by name.

## Where the pieces live (slide 1.20)

### Example 1: an MBR-partitioned disk

| Location | Contents |
| --- | --- |
| Sector 0 (MBR) | `boot.img` |
| Empty space after the MBR | `core.img`. This is sectors 1–2047 for 512-byte sectors, or 1–255 for 4096-byte sectors |
| `sda1` | NTFS (for example, Windows) |
| `sda3` | Another primary partition |
| `sda2` | **Extended partition**, which contains the two logical partitions below |
| `sda5` (logical) | ext4, mounted at `/boot` and `/`, 10–20 GiB. **`/boot/grub/` is here** |
| `sda6` (logical) | ext4, mounted at `/home`, as much space as required |

### Example 2: a GPT-partitioned disk

| Location | Contents |
| --- | --- |
| Sector 0 (protective MBR) | `boot.img` |
| Sector 1 | GPT header |
| Sectors 2–33 (2–5 for 4 KiB sectors) | Partition entry array |
| `sda1` | FAT32, **EFI** System Partition, about 99 MiB. Used when booting with UEFI |
| `sda2` | **BIOS boot partition**, 1 MiB, with no file system. **`core.img` is here** |
| `sda3` | ext4, mounted at `/`, 10–20 GiB |
| `sda4` | ext2, mounted at `/boot`, about 300 MiB. **`/boot/grub/` is here** |
| `sda5` | ext4, mounted at `/home`, as much space as required |

On a GPT disk, the sectors right after LBA 0 hold the GPT header and partition entries. So instead of the gap after the MBR, GRUB keeps `core.img` in its own small **BIOS boot partition**.

## The GRUB menu (slides 1.21–1.22)

When stage 2 runs, GRUB shows a menu of boot entries.

| Key | Action |
| --- | --- |
| ↑ / ↓ | Select an entry |
| Enter | Boot the selected OS |
| `e` | Edit the entry's commands before booting |
| `c` | Open the GRUB command line |

Typical entries:
- The OS itself, for example "Debian GNU/Linux", or "Ubuntu" with a kernel version.
- "Advanced options" or **recovery mode**.
- **memtest86+**, a memory tester.

## Check yourself

> [!question]- Why is GRUB split into stages?
> GRUB contains file-system drivers, so it is far bigger than the 446 bytes of boot code that fit in the MBR. Stage 1 fits in the MBR and loads the larger stages.

> [!question]- What is the advantage of a file-system-aware bootloader?
> It finds kernels by file path. There are no hardcoded sector locations or map files, and no MBR update is needed when kernels are added or moved.

> [!question]- Where do `boot.img`, `core.img`, and `/boot/grub` live on an MBR disk?
> `boot.img` is in the MBR (sector 0). `core.img` is in the empty sectors after the MBR. `/boot/grub` is a directory in a regular partition.

> [!question]- On a GPT disk booted by BIOS, where does `core.img` go?
> In a small BIOS boot partition with no file system, about 1 MiB.

---
[[05-mbr-and-gpt|← MBR and GPT]] · [[00-overview|Overview]] · [[07-computer-system-organization|Next: Computer-system organization →]]
