---
title: "Firmware: BIOS and UEFI"
description: What firmware is, what the BIOS does, UEFI as its replacement, CSM compatibility mode, and choosing the right settings for a bootable USB in Rufus.
tags: [operating-systems, boot]
---
# Firmware: BIOS and UEFI

*Slides 1.17–1.18, 1.23–1.24 · Part of [[02-boot-process|the boot process]]*

## Firmware

**Firmware** is a specific type of software **embedded directly into a piece of hardware** to control its basic operations. It lives in nonvolatile memory such as ROM or EPROM, so it survives power-off. The [[02-boot-process|bootstrap program]] is firmware.

## BIOS

**BIOS** stands for **Basic Input/Output System**. It is also called the System BIOS, ROM BIOS, BIOS ROM, or PC BIOS.

- It is **firmware** that comes **pre-installed on the motherboard**.
- It has two jobs:
  1. **Hardware initialization** during the booting process (power-on startup).
  2. **Runtime services** for operating systems and programs.
- During boot, it finds the primary bootable device and runs the bootstrap code in that device's [[05-mbr-and-gpt|MBR]].

> [!info] Beyond the slides: POST
> The BIOS's hardware check at power-on is called the **POST** (power-on self-test). It is why some PCs beep or show error codes before anything boots.

## UEFI

**UEFI** stands for **Unified Extensible Firmware Interface**. It is the Unified EFI Forum's **replacement for the PC BIOS**.

- The [[05-mbr-and-gpt|GPT]] partition-table format is **part of the UEFI standard**.
- GPT is also used with some BIOSes, because MBR partition tables are limited to 32-bit sector addresses.

> [!info] Beyond the slides: how UEFI boots
> UEFI doesn't execute boot code from the MBR. It reads the GPT, finds the **EFI System Partition (ESP)**, a small FAT32 partition, and runs a bootloader **file** stored there. Examples are GRUB's `grubx64.efi` and the Windows Boot Manager. The ESP appears on slide 1.20 as `sda1  fat32  EFI  ~99 MiB` (see [[06-grub|GRUB]]). UEFI also supports **Secure Boot**, which only runs signed bootloaders.

## CSM: running old BIOS-style boots on UEFI

**CSM** stands for **Compatibility Support Module**. It lets UEFI firmware **emulate a legacy BIOS**, so it can boot disks and operating systems that expect a BIOS and an MBR.

- **"UEFI with CSM"** usually means **mixed mode**. Both native UEFI boot and CSM-based (BIOS) boot are available. The boot menu then shows a mix of native UEFI boot entries and CSM "bootable disk" entries.
- **Disabling CSM** lets certain **UEFI-only features** work, such as **fast boot**. At the same time, it prevents some BIOS-only features.
- **Fast boot** was made for Windows 10 and can be somewhat buggy. It can break the boot process.

## BIOS vs UEFI

| | Legacy BIOS | UEFI |
| --- | --- | --- |
| Status | The original PC firmware | Its replacement |
| Boots from | Boot code in the MBR (sector 0) | A bootloader file on the EFI System Partition |
| Partition table | MBR | GPT (MBR via CSM) |
| Largest bootable disk | 2 TiB (MBR limit) | Effectively unlimited (GPT) |
| Old OSes | Native | Through CSM |

## In practice: a bootable USB with Rufus

**Rufus** is a tool that writes an OS installer image (an `.iso` file) to a USB stick so a computer can boot from it. Slide 1.23 shows two setups:

| Image | Partition scheme | Target system | File system |
| --- | --- | --- | --- |
| Windows 11 | **GPT** | **UEFI (non CSM)** | NTFS |
| Ubuntu 22.04 | **MBR** | **BIOS or UEFI** | FAT32 |

The rule of thumb: the **partition scheme must match the firmware**.
- **GPT** is for **UEFI** machines.
- **MBR** works for **BIOS**, and for UEFI machines with CSM.

The Ubuntu example also sets a **persistent partition** (4 GB), so the live USB can keep changes between boots. Both examples use the default **cluster size** of 4096 bytes ([[04-disk-structure|clusters]]).

## Check yourself

> [!question]- What is firmware?
> Software embedded directly in hardware, stored in nonvolatile memory, that controls the hardware's basic operations.

> [!question]- What are the BIOS's two jobs?
> Initializing the hardware during boot, and providing runtime services to the OS and programs.

> [!question]- What does CSM do, and what happens if you disable it?
> It lets UEFI firmware boot legacy BIOS/MBR systems. Disabling it enables UEFI-only features such as fast boot but prevents BIOS-only features.

> [!question]- In Rufus, which partition scheme should you choose for a UEFI-only (non-CSM) machine?
> GPT.

---
[[02-boot-process|← The boot process]] · [[00-overview|Overview]] · [[04-disk-structure|Next: Disk structure →]]
