---
title: "OS operations: dual mode and the timer"
description: How the interrupt-driven OS protects itself. Covers traps, user mode and kernel mode, the mode bit, privileged instructions, system calls, multi-mode CPUs, and the timer.
tags: [operating-systems, os-basics]
---
# OS operations: dual mode and the timer

*Slides 1.55–1.57 · Part of [[00-overview|Chapter 1 overview]]*

## The OS is interrupt driven

The OS runs in response to events, which come in two kinds ([[08-interrupts|interrupts]]):

- **Hardware interrupts**, raised by one of the devices.
- **Software interrupts**, called **exceptions** or **traps**. They have two causes:
  - a **software error**, such as division by zero, or
  - a **request for an operating-system service**, which is a **system call**.

The OS also has to handle **other process problems**: an **infinite loop**, or **processes modifying each other or the operating system**. A user program must not be able to break other programs or the OS. The hardware provides two features for this: **dual mode** and the **timer**.

## Dual-mode operation

**Dual-mode operation allows the OS to protect itself and other system components.**

| | **User mode** | **Kernel mode** |
| --- | --- | --- |
| Also called | — | Supervisor, system, or privileged mode |
| Runs | User applications | The OS |
| Mode bit (textbook convention) | **1** | **0** |
| Privileged instructions allowed? | **No** | **Yes** |

- A **mode bit** is **provided by the hardware**. It tells the CPU whether it is currently running **user code or kernel code**.
- Some instructions are designated **privileged**: they can **only be executed in kernel mode**. Examples are I/O control, timer management, interrupt management, and the instruction that switches to kernel mode.
- If a user program tries to run a privileged instruction, the hardware **doesn't execute it**. It **traps to the OS** instead, and the OS treats it as an illegal operation.

### System calls switch modes

A **system call changes the mode to kernel**, and **returning from the call resets it to user**.

```text
user mode (bit = 1)     user process runs
                              │ calls a system call
                              ▼
                        trap ── mode bit set to 0
kernel mode (bit = 0)   kernel executes the system call
                              │ return from system call
                              ▼
user mode (bit = 1)     mode bit set to 1, user process continues
```

The switch happens **only through a trap or interrupt**. User code can't just flip the bit, because that instruction is itself privileged.

At boot, the hardware starts in **kernel mode**. The OS loads, then starts user applications in user mode ([[02-boot-process|the boot process]]).

### Multi-mode CPUs

**CPUs increasingly support more than two modes.** For example, there is a **virtual machine manager (VMM) mode** for running guest virtual machines. The VMM gets more privileges than user processes but fewer than the kernel.

## The timer

Dual mode stops a program from taking over the hardware, but a program could still run an **infinite loop** and never give the CPU back. The **timer** prevents an infinite loop or a process **hogging resources**.

**How it works:**
1. The timer is **set to interrupt the computer after some time period**.
2. It **keeps a counter that is decremented by the physical clock**.
3. The **operating system sets the counter**. Setting it is a **privileged instruction**, so user programs can't turn the timer off.
4. **When the counter reaches zero, it generates an interrupt.** Control goes back to the OS.
5. The OS **sets up the timer before scheduling a process**. When the interrupt fires, it **regains control**, and it can **terminate a program that exceeds its allotted time**.

The timer is also what makes [[16-multiprogramming-and-timesharing|timesharing]] work. A regular timer interrupt gives the OS the chance to switch to another process.

> [!tip] Why the two features need each other
> The timer only works because setting it is privileged (dual mode). Dual mode is only safe because the timer guarantees the OS gets control back. Together they make the OS a real **control program** ([[01-what-is-an-operating-system|definition]]).

## Check yourself

> [!question]- What are the two kinds of software interrupt?
> Software errors, such as division by zero, and requests for OS services (system calls).

> [!question]- What is the mode bit, and what values does it take?
> A hardware bit that shows whether the CPU is running kernel code or user code. In the textbook's convention, kernel = 0 and user = 1.

> [!question]- What happens if a user program runs a privileged instruction?
> The hardware doesn't execute it. It traps to the OS, which treats it as illegal.

> [!question]- How does a system call change the mode?
> The call traps into kernel mode (bit = 0). Returning from the call sets user mode again (bit = 1).

> [!question]- How does the timer stop a program from running forever?
> Before scheduling a process, the OS sets a counter, which is a privileged operation. The clock decrements it, and at zero an interrupt returns control to the OS, which can then terminate the program.

---
[[16-multiprogramming-and-timesharing|← Multiprogramming and timesharing]] · [[00-overview|Overview]] · [[18-glossary|Next: Glossary →]]
