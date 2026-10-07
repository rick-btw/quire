---
title: "What is an operating system?"
description: The definition of an OS, its goals, the four components of a computer system, how the OS looks from different points of view, and what the kernel is.
tags: [operating-systems, os-basics]
---
# What is an operating system?

*Slides 1.4–1.9 · Part of [[00-overview|Chapter 1 overview]]*

## Definition

An **operating system** is a program that acts as an **intermediary between a user of a computer and the computer hardware**.

### Goals

1. **Execute user programs** and make solving user problems easier.
2. Make the computer system **convenient** to use.
3. Use the computer hardware in an **efficient** manner.

Goals 2 and 3 can pull against each other. Which one wins depends on the point of view, covered [below](#what-the-os-does-depends-on-the-point-of-view).

## The four components of a computer system

| Component | Role | Examples |
| --- | --- | --- |
| **Hardware** | Provides the basic computing resources | CPU, memory, I/O devices |
| **Operating system** | Controls and coordinates the use of the hardware among the various applications and users | Linux, Windows, macOS |
| **Application programs** | Define how the system's resources are used to solve the users' computing problems | Word processors, compilers, web browsers, database systems, video games |
| **Users** | Use the system | People, machines, other computers |

The figure on slide 1.6 stacks them like this:

```text
users        user 1   user 2   user 3   …   user n
               │        │        │            │
programs     compiler · assembler · text editor · … · database system
             (system and application programs)
                          │
             operating system
                          │
             computer hardware
```

Users talk to programs, and programs reach the hardware **only through the OS**.

## What the OS does depends on the point of view

| System | What it is optimized for |
| --- | --- |
| **Personal computer** (one user) | Convenience, ease of use, and good performance. Users don't care about *resource utilization* |
| **Shared computer** (mainframe, minicomputer) | Keeping **all** users happy, so resources must be used well and shared fairly |
| **Workstation** | Has dedicated resources but often uses shared resources from servers, so it balances both |
| **Handheld** (phone, tablet) | Resource poor, so optimized for **usability and battery life** |
| **Embedded** (in devices and cars) | Little or no user interface. They run without user intervention |

## Two definitions from the system's point of view

**The OS is a resource allocator.**
- It manages all resources: CPU time, memory, storage, and I/O devices.
- It decides between conflicting requests so resources are used **efficiently and fairly**.

**The OS is a control program.**
- It controls the execution of programs to **prevent errors and improper use** of the computer.
- The hardware features that make this control possible are [[17-dual-mode-and-timer|dual-mode operation and the timer]].

## The kernel

There is **no universally accepted definition** of an operating system. "Everything a vendor ships when you order an operating system" is a good approximation, but what vendors ship varies wildly.

The most common definition is narrower:

> The **kernel** is *the one program running at all times on the computer*.

Everything else is one of two kinds of program:

| Kind | Meaning | Examples |
| --- | --- | --- |
| **Kernel** | Always running. Manages the hardware | The Linux kernel |
| **System program** | Ships with the OS but isn't part of the kernel | A shell, a file manager, `ls` |
| **Application program** | Everything not associated with operating the system | A web browser, a game |

How the kernel first gets into memory is the subject of [[02-boot-process|the boot process]].

## Check yourself

> [!question]- What are the three goals of an operating system?
> Execute user programs and make solving user problems easier, make the system convenient to use, and use the hardware efficiently.

> [!question]- Name the four components of a computer system, from the bottom up.
> Hardware → operating system → application programs → users.

> [!question]- What are the two system-view definitions of an OS?
> A **resource allocator**, which manages resources and settles conflicting requests efficiently and fairly. A **control program**, which controls program execution to prevent errors and improper use.

> [!question]- Why would a phone's OS make different trade-offs from a mainframe's?
> A phone has one user and few resources, so it optimizes usability and battery life. A mainframe is shared by many users, so it optimizes resource utilization and fairness.

> [!question]- What is the kernel, and what are the other kinds of programs?
> The kernel is the one program running at all times. Other programs are either system programs, which ship with the OS, or application programs.

---
[[00-overview|← Overview]] · [[02-boot-process|Next: The boot process →]]
