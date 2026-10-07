---
title: "Chapter 1 glossary"
description: Every term and acronym from chapter 1 in alphabetical order, each with a one-line definition and a link to the note that explains it.
tags: [operating-systems, reference]
---
# Chapter 1 glossary

*Part of [[00-overview|Chapter 1 overview]]*

Each term links to the note where it's explained.

## A–C

- **Application program**: a program not associated with operating the system, such as a browser or a game. → [[01-what-is-an-operating-system|What is an OS?]]
- **Asymmetric clustering**: one machine sits in hot standby, monitoring the active server and taking over if it fails. → [[15-clustered-systems|Clustered systems]]
- **Asymmetric multiprocessing (AMP)**: each processor is assigned a specific task. → [[13-multiprocessor-systems|Multiprocessor systems]]
- **Asynchronous I/O**: control returns to the program without waiting for the I/O to complete. → [[09-io-structure|I/O structure]]
- **BIOS** (Basic Input/Output System): motherboard firmware that initializes hardware at boot and provides runtime services. → [[03-bios-and-uefi|BIOS and UEFI]]
- **Bit / byte / word**: the basic 0/1 unit; 8 bits; the architecture's native data unit. → [[11-storage-structure|Storage structure]]
- **Bootloader**: a vendor-proprietary image that brings up the kernel. GRUB is one. → [[02-boot-process|The boot process]]
- **Bootstrap program**: the first program run at power-up. It is stored in ROM/EPROM, initializes the system, and loads the kernel. → [[02-boot-process|The boot process]]
- **Cache / caching**: copying data in use from slower to faster storage, and checking the fast copy first. → [[12-storage-hierarchy-and-caching|Storage hierarchy and caching]]
- **CHS** (Cylinder–Head–Sector): the old way of addressing a sector by its physical position. → [[04-disk-structure|Disk structure]]
- **Clustered system**: multiple whole computers working together, usually sharing storage over a SAN. → [[15-clustered-systems|Clustered systems]]
- **Cluster** (disk): a group of sectors, and the unit a file system allocates. → [[04-disk-structure|Disk structure]]
- **Concurrent**: two or more actions in progress at the same time. → [[14-cores-threads-concurrency|Concurrency and parallelism]]
- **Control program**: the view of the OS as controlling program execution to prevent errors and misuse. → [[01-what-is-an-operating-system|What is an OS?]]
- **Core**: a physical unit that executes instructions independently. → [[14-cores-threads-concurrency|Cores and threads]]
- **CPU scheduling**: choosing which ready process in memory runs next. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]
- **CSM** (Compatibility Support Module): lets UEFI firmware boot legacy BIOS-style systems. → [[03-bios-and-uefi|BIOS and UEFI]]

## D–G

- **Device controller**: hardware in charge of one type of device, with a local buffer. → [[07-computer-system-organization|Computer-system organization]]
- **Device driver**: OS software that gives the kernel a uniform interface to a device controller. → [[07-computer-system-organization|Computer-system organization]]
- **Device-status table**: one entry per I/O device, with its type, address, and state. → [[09-io-structure|I/O structure]]
- **DLM** (Distributed Lock Manager): prevents conflicting operations on shared data in a cluster. → [[15-clustered-systems|Clustered systems]]
- **DMA** (Direct Memory Access): the controller moves whole blocks straight to memory, with one interrupt per block. → [[10-dma|DMA]]
- **Dual-mode operation**: user mode and kernel mode, distinguished by a hardware mode bit. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **EPROM** (Erasable Programmable Read-Only Memory): nonvolatile memory that holds firmware. → [[02-boot-process|The boot process]]
- **Exception / trap**: a software-generated interrupt, caused by an error or a system call. → [[08-interrupts|Interrupts]]
- **Extended partition**: an MBR partition entry that holds further logical partitions. → [[05-mbr-and-gpt|MBR and GPT]]
- **Fault tolerance**: continuing to operate despite a component failure. → [[13-multiprocessor-systems|Multiprocessor systems]]
- **Firmware**: software embedded in hardware to control its basic operations. → [[03-bios-and-uefi|BIOS and UEFI]]
- **GPT** (GUID Partition Table): the UEFI-era partition table, with 64-bit LBAs and 128 entries. → [[05-mbr-and-gpt|MBR and GPT]]
- **Graceful degradation**: service continues in proportion to the surviving hardware. → [[13-multiprocessor-systems|Multiprocessor systems]]
- **GRUB** (GRand Unified Bootloader): the Linux bootloader, split into `boot.img`, `core.img`, and `/boot/grub`. → [[06-grub|GRUB]]
- **GUID / UUID**: a globally (universally) unique identifier, used by GPT for disks and partitions. → [[05-mbr-and-gpt|MBR and GPT]]

## H–M

