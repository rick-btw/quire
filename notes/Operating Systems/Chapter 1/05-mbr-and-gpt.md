---
title: "Partition tables: MBR and GPT"
description: The master boot record and the GUID partition table, byte by byte. Covers what each holds, how a disk is laid out under each, and why GPT replaced MBR.
tags: [operating-systems, boot, storage]
---
# Partition tables: MBR and GPT

*Slides 1.11, 1.13, 1.15–1.17 · Part of [[02-boot-process|the boot process]]*

A **partition table** records how a disk's sectors are divided into **partitions**. Each partition notionally contains its own file system. A PC disk uses one of two formats: the older **MBR** or the newer **GPT**. Sector numbers below are LBAs ([[04-disk-structure|disk structure]]).

## MBR: Master Boot Record

The **MBR** is a type of boot sector in the **first block (sector 0)** of partitioned mass storage, such as fixed disks and removable drives. It holds two things:

1. **The partition table**: how the disk's sectors are divided into partitions.
2. **Executable boot code**: a loader for the installed OS. It usually passes control to the loader's **second stage**, or works together with each partition's **volume boot record (VBR)**. This MBR code is referred to as a **boot loader**.

### MBR layout (512 bytes)

| Bytes | Size | Contents |
| --- | --- | --- |
| 0–445 | **446 B** | Boot code. With GRUB, this is stage 1 (`boot.img`) |
| 446–509 | **64 B** | Partition table: **4 entries × 16 B** |
| 510–511 | **2 B** | **Magic number** (boot signature) `0x55AA`. It marks the sector as a valid MBR |

446 + 64 + 2 = 512. The exact byte offsets and the `0x55AA` value aren't on the slides, but they are standard.

### An MBR partition entry (16 bytes)

| Field | Size | Meaning |
| --- | --- | --- |
| Flag | 1 B | Boot indicator: is this the active (bootable) partition? |
| Start CHS | 3 B | First sector, as a CHS address |
| Type | 1 B | Partition type code, for example NTFS or Linux |
| End CHS | 3 B | Last sector, as a CHS address |
| Start LBA | 4 B | First sector, as an LBA |
| Size | 4 B | Number of sectors in the partition |

1 + 3 + 1 + 3 + 4 + 4 = 16 bytes.

### MBR limits

- **4 entries → at most 4 primary partitions.** To get more, one entry can be an **extended partition** that holds further **logical partitions**. On Linux, logical partitions are numbered from 5, which is why slide 1.20 shows `sda5` and `sda6` inside the extended partition `sda2`.
- **32-bit LBA and size fields** with 512-byte sectors limit the disk to $2^{32} \times 512\ \text{B} = 2\ \text{TiB}$.
- There is only **one copy** and **no checksum**. If sector 0 is damaged, the partition table is lost.

### Layout of an MBR disk (slide 1.13)

| Region | Contents |
| --- | --- |
| Sector 0 | **MBR**: stage 1 `boot.img` (446 B), 4 partition entries, magic number |
| Sectors 1–62 | **Empty** (the "MBR gap"). GRUB puts stage 1.5 `core.img` here |
| Sector 63 onward | First partition. It begins with its own **volume boot record (VBR)** |
| Inside a partition | `/boot/grub`: GRUB stage 2 |

- A **VBR** is the boot sector at the start of a partition. `boot.img` can also be written to a VBR and **chainloaded** from a different bootloader in the MBR.
- Modern partitioning tools start the first partition at sector **2048** (1 MiB) instead of 63. That makes the empty gap sectors 1–2047 for 512-byte sectors, or 1–255 for 4096-byte sectors (slide 1.20).

## GPT: GUID Partition Table

The **GPT** is a standard for the layout of partition tables on a physical storage device (HDD or SSD). It identifies disks and partitions with **globally unique identifiers (GUIDs)**, also called **universally unique identifiers (UUIDs)**.

