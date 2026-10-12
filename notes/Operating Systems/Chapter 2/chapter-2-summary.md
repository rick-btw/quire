---
title: "Chapter 2 Summary"
description: Quiz-prep summary of Silberschatz chapter 2, slides 1–48. Covers OS services, user interfaces, system calls, system programs, design and implementation, and simple and UNIX structures.
tags: [operating-systems, quiz-prep]
---
# Chapter 2 Summary

Source: the chapter 2 slides (*Operating-System Structures*) for *Operating System Concepts* (Silberschatz, 9th ed.), **slides 2.1–2.48**, the part covered in class so far. Chapter 1 is in [[00-overview|Chapter 1 overview]].

> [!warning] What last year's quizzes asked from this chapter
> - **Quiz 2: "The operating system services."** A list of all **9 services**, each with a one-line definition, got full marks. → [Section 1](#1-operating-system-services). This is the most likely question.
> - **Quiz 3: "Operating system structures."** It started with **simple structure (MS-DOS)** and **UNIX's features**, which are both in this week's range → [Section 6](#6-operating-system-structure). The rest of that answer (layered, microkernel, modules, hybrid) is after slide 48. There's a short preview of it at the end of that section, just in case.
>
> After those two, know **system calls** (the 6 types and the 3 ways to pass parameters), **policy vs mechanism**, and the **system-program categories**.

## 1. Operating system services

The OS provides **an environment for executing programs**, and **services** to programs and users. There are **9 services in two groups.**

### Group A: services that help the user (6)

| # | Service | What it means |
| --- | --- | --- |
| 1 | **User interface (UI)** | Almost every OS has one. There are three kinds: **CLI** (command line), **GUI** (graphical), and **batch** (commands stored in files and run together) |
| 2 | **Program execution** | Load a program into memory, run it, and end its execution, either **normally or abnormally** (indicating an error) |
| 3 | **I/O operations** | A running program may need I/O, involving a **file or an I/O device**. Users can't control devices directly, so the OS does it for them |
| 4 | **File-system manipulation** | Read, write, create, delete, and search **files and directories**, list file information, and manage **permissions** |
| 5 | **Communications** | Processes exchange information, **on the same computer or across a network**. This is done through **shared memory** or **message passing** (packets moved by the OS) |
| 6 | **Error detection** | The OS must be constantly aware of possible errors in the **CPU and memory hardware, I/O devices, and user programs**, and take the right action for each so computing stays **correct and consistent**. **Debugging facilities** help users and programmers |

### Group B: services that keep the system itself efficient, through resource sharing (3)

| # | Service | What it means |
| --- | --- | --- |
| 7 | **Resource allocation** | When **multiple users or jobs run concurrently**, each must get resources: **CPU cycles, main memory, file storage, I/O devices** |
| 8 | **Accounting** | Keep track of **which users use how much, and what kinds**, of resources |
| 9 | **Protection and security** | **Protection**: all access to system resources is controlled, and concurrent processes don't interfere with each other. **Security**: defending the system from outsiders, through **user authentication**, and defending external I/O devices from invalid access attempts |

> [!tip] Memorize the list as "UPIFCE + RAP"
> **U**ser interface, **P**rogram execution, **I**/O, **F**ile system, **C**ommunications, **E**rror detection. Those six help the user.
> **R**esource allocation, **A**ccounting, **P**rotection and security. Those three keep the system running.

How the services stack up, from slide 2.7:

```text
            user and other system programs
       ┌─────────────────────────────────────┐
       │  user interfaces: GUI · batch · CLI  │
       ├─────────────────────────────────────┤
       │            system calls              │
       ├─────────────────────────────────────┤
       │ services: program execution · I/O ·  │
       │ file systems · communication ·       │
       │ resource allocation · accounting ·   │
       │ error detection · protection/security│
       ├─────────────────────────────────────┤
       │          operating system            │
       └─────────────────────────────────────┘
                     hardware
```

Users reach the services through a **user interface**. Programs reach them through **system calls**.

## 2. User interfaces

| | CLI (command interpreter) | GUI | Touchscreen |
| --- | --- | --- | --- |
| How it works | **Direct command entry**. It fetches a command from the user and executes it | **Desktop metaphor**: icons stand for files, programs, and actions. Mouse buttons over objects do things | **Gestures**, a **virtual keyboard**, and **voice commands**. A mouse isn't possible or wanted |
| Notes | Can be implemented **in the kernel** or as a **system program**. Several flavors are called **shells** (e.g. Bourne shell, bash) | **Invented at Xerox PARC**. Usually used with mouse, keyboard, and monitor | Phones and tablets |

**How a CLI runs commands.** There are two designs:
- **Built-in commands**: the shell itself contains the code for each command.
- **Commands are names of programs**: the shell just finds a program with that name and runs it, as UNIX does. With this design, **adding a new command doesn't require changing the shell**.

**Many systems have both a CLI and a GUI:**
- **Windows** is a GUI with a CLI "command" shell.
- **Mac OS X** has the "Aqua" GUI, with a **UNIX kernel underneath** and shells available.
- **Unix and Linux** have a CLI with optional GUIs: **CDE, KDE, GNOME** (also Cinnamon, slide 2.13).

## 3. System calls

### What they are

- **System calls are the programming interface to the services the OS provides.**
- They are typically written in a high-level language (**C or C++**).
- Programs mostly use them **through an API** (Application Programming Interface), rather than calling them directly.
- A system call **switches the CPU into kernel mode** ([[17-dual-mode-and-timer|dual mode]], chapter 1).

**The three most common APIs:**

| API | For |
| --- | --- |
| **Win32 API** | Windows |
| **POSIX API** | POSIX-based systems: virtually all versions of UNIX, Linux, and Mac OS X |
| **Java API** | The Java virtual machine (JVM) |

> [!info] Beyond the slides: why go through an API?
> **Portability**: a program written against an API compiles on any system that supports that API. **Ease**: raw system calls are more detailed and harder to use. One API function can make several system calls.

**Example (slide 2.16): copying one file to another takes many system calls.**
1. Get the input file name: write a prompt to the screen, accept input.
2. Get the output file name: write a prompt, accept input.
3. Open the input file. If it doesn't exist, abort.
4. Create the output file. If it already exists, abort.
5. Loop: read from the input file, write to the output file, until a read fails.
6. Close the output file, write a completion message to the screen, and terminate normally.

Even a simple program makes system calls constantly.

**Example API function (slide 2.17):** `ssize_t read(int fd, void *buf, size_t count)` in `<unistd.h>`.
- `fd` is the file descriptor, `buf` is where the data goes, and `count` is the maximum number of bytes to read.
- It returns the number of bytes read, **0 at end of file**, and **−1 on error**.

### How they're implemented

- **Each system call has a number.** The **system-call interface** keeps a **table indexed by these numbers**.
- The system-call interface **invokes the system call in the kernel** and returns its **status and any return values**.
- **The caller needs to know nothing about how the system call is implemented.** It only has to obey the API and understand what the OS will do. Most details are **hidden by the API**, which is managed by the **run-time support library** (functions built into libraries that come with the compiler).

```text
user mode     user application
                  │ open()                        ▲
              ════╪══ system call interface ══════╪══
kernel mode       ▼                               │
              table[i] ──► implementation of open() ── return
```

**Library call vs system call (slide 2.29).** A C program calls `printf()`, a **library function** in the standard C library (user mode). `printf()` in turn calls the **`write()` system call** (kernel mode).

### Passing parameters to the OS: three methods

| Method | How | Limit on parameters? |
| --- | --- | --- |
| 1. **Registers** (the simplest) | Put the parameters in CPU registers | **Yes**: there may be more parameters than registers |
| 2. **Block / table in memory** | Store the parameters in a block in memory, and pass the **block's address in a register**. **Linux and Solaris** do this | **No** |
| 3. **Stack** | The program **pushes** the parameters onto the stack, and the OS **pops** them off | **No** |

```text
user program: store parameters at X, load address X into a register, call system call 13
                         │
operating system: read the register → use the parameters from table X → run the code for call 13
```

### The six types of system calls

| Type | Examples |
| --- | --- |
| **1. Process control** | Create and terminate a process. End, abort. Load, execute. Get and set process attributes. Wait for time. Wait for an event, signal an event. Allocate and free memory. Dump memory on error. Debugger, single-step execution. **Locks** for shared data |
| **2. File management** | Create and delete files. Open, close. Read, write, reposition. Get and set file attributes |
| **3. Device management** | Request and release a device. Read, write, reposition. Get and set device attributes. Logically attach or detach devices |
| **4. Information maintenance** | Get and set the time or date. Get and set system data. Get and set process, file, or device attributes |
| **5. Communications** | Create and delete a connection. Send and receive messages (**message-passing model**, client → server). Create and gain access to memory regions (**shared-memory model**). Transfer status information. Attach and detach remote devices |
| **6. Protection** | Control access to resources. Get and set permissions. Allow and deny user access |

**Windows vs UNIX system calls (slide 2.28):**

| Type | Windows | UNIX |
| --- | --- | --- |
| Process control | `CreateProcess()`, `ExitProcess()`, `WaitForSingleObject()` | `fork()`, `exit()`, `wait()` |
| File manipulation | `CreateFile()`, `ReadFile()`, `WriteFile()`, `CloseHandle()` | `open()`, `read()`, `write()`, `close()` |
| Device manipulation | `SetConsoleMode()`, `ReadConsole()`, `WriteConsole()` | `ioctl()`, `read()`, `write()` |
| Information maintenance | `GetCurrentProcessID()`, `SetTimer()`, `Sleep()` | `getpid()`, `alarm()`, `sleep()` |
| Communications | `CreatePipe()`, `CreateFileMapping()`, `MapViewOfFile()` | `pipe()`, `shmget()`, `mmap()` |
| Protection | `SetFileSecurity()`, `InitializeSecurityDescriptor()`, `SetSecurityDescriptorGroup()` | `chmod()`, `umask()`, `chown()` |

> [!info] Message passing vs shared memory (from the textbook)
> **Message passing** is easier to implement, especially between computers, and suits smaller amounts of data. **Shared memory** is faster, but the processes must make sure they don't write to the same place at the same time.

### File permissions in Linux (slides 2.24–2.25)

`ls -l` shows a 10-character string like `-rwxr-xr--`:

| Position | Meaning | In `-rwxr-xr--` |
| --- | --- | --- |
| 1 | **File type** | `-` regular file |
| 2–4 | **Owner (user)** permissions | `rwx`: read, write, execute |
| 5–7 | **Group** permissions | `r-x`: read, execute |
| 8–10 | **Others** (everyone else) | `r--`: read only |

**File types:**
- `-` regular file
- `d` directory
- `l` symbolic link
- `c` character device, `b` block device
- `s` socket, `p` named pipe

**Commands:**
- `chmod 755 script.sh` sets permissions numerically.
- `chmod u+x,g-w file` is symbolic: it adds execute for the owner and removes write for the group.
- `ls -l` shows the permissions.

> [!info] Reading the numbers (not spelled out on the slides)
> r = 4, w = 2, x = 1. Add them for each of owner, group, and others: 7 = `rwx`, 5 = `r-x`, 4 = `r--`.
> So `755` = `rwxr-xr-x`, and `-rwxr-xr--` = `754`. Changing permissions this way is the `chmod()` **protection** system call underneath.

### Two examples: MS-DOS and FreeBSD

| | **MS-DOS** | **FreeBSD** (a UNIX variant) |
| --- | --- | --- |
| Tasking | **Single-tasking** | **Multitasking** |
| Shell | Invoked when the system boots | At user login, the user's choice of shell starts |
| Running a program | Simple: **no process is created**. There is a **single memory space**, and the program is loaded into memory **overwriting all but the kernel** | The shell calls **`fork()`** to **create a process**, then **`exec()`** to **load the program** into it. The shell then **waits** for the process to finish, or **continues** taking commands |
| When the program ends | The shell is **reloaded** | The process exits with a code: **0 = no error**, **> 0 = error code** |
| Memory | Kernel + command interpreter + one program | Kernel + interpreter + **several processes** (B, C, D) at once |

## 4. System programs

System programs provide **a convenient environment for program development and execution**.
- Some are **simply user interfaces to system calls**. Others are considerably more complex.
- **Most users' view of the OS is defined by system programs, not by the actual system calls.** The user can only see down to the system programs, never the system calls themselves.

| Category | What it covers |
| --- | --- |
| **File management** | Create, delete, copy, rename, print, dump, list, and manipulate files and directories |
| **Status information** | Date, time, available memory, disk space, number of users. Detailed performance, logging, and debugging information. Some systems store configuration in a **registry** |
| **File modification** | **Text editors**, and commands to search file contents or transform text |
| **Programming-language support** | Compilers, assemblers, debuggers, interpreters |
| **Program loading and execution** | Absolute loaders, relocatable loaders, linkage editors, overlay loaders, debugging systems |
| **Communications** | Virtual connections among processes, users, and systems: messages to other screens, web browsing, email, remote login, file transfer |
| **Background services** | **Launch at boot**. Some only run during startup, others run from boot to shutdown. Disk checking, process scheduling, error logging, printing. They **run in user context, not kernel context**, and are called **services, subsystems, or daemons** |

**Application programs** aren't part of this list. They don't pertain to the system, they're run by users, and they **aren't typically considered part of the OS**. They're launched by command line, mouse click, or finger poke.

**The Windows Registry** is a **database** of settings for the programs and hardware installed. Installing a program adds a **subkey** with its location, version, and how to start it. Because it's a database it supports **atomic updates**. If two processes update the same value at the same time, one change precedes the other, so the data stays consistent.

**Linux examples (slides 2.37–2.40):**

| Area | Programs |
| --- | --- |
| Init / service manager | `init` / `systemd` (initializes the system and manages services at boot) |
| Shells | `bash`, `zsh` |
| File systems | `mount` (mount a file system), `fsck` (check and repair one) |
| Processes | `ps` (list processes), `top` (live view) |
| Networking | `ifconfig` / `ip` (configure interfaces), `ping` (test connectivity) |
| Users | `useradd`, `usermod`, `userdel`, `passwd` |
| Monitoring | `htop` (interactive process viewer), `vmstat` (processes, memory, paging, block I/O, traps, CPU) |

> [!note] One inconsistency on slide 2.37
> The slide lists the **kernel** as an "example of a system program". By the definition in [[01-what-is-an-operating-system|chapter 1]], system programs ship with the OS but **are not** the kernel. If asked, say the kernel is the core, and system programs run on top of it.

**`ps`:**
- `ps` shows the processes in your terminal, with columns PID, TTY, TIME, and CMD.
- `ps aux` shows all processes, BSD style. `ps -ef` shows all processes, UNIX style.
- `ps -u name` shows one user's processes. `ps -p 1234` shows one PID.
- In `ps aux`, USER is the owner, %CPU and %MEM are usage, VSZ is virtual memory, RSS is physical memory, and STAT is the process state.

## 5. Design and implementation

**Design.** OS design is **not a "solvable" problem**, but some approaches have proven successful. The internal structure of different OSes varies widely.
- **Start by defining goals and specifications.** These are affected by the **choice of hardware** and the **type of system**.

| **User goals** | **System goals** |
| --- | --- |
| Convenient to use, **easy to learn**, reliable, safe, fast | **Easy to design, implement, and maintain**. Flexible, reliable, error-free, efficient |

### Policy vs mechanism

| **Mechanism** | **Policy** |
| --- | --- |
| **How** to do something | **What** will be done |

- **Separating policy from mechanism** is a very important principle. It allows **maximum flexibility** when policy decisions change later: a new policy doesn't require a new mechanism.
- **The slide's example is the timer.** The [[17-dual-mode-and-timer|timer]] is a **mechanism** for protecting the CPU. **How long** to set it for a particular user is a **policy**.
- Specifying and designing an OS is a highly creative software-engineering task.

### Implementation

- **History of the languages used:**
  - Early OSes were written in **assembly**.
  - Then came system programming languages like **Algol and PL/1**.
  - Now it's **C and C++**.
- **Usually a mix of languages:**
  - The **lowest levels are in assembly**.
  - The **main body is in C**.
  - **System programs** are in C, C++, and scripting languages (Perl, Python, shell scripts).
- **A higher-level language is easier to port** to other hardware, **but slower**.
- **Emulation** can let an OS run on non-native hardware.

## 6. Operating system structure

A general-purpose OS is a **very large program**, so how it's structured matters. The ways covered in this chapter are:
- simple structure (**MS-DOS**)
- more complex (**UNIX**)
- **layered**
- **microkernel** (Mach)

Slides 2.44–2.48 cover the first two.

### Simple structure: MS-DOS

- MS-DOS was **written to provide the most functionality in the least space**.
- It is **not divided into modules**.
- It has some structure, but its **interfaces and levels of functionality are not well separated**.

```text
application program ──────────────┐
      │                           │ (applications can skip
resident system program ────────┐ │  layers and reach the
      │                         │ │  hardware directly)
MS-DOS device drivers ────────┐ │ │
      │                       ▼ ▼ ▼
ROM BIOS device drivers
```

The weakness: an **application program can reach the lower layers directly**, all the way to the ROM BIOS drivers. One buggy program can crash the whole system.

> [!info] Beyond the slides: why MS-DOS couldn't protect itself
> The Intel 8088 it ran on had **no dual mode** and no hardware protection ([[17-dual-mode-and-timer|chapter 1]]). Nothing stopped user programs from touching the hardware.

**History (slide 2.46):**
- MS-DOS was a renamed form of **86-DOS**, written by **Tim Paterson** at **Seattle Computer Products**. Its first version shipped in **August 1980**.
- **Microsoft** needed an OS for the **IBM PC**. It hired Paterson in **May 1981** and bought 86-DOS 1.10 for **US$25,000** in **July 1981**.

### Non-simple structure: UNIX

UNIX was first developed in the **1960s** and has been under constant development since.
- **Design philosophy:** provide **simple, powerful tools that can be combined** to perform complex tasks.
- It features a **command-line interface**: users work through commands rather than a GUI.

**The six key features of UNIX:**

| Feature | Meaning |
| --- | --- |
| **Multiuser support** | Multiple users can access the same system at once and share resources |
| **Multitasking** | Runs multiple processes at the same time (see [[16-multiprogramming-and-timesharing]]) |
| **Shell scripting** | A powerful scripting language for automating tasks |
| **Security** | File permissions, user accounts, network security features |
| **Portability** | Runs on everything from small embedded systems to large mainframes |
| **Communication** | Built-in commands for it, such as `write` and `mail` |

> [!tip] Memorize the features as "MMS-SPC"
> **M**ultiuser, **M**ultitasking, **S**hell scripting, **S**ecurity, **P**ortability, **C**ommunication. Last year's answer listed five of these: it missed portability.

> [!example]- Preview of slides 2.49–2.64 (not covered yet; last year's Quiz 3 included them)
> - **UNIX structure**: two separable parts, **system programs** and the **kernel**. The kernel is everything below the system-call interface and above the hardware: file system, CPU scheduling, memory management, all in one level. It's "beyond simple but not fully layered".
> - **Layered**: the OS is split into layers. **Layer 0 is the hardware, layer N is the user interface**, and each layer uses only the layers below it.
> - **Microkernel** (Mach, the basis of macOS's Darwin): moves as much as possible **out of the kernel into user space**, and the parts communicate by **message passing**. **Pros**: easier to extend and port, more reliable and more secure. **Con**: performance overhead from user↔kernel communication.
> - **Modules**: **loadable kernel modules**, with an object-oriented approach. Each core component is separate, talks over known interfaces, and is loaded as needed. Like layers, but more flexible (Linux, Solaris).
> - **Hybrid**: combines approaches. Linux and Solaris are monolithic plus modules. Windows is mostly monolithic plus a microkernel for subsystems. macOS combines Mach, BSD, and kernel extensions.

## Numbers and keywords to memorize

| | |
| --- | --- |
| OS services | **9**: 6 for the user (UPIFCE) and 3 for the system (RAP) |
| UI types | **3**: CLI, GUI, batch (plus touchscreen) |
| Common APIs | **3**: Win32, POSIX, Java |
| Parameter passing | **3** methods: registers, block in memory (Linux, Solaris), stack. Block and stack have **no limit** |
| System-call types | **6**: process control, file management, device management, information maintenance, communications, protection |
| Communication models | **2**: message passing, shared memory |
| Permission string | **10** characters: type + owner + group + others. r=4, w=2, x=1 |
| Process exit code | **0** = no error, **> 0** = error |
| Policy / mechanism | **What** / **How**. The example is the timer |
| MS-DOS | Most functionality in least space, not modular |
| UNIX features | **6** (MMS-SPC) |

> [!tip] How to write the answer
> - **List questions** (services, system-call types, UNIX features): give the **number up front** ("there are 9 services…"), then one bolded name and one line each. Last year's full-mark answer was exactly this format.
> - **Split into groups when the slides do.** The 6 user-facing services and the 3 system-facing ones are an easy way to show you understand.
> - **Add one example per item** if you have time: `fork()` for process control, `chmod()` for protection, the timer for policy vs mechanism.

## Self-test

> [!question]- List the 9 OS services.
> **For the user:** user interface (CLI, GUI, batch), program execution, I/O operations, file-system manipulation, communications (shared memory or message passing), error detection.
> **For the system:** resource allocation, accounting, protection and security.

> [!question]- What is the difference between protection and security?
> Protection controls all access to system resources, so processes can't interfere with each other. Security defends the system from outsiders, with user authentication and by guarding I/O devices from invalid access.

> [!question]- What is a system call, and why do programs usually use an API instead?
> The programming interface to OS services. APIs (Win32, POSIX, Java) are portable and easier to use, and they hide the system-call details.

> [!question]- How does the OS find the right system call?
> Each system call has a number. The system-call interface indexes a table with it, runs the call in kernel mode, and returns the status and any values.

> [!question]- What are the three ways to pass system-call parameters?
> Registers (limited by the number of registers); a block in memory with its address in a register (Linux, Solaris); or the stack (push, then pop). Block and stack have no limit.

> [!question]- Name the six types of system calls, with one example each.
> Process control (`fork`), file management (`open`), device management (`ioctl`), information maintenance (`getpid`), communications (`pipe`), protection (`chmod`).

> [!question]- Is `printf()` a system call?
> No. It's a C library function that calls the `write()` system call.

> [!question]- How does FreeBSD run a program, compared with MS-DOS?
> FreeBSD's shell calls `fork()` to create a process and `exec()` to load the program, then waits or continues, and the exit code is 0 or an error. MS-DOS creates no process: it loads the program over memory (all but the kernel) and reloads the shell when it exits.

> [!question]- What does `-rwxr-x---` mean, and what is it in octal?
> A regular file. The owner can read, write, and execute. The group can read and execute. Others have no access. In octal it's 750.

> [!question]- What is the difference between policy and mechanism?
> A mechanism is how something is done, and a policy is what will be done. The timer is a mechanism; how long it's set for each user is a policy. Keeping them separate lets policies change without new mechanisms.

> [!question]- What are background services, and where do they run?
> Programs launched at boot that do things like disk checking, scheduling, logging, and printing. They run in user context, not kernel context, and are also called daemons.

> [!question]- What is the problem with MS-DOS's structure?
> It was written for the most functionality in the least space, and isn't divided into modules. Its levels aren't well separated, and applications can access the hardware directly.

> [!question]- What are UNIX's six key features?
> Multiuser support, multitasking, shell scripting, security, portability, communication.
