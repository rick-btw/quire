---
title: "Quiz 3: Chapter 2, Slides 48–71"
description: Quiz 3 prep for chapter 2, slides 2.48–2.71. Covers the six OS structures (simple, UNIX/monolithic, layered, microkernel, modules, hybrid), UNIX vs Linux, and system boot, with likely quiz questions and 5-minute model answers.
tags: [operating-systems, quiz-prep]
---
# Quiz 3: Chapter 2, Slides 48–71

> [!abstract] This note is for **Quiz 3**: chapter 2, **slides 2.48–2.71** of the updated 71-slide deck
> Slides 2.48–2.53 (implementation, MS-DOS, UNIX features) were also in Quiz 2's range, so they're recapped briefly here. The new material is **2.54–2.70**. Earlier parts of the chapter: [[chapter-2-summary|Chapter 2 Summary]] (Quiz 2) and [[chapter-2-practice-exercises|Chapter 2 Practice Exercises]].

> [!warning] Last year's Quiz 3 asked: **"Operating system structures"**
> A numbered list of **all six structures**, each with a few lines, got **100/100 ("Excellent")**:
> 1. simple
> 2. more complex (UNIX), with its features
> 3. layered
> 4. microkernel, with its pros and cons
> 5. modules
> 6. hybrid, with its features
>
> This week's range covers exactly the same slides, so **know the [six structures](#the-six-structures-at-a-glance) cold**. Then see [likely questions](#likely-quiz-questions-and-5-minute-answers).

## The six structures at a glance

A general-purpose OS is a **very large program**, so how it's organized matters. The memory aid is **S-U-L-M-M-H**: Simple, UNIX, Layered, Microkernel, Modules, Hybrid.

| # | Structure | Core idea | Example | Plus | Minus |
| --- | --- | --- | --- | --- | --- |
| 1 | **Simple** | Most functionality in the least space. **Not divided into modules** | MS-DOS | Small | Interfaces and levels **not well separated**. Programs can reach the hardware |
| 2 | **UNIX (monolithic)** | **Two parts**: system programs + one big kernel that does everything below the system-call interface | Traditional UNIX, Linux | Fast: no internal message overhead | Huge single level, hard to maintain |
| 3 | **Layered** | Layer 0 = hardware … layer N = user interface. **Each layer uses only lower layers** | — (an abstraction) | Simple to build and **debug** | Hard to define the layers. **Slower** (passes through every layer) |
| 4 | **Microkernel** | Move **as much as possible out of the kernel** into user space. Parts talk by **message passing** | Mach, macOS Darwin | Extensible, portable, **reliable, secure** | **Performance overhead** of user↔kernel messaging |
| 5 | **Modules** | **Loadable kernel modules**: separate core components, known interfaces, **loaded as needed** | Linux, Solaris | Like layers but **more flexible** | — |
| 6 | **Hybrid** | **Combines** approaches (microkernel + monolithic) | Windows, macOS, Linux | Fast, secure, easy to manage | — |

## 1. Implementation (slide 2.48, recap)

- **Languages over time:** early OSes were written in **assembly**, then **Algol and PL/1**, and now **C and C++**.
- **Usually a mix:**
  - the **lowest levels in assembly**
  - the **main body in C**
  - **system programs** in C, C++, and scripting languages (Perl, Python, shell)
- **High-level languages** are **easier to port** to other hardware, **but slower**.
- **Emulation** can let an OS run on non-native hardware.

## 2. Simple structure: MS-DOS (slides 2.50–2.51, recap)

- MS-DOS was **written to provide the most functionality in the least space**.
- It is **not divided into modules**.
- It has some structure, but its **interfaces and levels of functionality are not well separated**.

