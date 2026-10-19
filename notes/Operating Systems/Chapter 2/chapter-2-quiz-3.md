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

```text
application program ──────────────┐
      │                           │  applications can skip
resident system program ────────┐ │  layers and reach the
      │                         │ │  hardware directly
MS-DOS device drivers ────────┐ │ │
      │                       ▼ ▼ ▼
ROM BIOS device drivers
```

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

```text
                 (the users)
   shells and commands · compilers and interpreters · system libraries
 ┌═══════════════ system-call interface to the kernel ═══════════════┐
 │  signals, terminal   │  file system, swapping, │  CPU scheduling,     │
 │  handling, character │  block I/O system, disk │  page replacement,   │  ← the kernel:
 │  I/O, terminal       │  and tape drivers       │  demand paging,      │    one big level
 │  drivers             │                         │  virtual memory      │
 └═══════════════ kernel interface to the hardware ══════════════════┘
   terminal controllers │ device controllers      │ memory controllers
   terminals            │ disks and tapes         │ physical memory
```

**The kernel's block diagram (slide 2.56):**
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

```text
layer N   user interface
  …
layer 1
layer 0   hardware
```

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

```text
user mode     Application ⇠ messages ⇢ File system ⇠ messages ⇢ Device driver
            ─────────────────────────────────────────────────────────────
kernel mode   microkernel:  interprocess communication · memory management · CPU scheduling
            ─────────────────────────────────────────────────────────────
              hardware
```

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