- **High availability**: a service that survives failures. → [[15-clustered-systems|Clustered systems]]
- **HPC** (High-Performance Computing): clusters running parallelized applications. → [[15-clustered-systems|Clustered systems]]
- **Interrupt**: a signal that makes the CPU pause, run a handler, and resume. → [[08-interrupts|Interrupts]]
- **Interrupt vector**: the table of interrupt service routine addresses. → [[08-interrupts|Interrupts]]
- **ISR** (Interrupt Service Routine): the code that handles one type of interrupt. → [[08-interrupts|Interrupts]]
- **Job scheduling**: choosing which jobs to bring from disk into memory. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]
- **Kernel**: the one program running at all times on the computer. → [[01-what-is-an-operating-system|What is an OS?]]
- **Kernel mode**: the privileged CPU mode the OS runs in. Mode bit = 0. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **LBA** (Logical Block Addressing): numbering sectors 0, 1, 2, …. → [[04-disk-structure|Disk structure]]
- **Magic number**: the 2-byte `0x55AA` signature at the end of the MBR. → [[05-mbr-and-gpt|MBR and GPT]]
- **Main memory**: the only large storage the CPU accesses directly. Random access and volatile. → [[11-storage-structure|Storage structure]]
- **Maskable interrupt**: an interrupt the CPU can temporarily turn off. → [[08-interrupts|Interrupts]]
- **MBR** (Master Boot Record): sector 0, 512 B = 446 B code + 64 B partition table + 2 B signature. → [[05-mbr-and-gpt|MBR and GPT]]
- **Mode bit**: the hardware bit showing user (1) or kernel (0) mode. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **Multicore**: several cores on one chip. → [[13-multiprocessor-systems|Multiprocessor systems]]
- **Multiprocessor** (parallel or tightly coupled system): several processors sharing memory. → [[13-multiprocessor-systems|Multiprocessor systems]]
- **Multiprogramming**: keeping several jobs in memory so the CPU always has one to run. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]

## N–S

- **NMI** (Non-Maskable Interrupt): an interrupt that can't be turned off, used for critical errors. → [[08-interrupts|Interrupts]]
- **Nonvolatile**: keeps its contents without power. → [[11-storage-structure|Storage structure]]
- **Parallel**: two or more actions executing simultaneously. → [[14-cores-threads-concurrency|Concurrency and parallelism]]
- **Partition table**: the record of how a disk is divided into partitions. → [[05-mbr-and-gpt|MBR and GPT]]
- **Polling**: finding an interrupt's source by checking each device. → [[08-interrupts|Interrupts]]
- **Privileged instruction**: an instruction that runs only in kernel mode. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **Process**: a program loaded into memory and executing. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]
- **Protective MBR**: the MBR at LBA 0 of a GPT disk, which stops old tools from overwriting it. → [[05-mbr-and-gpt|MBR and GPT]]
- **Resource allocator**: the view of the OS as managing resources and settling conflicting requests. → [[01-what-is-an-operating-system|What is an OS?]]
- **ROM** (Read-Only Memory): nonvolatile memory holding the bootstrap firmware. → [[02-boot-process|The boot process]]
- **Rufus**: a tool that writes OS images to bootable USB drives. → [[03-bios-and-uefi|BIOS and UEFI]]
- **SAN** (Storage-Area Network): shared storage for the nodes of a cluster. → [[15-clustered-systems|Clustered systems]]
- **Secondary storage**: large nonvolatile storage that extends main memory, such as HDDs and SSDs. → [[11-storage-structure|Storage structure]]
- **Sector**: the smallest unit a disk reads or writes, typically 512 or 4096 bytes. → [[04-disk-structure|Disk structure]]
- **SMP** (Symmetric Multiprocessing): every processor performs all tasks. → [[13-multiprocessor-systems|Multiprocessor systems]]
- **SSD** (Solid-State Disk): nonvolatile storage, faster than a hard disk. → [[11-storage-structure|Storage structure]]
- **Swapping**: moving processes between memory and disk when they don't all fit. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]
- **Symmetric clustering**: all nodes run applications and monitor each other. → [[15-clustered-systems|Clustered systems]]
- **Synchronous I/O**: control returns only after the I/O completes. → [[09-io-structure|I/O structure]]
- **System call**: a program's request for an OS service. It traps into kernel mode. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **System program**: ships with the OS but isn't part of the kernel. → [[01-what-is-an-operating-system|What is an OS?]]

## T–Z

- **Thread**: a logical software unit of execution that runs on a core. → [[14-cores-threads-concurrency|Cores and threads]]
- **Timer**: a privileged, clock-decremented counter that interrupts at zero, so the OS regains control. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **Timesharing** (multitasking): switching jobs so often that users can interact with each one. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]
- **Track**: one concentric ring on a disk surface. → [[04-disk-structure|Disk structure]]
- **UEFI** (Unified Extensible Firmware Interface): the replacement for the BIOS. → [[03-bios-and-uefi|BIOS and UEFI]]
- **User mode**: the unprivileged CPU mode applications run in. Mode bit = 1. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **VBR** (Volume Boot Record): the boot sector at the start of a partition. → [[05-mbr-and-gpt|MBR and GPT]]
- **Virtual memory**: running processes that aren't completely in memory. → [[16-multiprogramming-and-timesharing|Multiprogramming and timesharing]]
- **VMM** (Virtual Machine Manager) mode: an extra CPU mode for guest VMs, between user and kernel privileges. → [[17-dual-mode-and-timer|Dual mode and the timer]]
- **Volatile**: loses its contents without power. → [[11-storage-structure|Storage structure]]
- **von Neumann architecture**: instructions and data are stored in the same memory. → [[07-computer-system-organization|Computer-system organization]]

---
[[17-dual-mode-and-timer|← Dual mode and the timer]] · [[00-overview|Overview]] · [[chapter-1-summary|Chapter 1 Summary →]]