<svg viewBox="0 0 600 290" width="100%" style="max-width:600px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="MS-DOS layer structure: application program, resident system program, MS-DOS device drivers, ROM BIOS device drivers. Applications can bypass layers and reach the BIOS drivers directly." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q3-msdos-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q3-msdos-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<rect x="90" y="16" width="330" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="255.0" y="39.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">application program</text>
<rect x="90" y="84" width="330" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="255.0" y="107.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">resident system program</text>
<rect x="90" y="152" width="390" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="285.0" y="175.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">MS-DOS device drivers</text>
<rect x="40" y="220" width="520" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="300.0" y="243.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">ROM BIOS device drivers</text>
<path d="M255,52 V82" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-msdos-m)"/>
<path d="M255,120 V150" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-msdos-m)"/>
<path d="M255,188 V218" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-msdos-m)"/>
<path d="M420,26 H530 V218" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6;stroke-dasharray:5 4" marker-end="url(#q3-msdos-a)"/>
<path d="M420,42 H450 V150" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6;stroke-dasharray:5 4" marker-end="url(#q3-msdos-a)"/>
<path d="M90,102 H62 V218" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6;stroke-dasharray:5 4" marker-end="url(#q3-msdos-a)"/>
<path d="M150,276 H190" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6;stroke-dasharray:5 4"/>
<text x="200.0" y="280.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">applications can skip layers and reach the hardware directly</text>
</svg>

**History:**
- MS-DOS was a renamed **86-DOS**, written by **Tim Paterson** at Seattle Computer Products, first shipped in **August 1980**.
- Microsoft needed an OS for the **IBM PC**. It hired Paterson in **May 1981** and bought 86-DOS 1.10 for **$25,000** in **July 1981**.

## 3. UNIX (slides 2.52–2.56)

**Philosophy:** **simple, powerful tools that can be combined** to do complex tasks. UNIX was first developed in the **1960s**, and it is driven by a **command-line interface**.

**The six key features** (memory aid "MMS-SPC"):

| Feature | Meaning |
| --- | --- |
| **Multiuser** | Many users access the same system at once and share resources |
| **Multitasking** | Many processes run at the same time |
| **Shell scripting** | A powerful scripting language to automate tasks |
| **Security** | File permissions, user accounts, network security |
| **Portability** | Runs on everything from embedded systems to mainframes |
| **Communication** | Commands such as `write` and `mail` |

### UNIX's structure (new in Quiz 3)

The original UNIX was **limited by hardware functionality**, so it had **limited structuring**. It consists of **two separable parts**:
1. **System programs.**
2. **The kernel**: **everything below the system-call interface and above the physical hardware**. It provides the **file system, CPU scheduling, memory management**, and other OS functions. That is **a large number of functions in one level**.

The slide sums it up as **"beyond simple but not fully layered"** (slide 2.55):

<svg viewBox="0 0 680 356" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Traditional UNIX structure: users, then shells, compilers and system libraries, then the kernel between the system-call interface and the kernel interface to the hardware, then terminal, device and memory controllers." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q3-unix-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q3-unix-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<rect x="56" y="10" width="604" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="358.0" y="30.0" text-anchor="middle" style="fill:var(--text-muted, #777)">(the users)</text>
<rect x="56" y="48" width="604" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="358.0" y="70.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">shells and commands · compilers and interpreters · system libraries</text>
<rect x="56" y="92" width="604" height="198" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<rect x="56" y="92" width="604" height="28" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="358.0" y="111.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-style:italic">system-call interface to the kernel</text>
<rect x="56" y="262" width="604" height="28" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="358.0" y="281.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-style:italic">kernel interface to the hardware</text>
<path d="M257.3,120 V262" style="fill:none;stroke:var(--accent, #6c99bb);stroke-opacity:0.6"/>
<path d="M458.7,120 V262" style="fill:none;stroke:var(--accent, #6c99bb);stroke-opacity:0.6"/>
<text x="156.7" y="164.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">signals</text>
<text x="156.7" y="185.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">terminal handling</text>
<text x="156.7" y="206.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">character I/O system</text>
<text x="156.7" y="227.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">terminal drivers</text>
<text x="358.0" y="164.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">file system</text>
<text x="358.0" y="185.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">swapping</text>
<text x="358.0" y="206.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">block I/O system</text>
<text x="358.0" y="227.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">disk and tape drivers</text>
<text x="559.3" y="164.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">CPU scheduling</text>
<text x="559.3" y="185.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">page replacement</text>
<text x="559.3" y="206.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">demand paging</text>
<text x="559.3" y="227.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">virtual memory</text>
<rect x="56.0" y="298" width="201.33333333333334" height="48" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="156.7" y="317.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">terminal controllers</text>
<text x="156.7" y="335.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">terminals</text>
<rect x="257.33333333333337" y="298" width="201.33333333333334" height="48" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="358.0" y="317.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">device controllers</text>
<text x="358.0" y="335.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">disks and tapes</text>
<rect x="458.6666666666667" y="298" width="201.33333333333334" height="48" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="559.3" y="317.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">memory controllers</text>
<text x="559.3" y="335.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">physical memory</text>
<path d="M48,92 H40 V290 H48" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<text x="26.0" y="191.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-weight:600" transform="rotate(-90 26 191)">kernel</text>
</svg>

**The kernel's block diagram (slide 2.56):**

<svg viewBox="0 0 680 466" width="100%" style="max-width:680px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="UNIX kernel block diagram: user programs and libraries enter through the system-call interface to the file subsystem (buffer cache, character and block device drivers) and the process control subsystem (inter-process communication, scheduler, memory management), which use hardware control to reach the hardware." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q3-kblock-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q3-kblock-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<path d="M10,72 H670" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:4 4"/>
<text x="14.0" y="64.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:11px">user level</text>
<text x="14.0" y="88.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:11px">kernel level</text>
<path d="M10,418 H670" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:4 4"/>
<text x="14.0" y="410.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:11px">kernel level</text>
<text x="14.0" y="434.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:11px">hardware level</text>
<rect x="140" y="18" width="180" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="230.0" y="39.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">user programs</text>
<rect x="460" y="18" width="150" height="34" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="535.0" y="39.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">libraries</text>
<path d="M320,35 H457" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)"/>
<rect x="110" y="96" width="540" height="30" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="380.0" y="116.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">system-call interface</text>
<path d="M535,55 V93" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<rect x="110" y="156" width="250" height="60" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="235.0" y="190.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">file subsystem</text>
<rect x="400" y="156" width="250" height="190" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="525.0" y="181.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">process control subsystem</text>
<rect x="425" y="198" width="200" height="36" rx="5" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:4 4"/>
<text x="525.0" y="221.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">inter-process communication</text>
<rect x="425" y="246" width="200" height="36" rx="5" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:4 4"/>
<text x="525.0" y="269.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">scheduler</text>
<rect x="425" y="294" width="200" height="36" rx="5" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:4 4"/>
<text x="525.0" y="317.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">memory management</text>
<path d="M235,129 V153" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<path d="M525,129 V153" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<rect x="240" y="244" width="120" height="30" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="300.0" y="264.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">buffer cache</text>
<path d="M300,219 V241" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<rect x="110" y="300" width="250" height="46" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<path d="M110,322 H360" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M235,300 V322" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<text x="172.0" y="316.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">character</text>
<text x="297.0" y="316.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">block</text>
<text x="235.0" y="339.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">device drivers</text>
<path d="M300,277 V297" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<path d="M150,219 V297" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<path d="M360,190 L397,224" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)"/>
<rect x="110" y="376" width="540" height="30" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="380.0" y="396.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">hardware control</text>
<path d="M235,349 V373" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<path d="M525,349 V373" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-kblock-m)" marker-start="url(#q3-kblock-m)"/>
<rect x="110" y="428" width="540" height="28" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="380.0" y="447.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">hardware</text>
</svg>

- **User level:** user programs and **libraries**. They enter the kernel through the **system-call interface**.
- **Kernel level**, which has two main subsystems:
  - **File subsystem.** It sits on top of a **buffer cache** and the **device drivers** (character and block).
  - **Process control subsystem.** It contains **inter-process communication**, the **scheduler**, and **memory management**.
- **Hardware control** connects both subsystems to the **hardware**.

> [!info] Beyond the slides: "monolithic"
> A kernel like this, with all OS services in **one large program running in kernel mode**, is called **monolithic**. The textbook's verdict is that it's **hard to implement and maintain**, but **fast**: there is very little overhead in the system-call interface or in communication inside the kernel. That speed is why Linux and Windows still keep most of their services in one kernel ([hybrid](#7-hybrid-systems-slides-266269)).

### UNIX vs Linux (slides 2.57–2.60)

| | **Linux** | **UNIX** |
| --- | --- | --- |
| Source code | **Freely available** | **Not freely available** to the general public |
| Interface | **GUI and CLI** | **CLI only** (text-based) |
| Portability | **Portable**, flexible, runs on different hardware | **Not portable** |
| Kernel | **Monolithic**: all services in a single kernel | **Modular**: independent modules loaded and unloaded dynamically |
| Hardware | **Much broader** hardware support. Designed for **commodity hardware** (PCs, servers) | Originally designed for **large, expensive mainframes** |

> [!note] Two contradictions inside the deck
> - Slide 2.53 lists **portability** as a key UNIX feature, and slide 2.10 says UNIX has optional GUIs (CDE, KDE, GNOME). Yet slides 2.57 and 2.60 say UNIX is "not portable" and "only CLI".
> - Slide 2.58 calls the Linux kernel monolithic and UNIX modular, but slides 2.64 and 2.69 say **Linux uses loadable kernel modules**.
>
> **On the quiz, write what each slide says when you're asked about that topic.** If you have time, add the qualifier "Linux is monolithic **plus** loadable modules".

## 4. Layered approach (slide 2.61)

- The OS is **divided into layers (levels)**, each **built on top of lower layers**.
- **Layer 0 is the hardware. Layer N is the user interface.**
- With modularity, layers are chosen so that **each uses functions and services of only lower-level layers**.

<svg viewBox="0 0 620 340" width="100%" style="max-width:620px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Layered operating system drawn as concentric rings: layer 0 (hardware) at the centre, layer 1, more layers, and layer N (the user interface) on the outside. Each layer uses only the layers below it." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q3-layers-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q3-layers-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<circle cx="190" cy="170" r="150" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<circle cx="190" cy="170" r="112" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb);stroke-dasharray:4 4"/>
<circle cx="190" cy="170" r="74" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<circle cx="190" cy="170" r="36" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="190.0" y="36.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">layer N</text>
<text x="190.0" y="51.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">user interface</text>
<text x="190.0" y="82.0" text-anchor="middle" style="fill:var(--text-muted, #777)">· · ·</text>
<text x="190.0" y="120.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">layer 1</text>
<text x="190.0" y="167.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">layer 0</text>
<text x="190.0" y="182.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px;font-weight:600">hardware</text>
<text x="392.0" y="54.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">layer N: user interface</text>
<path d="M400,68 V266" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-layers-m)"/>
<text x="414.0" y="153.5" text-anchor="start" style="fill:var(--text-muted, #777)">each layer uses only the</text>
<text x="414.0" y="171.5" text-anchor="start" style="fill:var(--text-muted, #777)">functions and services</text>
<text x="414.0" y="189.5" text-anchor="start" style="fill:var(--text-muted, #777)">of the layers below it</text>
<text x="392.0" y="290.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">layer 0: hardware</text>
</svg>

**Advantage and disadvantages** (from the textbook; this is also practice exercise 2.8):
- **Advantage: simplicity of construction and debugging.**
  - Debug layer 1 using only the hardware, then layer 2 assuming layer 1 works, and so on.
  - An error found while debugging a layer must be **in that layer**.
- **Disadvantage 1: the layers are hard to define**, because each layer may only use the ones below it, so the order needs careful planning.
- **Disadvantage 2: it is less efficient.** A call passes down through every layer, and each adds overhead.

## 5. Microkernel (slides 2.62–2.63)

- **Moves as much as possible out of the kernel into user space.** The kernel keeps only the bare minimum.
- **Communication** between user modules happens through **message passing**, via the microkernel.
- **Mach** is the classic microkernel. The **Mac OS X kernel (Darwin)** is partly based on Mach.

<svg viewBox="0 0 730 330" width="100%" style="max-width:730px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Microkernel structure: application program, file system and device driver run in user mode and exchange messages through the microkernel, which keeps only interprocess communication, memory management and CPU scheduling in kernel mode above the hardware." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q3-micro-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q3-micro-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<rect x="40" y="20" width="170" height="48" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="125.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">Application program</text>
<rect x="250" y="20" width="170" height="48" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="335.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">File system</text>
<rect x="460" y="20" width="170" height="48" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="545.0" y="49.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">Device driver</text>
<rect x="20" y="110" width="630" height="140" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<ellipse cx="125.0" cy="190.0" rx="88" ry="27" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="125.0" cy="190.0" rx="88" ry="27" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="125.0" y="186.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">interprocess</text>
<text x="125.0" y="202.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">communication</text>
<ellipse cx="335.0" cy="190.0" rx="88" ry="27" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="335.0" cy="190.0" rx="88" ry="27" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="335.0" y="186.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">memory</text>
<text x="335.0" y="202.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">management</text>
<ellipse cx="545.0" cy="190.0" rx="88" ry="27" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="545.0" cy="190.0" rx="88" ry="27" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="545.0" y="186.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">CPU</text>
<text x="545.0" y="202.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">scheduling</text>
<text x="335.0" y="240.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-weight:600">microkernel</text>
<path d="M110,71 V132 H320 V71" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6;stroke-dasharray:5 4" marker-end="url(#q3-micro-a)" marker-start="url(#q3-micro-a)"/>
<path d="M350,71 V132 H530 V71" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6;stroke-dasharray:5 4" marker-end="url(#q3-micro-a)" marker-start="url(#q3-micro-a)"/>
<text x="215.0" y="125.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">messages</text>
<text x="440.0" y="125.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">messages</text>
<rect x="20" y="280" width="630" height="36" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="335.0" y="303.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c))">hardware</text>
<path d="M125,253 V277" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-micro-m)" marker-start="url(#q3-micro-m)"/>
<path d="M545,253 V277" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q3-micro-m)" marker-start="url(#q3-micro-m)"/>
<path d="M660,20 H668 V68 H660" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<text x="676.0" y="40.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">user</text>
<text x="676.0" y="56.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">mode</text>
<path d="M660,110 H668 V250 H660" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<text x="676.0" y="176.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">kernel</text>
<text x="676.0" y="192.5" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">mode</text>
</svg>

In the slide's figure, **file systems and device drivers run in user mode**. Only **IPC, memory management, and CPU scheduling** stay in the microkernel.

| **Benefits** | **Detriment** |
| --- | --- |
| **Easier to extend**: new services are added in user space, so the kernel doesn't change | **Performance overhead** of user-space ↔ kernel-space communication. Every request becomes messages passed through the kernel |
| **Easier to port** to new architectures, because the kernel is small | |
| **More reliable**: less code runs in kernel mode, so a failing service doesn't crash the OS | |
| **More secure** | |

## 6. Modules (slides 2.64–2.65)

Many modern OSes implement **loadable kernel modules (LKMs)**:
- They use an **object-oriented approach**.
- **Each core component is separate.**
- Each **talks to the others over known interfaces**.
- Each is **loadable as needed within the kernel**: at boot, or while the system is running.

Overall this is **similar to layers, but more flexible**. Examples are **Linux and Solaris**.

**Solaris (slide 2.65):** a **core Solaris kernel** surrounded by **7 types of loadable modules**:

<svg viewBox="0 0 640 340" width="100%" style="max-width:640px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Solaris modular approach: a core Solaris kernel surrounded by seven loadable module types: scheduling classes, file systems, loadable system calls, executable formats, STREAMS modules, miscellaneous modules, device and bus drivers." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q3-solaris-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q3-solaris-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<path d="M320,175 L320.0,50.0" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M320,175 L495.9,97.1" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M320,175 L539.4,202.8" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M320,175 L417.6,287.6" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M320,175 L222.4,287.6" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M320,175 L100.6,202.8" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<path d="M320,175 L144.1,97.1" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3"/>
<ellipse cx="320.0" cy="50.0" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="320.0" cy="50.0" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="320.0" y="47.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">scheduling</text>
<text x="320.0" y="62.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">classes</text>
<ellipse cx="495.9" cy="97.1" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="495.9" cy="97.1" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="495.9" y="94.1" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">file</text>
<text x="495.9" y="109.1" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">systems</text>
<ellipse cx="539.4" cy="202.8" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="539.4" cy="202.8" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="539.4" y="199.8" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">loadable</text>
<text x="539.4" y="214.8" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">system calls</text>
<ellipse cx="417.6" cy="287.6" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="417.6" cy="287.6" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="417.6" y="284.6" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">executable</text>
<text x="417.6" y="299.6" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">formats</text>
<ellipse cx="222.4" cy="287.6" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="222.4" cy="287.6" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="222.4" y="284.6" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">STREAMS</text>
<text x="222.4" y="299.6" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">modules</text>
<ellipse cx="100.6" cy="202.8" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="100.6" cy="202.8" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="100.6" y="199.8" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">miscellaneous</text>
<text x="100.6" y="214.8" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">modules</text>
<ellipse cx="144.1" cy="97.1" rx="76" ry="26" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="144.1" cy="97.1" rx="76" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="144.1" y="94.1" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">device and</text>
<text x="144.1" y="109.1" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">bus drivers</text>
<ellipse cx="320.0" cy="175.0" rx="88" ry="34" style="fill:var(--bg, var(--background-primary, #fff));stroke:none"/>
<ellipse cx="320.0" cy="175.0" rx="88" ry="34" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="320.0" y="171.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">core Solaris</text>
<text x="320.0" y="187.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">kernel</text>
</svg>

1. scheduling classes
2. file systems
3. loadable system calls
4. executable formats
5. STREAMS modules
6. miscellaneous modules
7. device and bus drivers

> [!info] Beyond the slides: why modules beat the other two
> - **Compared with layers:** any module can call any other module, not just the ones below it.
> - **Compared with a microkernel:** the modules run **inside the kernel**, so they don't need message passing, which makes them faster.
> - **The result:** you get a microkernel's flexibility (a small core plus add-ons) at a monolithic kernel's speed.

## 7. Hybrid systems (slides 2.66–2.69)

The slides describe hybrids in two ways. **Learn both**. Last year's full-mark answer used the first.

### The slides' definition (2.66–2.68)

- A hybrid OS **combines features of both microkernel and monolithic OSes into one space**.
- It has **two OSes running on one machine**: **one boots the system**, and **the other uses the remaining resources**.
- **What goes where:**
  - **Inside the kernel (kernel mode):** **bus controllers and virtual file systems**. This keeps the kernel small.
  - **Outside the kernel:** **storage drivers and file-system drivers**.
- **What it's used for:**
  - It manages normal files and is also used to **host and run web applications**. Online servers use hybrid technology.
  - It **uses battery well** and runs on **lightweight hardware**, namely the **ARM processors** in smartphones and tablets.

**The eight features (slide 2.68):**
1. The number of **layers is small**.
2. The **kernel is fast**.
3. **Higher security.**
4. **Easy to manage.**
5. **Runs two OSes in one machine.**
6. **Runs web applications.**
7. **Resources are better managed.**
8. **CPU time is divided among the different OSes.**

### The textbook's definition (2.69)

- **Most modern OSes aren't one pure model.** A hybrid **combines multiple approaches** to meet performance, security, and usability needs.

| OS | How it's hybrid |
| --- | --- |
| **Linux, Solaris** | Kernel in kernel address space, so **monolithic**, **plus modular** for dynamically loading functionality |
| **Windows** | **Mostly monolithic, plus a microkernel** for its different subsystem "personalities" |
| **Mac OS X** | Layered: the **Aqua** UI plus the **Cocoa** programming environment on top. Below them, a kernel made of the **Mach microkernel + BSD UNIX parts**, plus the **I/O Kit** and dynamically loadable modules called **kernel extensions** |

> [!note] About "two OSes on one machine"
> Textbooks don't define a hybrid kernel as two OSes on one machine. That description is closer to virtualization or dual-booting. The real meaning is slide 2.69's: one kernel that mixes approaches. Still, it's on the lecturer's slides, and last year's answer included it and got full marks. **Write the lecturer's version, and add the 2.69 examples if you have time.**

## 8. System boot (slide 2.70)

- At power-on, **execution starts at a fixed memory location**. **Firmware ROM** holds the initial boot code.
- The OS must be made available to the hardware so the hardware can start it.
- The **bootstrap loader** is a small piece of code stored in **ROM or EEPROM**. It **locates the kernel, loads it into memory, and starts it**.
- Sometimes it's a **two-step** process: ROM code loads a **boot block** at a fixed location on disk, and that **loads the bootstrap loader** from disk.
- **GRUB**, a common bootstrap loader, **allows selection of the kernel** from multiple disks, versions, and kernel options.
- Once the kernel loads, **the system is running**.

The full story is in chapter 1: [[02-boot-process|the boot process]], [[05-mbr-and-gpt|the MBR]] (the boot block), and [[06-grub|GRUB]]. Practice exercises 2.10 and 2.11 are about this slide ([[chapter-2-practice-exercises|answers]]).

## Comparing the main kernel designs

| | Monolithic (UNIX) | Layered | Microkernel | Modules |
| --- | --- | --- | --- | --- |
| What's in the kernel | Everything | Everything, split into ordered layers | Only IPC, memory management, scheduling | A small core + modules loaded as needed |
| How parts communicate | Direct function calls | Each layer calls only lower layers | **Message passing** | Direct calls over **known interfaces** |
| Speed | **Fastest** | Slower (layer overhead) | **Slowest** (message overhead) | Fast |
| Reliability and security | A bug anywhere can crash it all | Good | **Best**: services are isolated in user space | Medium |
| Extending it | Hard: rebuild the kernel | Hard | **Easy**: add a user-space service | **Easy**: load a module |

## Likely quiz questions and 5-minute answers

Ranked by likelihood. The first is last year's exact question.

> [!question]- 1. "Explain the operating-system structures." (last year's Quiz 3)
> 1. **Simple (MS-DOS):** most functionality in the least space. Not divided into modules. Levels and interfaces not well separated.
> 2. **More complex (UNIX):** two parts, system programs and the kernel. The kernel is everything between the system-call interface and the hardware (file system, CPU scheduling, memory management) in one level, so it's monolithic. Features: multiuser, multitasking, shell scripting, security, portability, communication.
> 3. **Layered:** layer 0 = hardware … layer N = user interface. Each layer uses only lower layers. Easy to debug, but hard to design and slower.
> 4. **Microkernel (Mach):** moves non-essential parts out of the kernel into user space, which communicate by message passing. Pros: easier to extend and port, more reliable and secure. Con: performance overhead.
> 5. **Modules (Linux, Solaris):** object-oriented. Separate core components talk over known interfaces and are loaded into the kernel as needed. Like layers but more flexible.
> 6. **Hybrid:** combines microkernel and monolithic. Bus controllers and the VFS are in the kernel; storage and file-system drivers are outside. Fast kernel, secure, easy to manage, better resource management. Examples: Windows, macOS (Mach + BSD).

> [!question]- 2. "What is a microkernel? Give its advantages and disadvantages."
> A microkernel moves as much as possible **from the kernel into user space**. The kernel keeps only **IPC, memory management, and CPU scheduling**. File systems, device drivers, and applications run in **user mode** and communicate by **message passing** through the kernel. Examples: **Mach**, and **Darwin** (macOS) is partly based on it.
> **Advantages:** (1) easier to extend, since services are added without changing the kernel; (2) easier to port to new hardware; (3) more reliable, because less code runs in kernel mode and a crashed service doesn't take down the OS; (4) more secure.
> **Disadvantage:** performance overhead from the user↔kernel message passing.

> [!question]- 3. "Compare monolithic and microkernel structures."
> - **Monolithic** (traditional UNIX, Linux): **all services in one big kernel**, communicating by direct calls. **Fast**, but large, hard to maintain, and one bug can crash the whole system.
> - **Microkernel** (Mach): **minimal kernel** (IPC, memory, scheduling). Other services run in **user space** and use **message passing**. **Reliable, secure, easy to extend and port**, but **slower** because of the messaging overhead.
> - **Hybrid** systems (Windows, macOS) combine the two to get speed and modularity.

> [!question]- 4. "What is a hybrid OS? List its features."
> A hybrid OS **combines microkernel and monolithic** features in one system. In the slides' description, two OSes run on one machine: one boots the system and the other uses the remaining resources. **Bus controllers and virtual file systems** stay in kernel mode, which keeps the kernel small. **Storage drivers and file-system drivers** run outside the kernel.
> **Features:** few layers, fast kernel, higher security, easy to manage, runs two OSes on one machine, runs web applications, better resource management, CPU time divided among the OSes.
> **Examples:** Linux and Solaris (monolithic + modules), Windows (monolithic + microkernel), macOS (Mach + BSD + kernel extensions).

> [!question]- 5. "Explain the layered approach. What are its advantages and disadvantages?"
> The OS is divided into layers. **Layer 0 is the hardware, layer N is the user interface**, and each layer uses only the functions of **lower** layers.
> **Advantage:** simple to build and **debug**. Layers are verified bottom-up, so an error is always in the layer being tested.
> **Disadvantages:** the layers are **hard to define** (a careful ordering is needed), and it's **less efficient**, because each call passes through several layers, adding overhead.

> [!question]- 6. "Explain loadable kernel modules (with an example)."
> A small **core kernel**, plus **separate components (modules)** that use an **object-oriented approach**, talk over **known interfaces**, and are **loaded into the kernel as needed**. It's **like layers but more flexible**: any module can call any other. It runs inside the kernel, so it doesn't pay a microkernel's messaging cost.
> **Example: Solaris**, whose core kernel has modules for scheduling classes, file systems, loadable system calls, executable formats, STREAMS, device and bus drivers, and miscellaneous modules. **Linux** works the same way.

> [!question]- 7. "Describe the structure of UNIX." or "How does UNIX differ from Linux?"
> **Structure:** two separable parts. **System programs**, and the **kernel**, which is everything below the system-call interface and above the hardware, providing the file system, CPU scheduling, and memory management as **one large level**: "beyond simple but not fully layered". Inside it are a file subsystem (buffer cache, character and block drivers) and a process-control subsystem (IPC, scheduler, memory management).
> **UNIX vs Linux, as the slides put it:** Linux source is free and UNIX's isn't. Linux has a GUI and CLI, UNIX a CLI only. Linux is portable and UNIX isn't. The Linux kernel is monolithic, UNIX's modular. Linux has broader hardware support and targets commodity PCs and servers, while UNIX was designed for mainframes.

> [!question]- 8. "Explain the system boot process."
> At power-on, execution starts at a **fixed memory location** in **firmware (ROM)**. A small **bootstrap loader** in ROM/EEPROM **locates the kernel, loads it into memory, and starts it**. Often it's **two steps**: ROM code loads a **boot block** from a fixed place on disk (the MBR), and that loads the full bootstrap loader. **GRUB** is a common bootstrap loader that lets the user **choose a kernel** (disk, version, options). Once the kernel is loaded, the system is running.
> If you have time, add chapter 1's steps: power on → BIOS → MBR → GRUB → kernel.

> [!tip] How to write it
> - **For "list the structures":** a numbered list of 6, a bolded name plus 1–2 lines each, and **one example OS per structure**. That's what got full marks last year.
> - **For a single structure:** definition → how it works → example → pros and cons.
> - **For "compare":** draw a quick 2-column table. It's the fastest way to show every difference.

## Numbers and keywords to memorize

| | |
| --- | --- |
| Structures | **6**: Simple, UNIX, Layered, Microkernel, Modules, Hybrid (S-U-L-M-M-H) |
| UNIX parts | **2**: system programs + kernel |
| UNIX features | **6**: MMS-SPC |
| Layers | **0** = hardware, **N** = user interface |
| Microkernel | Benefits **4** (extend, port, reliable, secure). Detriment **1** (performance). Example **Mach** / Darwin |
| Microkernel keeps | IPC, memory management, CPU scheduling |
| Solaris module types | **7** |
| Hybrid features | **8** |
| Hybrid: in the kernel / outside | Bus controllers + VFS / storage drivers + file-system drivers |
| Boot | Fixed memory location → ROM bootstrap → (boot block) → kernel. GRUB picks the kernel |
