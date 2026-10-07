---
title: "Disk structure"
description: How a hard disk is organized into tracks, sectors, and clusters, and how sectors are addressed with CHS and LBA.
tags: [operating-systems, storage, boot]
---
# Disk structure

*Slides 1.14, 1.17, 1.35 · Part of [[02-boot-process|the boot process]] and [[11-storage-structure|storage structure]]*

## Hard disk geometry

A **hard disk** is made of rigid metal or glass **platters** covered with magnetic recording material. Each disk surface is **logically divided into tracks**, which are **subdivided into sectors**.

The figure on slide 1.14 labels four structures:

| Label | Structure | What it is |
| --- | --- | --- |
| A | **Track** | One concentric ring on the surface |
| B | **Geometrical sector** | A pie-slice wedge of the platter, crossing every track |
| C | **Disk sector** (track sector) | Where one track meets one geometrical sector. The **smallest unit the disk reads or writes** |
| D | **Cluster** | A group of adjacent sectors. The **unit a file system allocates** to files |

- The traditional sector size is **512 bytes**. Newer disks use **4096-byte** sectors, and slide 1.20 shows both.
- The **disk controller** determines the logical interaction between the device and the computer ([[07-computer-system-organization|device controllers]]).
- File systems choose a cluster size. Rufus's default is 4096 bytes ([[03-bios-and-uefi|BIOS and UEFI]]).

## Addressing sectors: CHS and LBA

Both partition tables on the slides store sector addresses, in two styles.

| | CHS | LBA |
| --- | --- | --- |
| Stands for | Cylinder–Head–Sector | Logical Block Addressing |
| Idea | Address a sector by its physical position: which cylinder (track), which head (surface), which sector on the track | Number every sector in order: 0, 1, 2, … |
| Used by | Old BIOSes. MBR entries still have CHS fields | Everything modern. The disk maps numbers to physical positions itself |

With LBA, **sector 0 is the first sector of the disk**. That's where the [[05-mbr-and-gpt|MBR]] lives.

> [!info] Beyond the slides: what "cylinder" means
> A disk has several platters stacked on one spindle, with a read/write **head** for each surface. The same track on every surface, taken together, forms a **cylinder**.

### Why address width limits disk size

The largest disk a table can describe is the number of addressable sectors times the sector size.

$$
\text{max size} = 2^{\text{address bits}} \times \text{sector size}
$$

- **MBR** uses **32-bit** LBAs: $2^{32} \times 512\ \text{B} = 2\ \text{TiB}$.
- **GPT** uses **64-bit** LBAs: $2^{64} \times 512\ \text{B} = 8\ \text{ZiB}$, effectively unlimited.

This limit is why GPT replaced MBR ([[05-mbr-and-gpt|MBR and GPT]]).

## SSDs

**Solid-state disks** have no platters or tracks. They are electronic, faster than hard disks, and nonvolatile. They still present the same numbered-block (LBA) interface, so partition tables and bootloaders work the same way on them.

## Check yourself

> [!question]- What is the difference between a track, a sector, and a cluster?
> A track is a ring on the platter. A sector is one piece of a track, and the smallest unit the disk reads or writes. A cluster is a group of sectors, and the unit a file system allocates.

> [!question]- What does LBA mean, and what is LBA 0?
> Logical Block Addressing: sectors are numbered 0, 1, 2, …. LBA 0 is the first sector, which holds the MBR.

> [!question]- Why can an MBR disk be at most 2 TiB?
> MBR stores 32-bit sector numbers, and 2³² sectors × 512 B = 2 TiB.

---
[[03-bios-and-uefi|← BIOS and UEFI]] · [[00-overview|Overview]] · [[05-mbr-and-gpt|Next: MBR and GPT →]]