- It is **part of the [[03-bios-and-uefi|UEFI]] standard**, the replacement for the PC BIOS.
- It is also used with some BIOSes, because of the limits of MBR partition tables: **32-bit LBA** with 512-byte sectors.

### Layout of a GPT disk (slide 1.16)

| Region | Contents |
| --- | --- |
| LBA 0 | **Protective MBR**: `boot.img` (446 B), **one** partition entry covering the disk, three empty entries, magic number |
| LBA 1 | **GPT header** |
| LBA 2–33 | **Partition entry array**: 128 entries × 128 B = 16 KiB = 32 sectors |
| LBA 34 onward | Partitions (or empty sectors, where a BIOS setup could keep `core.img`) |
| Last sectors of the disk | **Backup** partition entry array and **backup** GPT header |

With 4096-byte sectors, the entry array fits in LBA 2–5 (slide 1.20).

> [!info] Why a "protective" MBR?
> Old MBR-only tools don't understand GPT. The protective MBR describes the whole disk as one partition of an unknown (GPT) type. That way those tools see the disk as full rather than empty, and won't overwrite it.

### GPT header fields (LBA 1)

- **Signature**, which is the text `EFI PART` (not on the slides), and **revision**.
- **Header size** (little endian) and **CRC32 of the header**. The CRC32 is a checksum that detects corruption.
- A reserved field, which must be zero.
- **Current LBA** (this header's location) and **backup LBA** (the other header's location).
- **First and last usable LBA** for partitions.
- **Disk GUID**, the disk's unique ID.
- **Partition entry array (PEA) starting LBA**, **number of entries** in the PEA, and **size of an entry** (usually 128).
- **CRC32 of the partition array.**
- The rest of the sector is reserved and must be zeros: 420 bytes for 512-byte sectors, or 4004 bytes for 4 KiB sectors.

### A GPT partition entry (128 bytes)

| Field | Size |
| --- | --- |
| Partition type GUID (what kind of partition) | 16 B |
| Unique partition GUID (this partition's ID) | 16 B |
| First LBA | 8 B |
| Last LBA | 8 B |
| Attribute flags | 8 B |
| Partition name | 72 B |

The 8-byte LBA fields mean 64-bit addresses, so disks can be up to $2^{64}$ sectors.

## MBR vs GPT

| | MBR | GPT |
| --- | --- | --- |
| Full name | Master Boot Record | GUID Partition Table |
| Where | Sector 0 | LBA 1–33, plus a protective MBR at LBA 0 |
| Entry size | 16 B | 128 B |
| Partitions | 4 primary (more through an extended partition) | 128 by default |
| Sector addresses | 32-bit | 64-bit |
| Max disk (512 B sectors) | **2 TiB** | 8 ZiB |
| Partition IDs | 1-byte type code | GUIDs |
| Safety | One copy, no checksums | Backup header and array, CRC32 checksums |
| Firmware | BIOS | UEFI (and some BIOSes) |

How GRUB uses each layout is in [[06-grub|GRUB]].

## Check yourself

> [!question]- Break down the MBR's 512 bytes.
> 446 B boot code + 64 B partition table (4 entries × 16 B) + 2 B magic number (`0x55AA`).

> [!question]- Why does MBR allow only 4 primary partitions?
> The table has room for only four 16-byte entries. More are possible by making one entry an extended partition holding logical partitions.

> [!question]- Name three advantages of GPT over MBR.
> It supports disks larger than 2 TiB (64-bit LBAs), 128 partitions by default, and keeps a backup header with CRC32 checksums for integrity.

> [!question]- What is at LBA 0 on a GPT disk, and why?
> A protective MBR. It stops MBR-only tools from treating the disk as empty, and holds `boot.img` for BIOS booting.

---
[[04-disk-structure|← Disk structure]] · [[00-overview|Overview]] · [[06-grub|Next: GRUB →]]
