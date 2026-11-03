---
title: "Quiz 5: Chapter 3, Slides 45–66"
description: Quiz 5 prep for the rest of chapter 3 (Processes), slides 3.45–3.66. Covers the bounded buffer in shared memory, message passing and its implementation issues, direct vs indirect communication, mailboxes, blocking vs non-blocking, and buffering, with likely quiz questions and 5-minute model answers.
tags: [operating-systems, quiz-prep]
---
# Quiz 5: Chapter 3, Slides 45–66

> [!abstract] This note is for **Quiz 5**: the rest of chapter 3 (*Processes*), **slides 3.45–3.66**, the end of the deck
> It starts at 3.45, in case Quiz 4 stopped at 3.44. The first part of the chapter (processes, the PCB, scheduling, creation and termination, the basic IPC models) is in [[chapter-3-quiz-4|Quiz 4: Chapter 3, Slides 1–48]].
>
> Slide 3.2 also lists *Examples of IPC Systems* and *Communication in Client-Server Systems*, but the deck stops at 3.66 without reaching them, so they aren't here.

> [!warning] There is no Quiz 5 in last year's quiz PDF
> Last year's PDF only has quizzes 1–4, so there's no past question to aim at. That makes the [likely questions](#likely-quiz-questions-and-5-minute-answers) below educated guesses. They're based on what this instructor asked before: one topic, explained as a **numbered list or a comparison**.
>
> If I had to bet:
> 1. **direct vs indirect communication**
> 2. **blocking vs non-blocking (synchronization)**
> 3. **buffering**
> 4. **the message-passing implementation issues**

## Where this part fits

Cooperating processes need **interprocess communication (IPC)**, and there are **two models** ([[chapter-3-quiz-4|Quiz 4 note]] §12):
- **shared memory**: covered first here (slides 3.45–3.48);
- **message passing**: the rest of the chapter (slides 3.49–3.65).

| | Shared memory | Message passing |
| --- | --- | --- |
| How | A **shared region** that the processes read and write | **`send()` / `receive()`** through the OS |
| Controlled by | **The user processes** | **The OS** |
| Synchronization | The processes must do it themselves (chapter 5) | Built in, through **blocking** operations (§6) |
| Shared variables | Yes | **No**: processes communicate *without* shared variables |

## 1. The bounded buffer in shared memory (slides 3.45–3.47)

This is the **producer–consumer problem** solved with shared memory.
- The **producer** produces information, and the **consumer** consumes it.
- An **unbounded buffer** has no practical size limit. A **bounded buffer** has a **fixed size**.

**The shared data:**

```c
#define BUFFER_SIZE 10
typedef struct { . . . } item;
item buffer[BUFFER_SIZE];
int in = 0;    // next free slot
int out = 0;   // next full slot
```

The buffer is a **circular array**: `in` and `out` wrap around with `% BUFFER_SIZE`.

<svg viewBox="0 0 730 300" width="100%" style="max-width:730px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Circular bounded buffer with 10 slots numbered 0 to 9. Slots 2 to 6 hold items. out points to slot 2, the next item to consume; in points to slot 7, the next free slot. The buffer is empty when in equals out and full when in plus 1 mod 10 equals out, so one slot always stays unused." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q5-ring-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q5-ring-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<path d="M212.1,30.0 A120,120 0 0 1 278.8,51.7 L250.2,92.7 A70,70 0 0 0 211.2,80.0 Z" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="239.4" y="64.1" text-anchor="middle" style="fill:var(--text-muted, #777)">0</text>
<path d="M282.2,54.2 A120,120 0 0 1 323.5,110.9 L276.2,127.2 A70,70 0 0 0 252.1,94.1 Z" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="286.9" y="98.7" text-anchor="middle" style="fill:var(--text-muted, #777)">1</text>
<path d="M324.8,114.9 A120,120 0 0 1 324.8,185.1 L276.9,170.5 A70,70 0 0 0 276.9,129.5 Z" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="305.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">2</text>
<path d="M323.5,189.1 A120,120 0 0 1 282.2,245.8 L252.1,205.9 A70,70 0 0 0 276.2,172.8 Z" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="286.9" y="210.3" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">3</text>
<path d="M278.8,248.3 A120,120 0 0 1 212.1,270.0 L211.2,220.0 A70,70 0 0 0 250.2,207.3 Z" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="239.4" y="244.9" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">4</text>
<path d="M207.9,270.0 A120,120 0 0 1 141.2,248.3 L169.8,207.3 A70,70 0 0 0 208.8,220.0 Z" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="180.6" y="244.9" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">5</text>
<path d="M137.8,245.8 A120,120 0 0 1 96.5,189.1 L143.8,172.8 A70,70 0 0 0 167.9,205.9 Z" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="133.1" y="210.3" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">6</text>
<path d="M95.2,185.1 A120,120 0 0 1 95.2,114.9 L143.1,129.5 A70,70 0 0 0 143.1,170.5 Z" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="115.0" y="154.5" text-anchor="middle" style="fill:var(--text-muted, #777)">7</text>
<path d="M96.5,110.9 A120,120 0 0 1 137.8,54.2 L167.9,94.1 A70,70 0 0 0 143.8,127.2 Z" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="133.1" y="98.7" text-anchor="middle" style="fill:var(--text-muted, #777)">8</text>
<path d="M141.2,51.7 A120,120 0 0 1 207.9,30.0 L208.8,80.0 A70,70 0 0 0 169.8,92.7 Z" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="180.6" y="64.1" text-anchor="middle" style="fill:var(--text-muted, #777)">9</text>
<path d="M370.0,150.0 L334.0,150.0" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6" marker-end="url(#q5-ring-a)"/>
<text x="382.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">out</text>
<path d="M50.0,150.0 L86.0,150.0" style="fill:none;stroke:var(--accent, #6c99bb);stroke-width:1.6" marker-end="url(#q5-ring-a)"/>
<text x="38.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">in</text>
<text x="210.0" y="146.5" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">BUFFER_SIZE</text>
<text x="210.0" y="162.5" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">= 10</text>
<rect x="420.0" y="40.0" width="22" height="16" rx="2" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="452.0" y="53.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">holds an item (slots 2–6)</text>
<rect x="420.0" y="66.0" width="22" height="16" rx="2" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="452.0" y="79.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">free</text>
<text x="420.0" y="130.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">out</text>
<text x="472.0" y="130.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">next item to consume</text>
<text x="420.0" y="156.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">in</text>
<text x="472.0" y="156.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">next free slot</text>
<text x="420.0" y="182.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">empty</text>
<text x="472.0" y="182.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">in == out</text>
<text x="420.0" y="208.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">full</text>
<text x="472.0" y="208.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">(in + 1) % BUFFER_SIZE == out</text>
<text x="420.0" y="250.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">→ only BUFFER_SIZE − 1 = 9 slots can ever be full</text>
</svg>

**Producer (slide 3.46):**

```c
item next_produced;
while (true) {
    /* produce an item in next_produced */
    while (((in + 1) % BUFFER_SIZE) == out)
        ;                              // buffer full: do nothing (busy-wait)
    buffer[in] = next_produced;
    in = (in + 1) % BUFFER_SIZE;
}
```

**Consumer (slide 3.47):**

```c
item next_consumed;
while (true) {
    while (in == out)
        ;                              // buffer empty: do nothing (busy-wait)
    next_consumed = buffer[out];
    out = (out + 1) % BUFFER_SIZE;
    /* consume the item in next_consumed */
}
```

> [!tip] Why only `BUFFER_SIZE − 1` items? (slide 3.45)
> The solution is correct, but it can only use **`BUFFER_SIZE − 1`** slots: 9 out of 10.
> - **Empty** means `in == out`.
> - If all 10 slots could fill, `in` would wrap around and equal `out` again, so a **full** buffer would look exactly like an **empty** one.
> - So "full" is defined as `(in + 1) % BUFFER_SIZE == out`, which keeps one slot free to tell the two cases apart.

**Shared memory in general (slide 3.48):**
- It is **an area of memory shared among the processes** that wish to communicate.
- The communication is **under the control of the user processes, not the OS**.
- The **major issue** is giving the processes a way to **synchronize their actions** when they access the shared memory. Chapter 5 covers this in detail.

The `while (...) ;` loops above are **busy-waiting**: they burn CPU time doing nothing until the condition changes.

## 2. Message passing (slides 3.49–3.50)

Message passing is a mechanism for processes to **communicate and to synchronize their actions**.
- It's a message system: processes communicate **without resorting to shared variables**.
- The IPC facility provides **two operations**: **`send(message)`** and **`receive(message)`**.
- The **message size** is either **fixed or variable**.

If processes **P** and **Q** want to communicate, they need to:
1. **establish a communication link** between them, and
2. **exchange messages** with `send` and `receive`.

## 3. The implementation issues (slides 3.50–3.54)

When designing a message-passing link, there are **six questions** to answer:

| # | Question | Options |
| --- | --- | --- |
| 1 | **How are links established?** | **Implicit (automatic)**: the link is created automatically when processes use `send`/`receive`. **Explicit (manual)**: the processes must explicitly create or open a channel |
| 2 | **Can a link connect more than two processes?** | **Point-to-point**: only 2 processes, the most common case (pipes, TCP sockets). **Multipoint**: more than 2 (multicast sockets, shared message queues) |
| 3 | **How many links between each pair?** | **Single link**: one channel per pair. **Multiple links**: several channels, for example for different message types (multiple pipes or socket connections) |
| 4 | **What is the capacity of a link?** | **Zero** (no buffering, so synchronous/blocking), **bounded** (a fixed buffer of *n* messages), or **unbounded** (a theoretically infinite queue). See [§7](#7-buffering-slides-352-365) |
| 5 | **Is the message size fixed or variable?** | **Fixed**: all messages the same size, which is simpler but may waste space. **Variable**: more flexible, but harder to manage |
| 6 | **Is a link unidirectional or bidirectional?** | **Unidirectional (simplex)**: one-way. **Bidirectional (duplex)**: **half-duplex** goes both ways but not at the same time; **full-duplex** goes both ways simultaneously |

> [!note] A small slip on slide 3.51
> The slide asks "How many links…?" twice. The first one is really the textbook's question "**Can a link be associated with more than two processes?**", which is what point-to-point vs multipoint answers. The table above uses the textbook's wording.

> [!tip] Memory aid: "**E**very **P**air **L**ikes **C**alm, **S**hort **D**ialogues"
> **E**stablished · **P**rocesses per link · **L**inks per pair · **C**apacity · **S**ize · **D**irection.

## 4. Physical vs logical implementation of a link (slides 3.55–3.58)

A link can be implemented at two levels:
- **Physical**: the actual medium is shared memory, a hardware bus, or a network.
- **Logical**: how it behaves. It can be **direct or indirect** (§5), **synchronous or asynchronous** (§6), and use **automatic or explicit buffering** (§7).

The slides then run the six questions over each physical medium:

| | **Shared memory** | **Hardware bus** | **Network** |
| --- | --- | --- | --- |
| Established | **Explicit**: create or attach to a segment | **Explicit** hardware configuration | **Explicit**: socket creation, connection setup |
| Processes per link | Many processes can access the same region | Broadcast or multicast capable | Point-to-point (TCP) or multipoint (UDP multicast) |
| Links per pair | One shared region, which can be partitioned logically | Usually one physical bus with many logical channels | Multiple connections possible between the same pair |
| Capacity | Bounded by the allocated memory size | Bounded by the bus buffer size | Bounded by network buffers and bandwidth |
| Message size | **Variable**: application-defined data structures | Often **fixed** (packet or frame size) | **Variable**, up to MTU limits, and fragmentation is possible |
| Direction | **Bidirectional**: all processes can read and write | Usually bidirectional, maybe on separate lines | **Bidirectional** (full-duplex in most protocols) |

## 5. Direct vs indirect communication (slides 3.59–3.62)

<svg viewBox="0 0 700 260" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="Direct versus indirect communication. Direct: process P calls send(Q, message) and Q calls receive(P, message) over a single link between exactly that pair. Indirect: P1 sends to mailbox A, and P2 and P3 receive from mailbox A, so one link can serve many processes." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q5-links-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q5-links-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<text x="170.0" y="22.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">direct: name the process</text>
<ellipse cx="70.0" cy="110.0" rx="46" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="70.0" y="114.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">P</text>
<ellipse cx="270.0" cy="110.0" rx="46" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="270.0" y="114.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">Q</text>
<path d="M118,110 H220" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-links-m)" marker-start="url(#q5-links-m)"/>
<text x="170.0" y="100.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">one link</text>
<text x="70.0" y="160.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">send(Q, msg)</text>
<text x="270.0" y="160.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">receive(P, msg)</text>
<text x="170.0" y="208.5" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">exactly one link per pair,</text>
<text x="170.0" y="224.5" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">made automatically</text>
<path d="M350,20 V240" style="fill:none;stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd));stroke-dasharray:4 4"/>
<text x="530.0" y="22.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">indirect: name the mailbox</text>
<ellipse cx="420.0" cy="110.0" rx="46" ry="26" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="420.0" y="114.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">P₁</text>
<rect x="495.0" y="88.0" width="90" height="44" rx="5" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="540.0" y="107.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">mailbox A</text>
<text x="540.0" y="122.0" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">(port)</text>
<ellipse cx="650.0" cy="70.0" rx="40" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="650.0" y="74.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">P₂</text>
<ellipse cx="650.0" cy="150.0" rx="40" ry="24" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="650.0" y="154.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">P₃</text>
<path d="M468,110 H493" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-links-m)"/>
<path d="M587,102 L612,82" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-links-m)"/>
<path d="M587,118 L612,138" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-links-m)"/>
<text x="420.0" y="160.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">send(A, msg)</text>
<text x="650.0" y="192.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">receive(A, msg)</text>
<text x="530.0" y="220.5" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">one link can serve many processes;</text>
<text x="530.0" y="236.5" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">who gets the message?</text>
</svg>

### Direct communication

Processes **must name each other explicitly**:
- `send(P, message)` sends a message to process P.
- `receive(Q, message)` receives a message from process Q.

**Properties of the link:**
1. Links are **established automatically**.
2. A link is associated with **exactly one pair** of communicating processes.
3. Between each pair there is **exactly one link**.
4. The link may be unidirectional, but it is **usually bidirectional**.

### Indirect communication

Messages are sent to and received from **mailboxes**, also called **ports**.
- Each mailbox has a **unique id**.
- Processes can communicate **only if they share a mailbox**.

**Properties of the link:**
1. A link is established **only if the processes share a common mailbox**.
2. A link may be associated with **many processes**.
3. Each pair of processes may share **several** communication links, one per mailbox they share.
4. The link may be **unidirectional or bidirectional**.

**Operations:**
- **create** a new mailbox (port);
- **send and receive** messages through the mailbox;
- **destroy** a mailbox.

**Primitives:**
- `send(A, message)` sends a message to mailbox A.
- `receive(A, message)` receives a message from mailbox A.

| | **Direct** | **Indirect** |
| --- | --- | --- |
| You name | **The other process** | **A mailbox (port)** |
| Link made | **Automatically** | Only when the processes **share a mailbox** |
| Processes per link | **Exactly 2** | **Many** |
| Links per pair | **Exactly 1** | **Several** (one per shared mailbox) |
| Direction | Usually bidirectional | Unidirectional or bidirectional |

### The mailbox-sharing problem (slide 3.62)

**P₁, P₂ and P₃ share mailbox A. P₁ sends, and P₂ and P₃ both receive. Who gets the message?**

There are three solutions:
1. **Allow a link to be associated with at most two processes**, so the problem can't arise.
2. **Allow only one process at a time to execute a `receive`** operation.
3. **Let the system pick the receiver arbitrarily**, and **notify the sender** who the receiver was.

## 6. Synchronization: blocking vs non-blocking (slides 3.63–3.64)

Message passing may be **blocking** or **non-blocking**.

| | **Blocking** (= **synchronous**) | **Non-blocking** (= **asynchronous**) |
| --- | --- | --- |
| **send** | The sender is **blocked until the message is received** | The sender **sends the message and continues** |
| **receive** | The receiver is **blocked until a message is available** | The receiver gets **either a valid message or a null message** |

- **Different combinations are possible**: for example, a non-blocking send with a blocking receive.
- **If both send and receive are blocking, it's called a rendezvous.** The two processes meet at the moment of the hand-off.

**With blocking calls, the producer–consumer problem becomes trivial (slide 3.64):**

```c
message next_produced;              message next_consumed;
while (true) {                      while (true) {
    /* produce an item */               receive(next_consumed);
    send(next_produced);                /* consume the item */
}                                   }
```

There's no `in`/`out` bookkeeping, no busy-waiting, and no shared variables. `send` and `receive` do the waiting, compared with the shared-memory version in §1.

## 7. Buffering (slides 3.52, 3.65)

Messages exchanged over a link wait in a **queue attached to the link**. There are **three** ways to implement that queue:

<svg viewBox="0 0 700 250" width="100%" style="max-width:700px;display:block;margin:1.25em auto;font-size:13px" role="img" aria-label="The three buffering options for a message link. Zero capacity: no queue, the sender waits for the receiver (rendezvous). Bounded capacity: a queue of n messages, the sender waits only when it is full. Unbounded capacity: an endless queue, the sender never waits." xmlns="http://www.w3.org/2000/svg">
<defs><marker id="q5-buffer-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--text-muted, #777)"/></marker><marker id="q5-buffer-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent, #6c99bb)"/></marker></defs>
<text x="20.0" y="45.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">zero capacity</text>
<rect x="170.0" y="24.0" width="70" height="32" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="205.0" y="44.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">sender</text>
<rect x="600.0" y="24.0" width="80" height="32" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="640.0" y="44.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">receiver</text>
<path d="M242,40 H597" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-buffer-m)"/>
<text x="420.0" y="34.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:12px">hand-off</text>
<text x="170.0" y="72.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">no queue: the sender waits for the receiver (rendezvous)</text>
<text x="20.0" y="117.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">bounded capacity</text>
<rect x="170.0" y="96.0" width="70" height="32" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="205.0" y="116.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">sender</text>
<rect x="600.0" y="96.0" width="80" height="32" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="640.0" y="116.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">receiver</text>
<rect x="270.0" y="99.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="286.0" y="116.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="308.0" y="99.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="324.0" y="116.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="346.0" y="99.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="362.0" y="116.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="384.0" y="99.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="400.0" y="116.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<path d="M242,112 H266" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-buffer-m)"/>
<path d="M422,112 H597" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-buffer-m)"/>
<text x="170.0" y="144.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">n slots: the sender waits only when the queue is full</text>
<text x="20.0" y="189.0" text-anchor="start" style="fill:var(--text, var(--text-normal, #1c1c1c));font-weight:600">unbounded capacity</text>
<rect x="170.0" y="168.0" width="70" height="32" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="205.0" y="188.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">sender</text>
<rect x="600.0" y="168.0" width="80" height="32" rx="5" style="fill:var(--accent-soft, rgba(108,153,187,0.14));stroke:var(--accent, #6c99bb)"/>
<text x="640.0" y="188.5" text-anchor="middle" style="fill:var(--text, var(--text-normal, #1c1c1c));font-size:12px">receiver</text>
<rect x="270.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="286.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="308.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="324.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="346.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="362.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="384.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="400.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="422.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="438.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="460.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="476.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<rect x="498.0" y="171.0" width="32" height="26" rx="3" style="fill:var(--code-bg, var(--background-secondary, #f4f4f4));stroke:var(--border-strong, var(--background-modifier-border, #bdbdbd))"/>
<text x="514.0" y="188.0" text-anchor="middle" style="fill:var(--text-muted, #777);font-size:11px">m</text>
<text x="546.0" y="188.5" text-anchor="middle" style="fill:var(--text-muted, #777)">…</text>
<path d="M242,184 H266" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-buffer-m)"/>
<path d="M566,184 H597" style="fill:none;stroke:var(--text-muted, #777);stroke-width:1.3" marker-end="url(#q5-buffer-m)"/>
<text x="170.0" y="216.0" text-anchor="start" style="fill:var(--text-muted, #777);font-size:12px">endless queue: the sender never waits</text>
</svg>

| | Queue length | The sender… |
| --- | --- | --- |
| **1. Zero capacity** | **No** messages are queued on the link | **Must wait for the receiver** (a **rendezvous**) |
| **2. Bounded capacity** | A **finite** length of *n* messages | **Must wait if the link is full** |
| **3. Unbounded capacity** | **Infinite** length | **Never waits** |

**How it ties together:**
- **Zero capacity** forces a **blocking send**, because there's nowhere to leave the message.
- **Bounded capacity** is the message-passing version of the [bounded buffer](#1-the-bounded-buffer-in-shared-memory-slides-345347).
- **Unbounded capacity** makes a non-blocking send always possible.

The textbook calls zero capacity "no buffering", and the other two "**automatic buffering**".

## Likely quiz questions and 5-minute answers

Ranked by how likely they seem. Remember these are guesses, since there's no Quiz 5 from last year.

> [!question]- 1. "Compare direct and indirect communication."
> **Direct:** processes name each other: `send(P, msg)`, `receive(Q, msg)`. The link is made **automatically**, connects **exactly one pair**, there is **exactly one link** per pair, and it's usually bidirectional.
> **Indirect:** processes send and receive through **mailboxes (ports)**, each with a unique id: `send(A, msg)`, `receive(A, msg)`. A link exists **only if the processes share a mailbox**. It can serve **many processes**, a pair can have **several links**, and it can be uni- or bidirectional. Operations: create, send/receive, destroy.

> [!question]- 2. "Explain blocking and non-blocking message passing."
> **Blocking (synchronous):** a blocking **send** waits until the message is received, and a blocking **receive** waits until a message is available.
> **Non-blocking (asynchronous):** the **send** returns immediately, and the **receive** returns either a valid message or **null**.
> The two can be combined. If **both are blocking**, it's a **rendezvous**. Blocking calls make producer–consumer trivial: the producer just calls `send`, and the consumer just calls `receive`.

> [!question]- 3. "What are the three ways of buffering messages?"
> The link has a message queue, implemented in one of three ways:
> 1. **Zero capacity**: no queue, so the sender must wait for the receiver (rendezvous).
> 2. **Bounded capacity**: *n* messages, so the sender waits only when the queue is full.
> 3. **Unbounded capacity**: infinite, so the sender never waits.

> [!question]- 4. "What are the implementation issues of a message-passing link?"
> 1. **How links are established**: implicitly (automatically) or explicitly.
> 2. **Processes per link**: point-to-point (2, e.g. pipes and TCP) or multipoint (e.g. multicast).
> 3. **Links per pair**: single or multiple.
> 4. **Capacity**: zero, bounded, or unbounded.
> 5. **Message size**: fixed (simple, may waste space) or variable (flexible, harder to manage).
> 6. **Direction**: unidirectional (simplex) or bidirectional (half- or full-duplex).
>
> Bonus: physically a link is shared memory, a hardware bus, or a network. Logically it's direct or indirect, synchronous or asynchronous, with automatic or explicit buffering.

> [!question]- 5. "Several processes share a mailbox. One sends; who receives?"
> P₁ sends to mailbox A, and P₂ and P₃ both receive from A. The three solutions are:
> 1. Allow a link to have **at most two processes**.
> 2. Allow **only one process at a time** to execute `receive`.
> 3. Let the **system choose the receiver arbitrarily** and **tell the sender** who got it.

> [!question]- 6. "Compare shared memory and message passing."
> **Shared memory:** a common region the processes read and write. It's **controlled by the user processes**, it's fast, and the processes **must synchronize** their access themselves (e.g. the bounded buffer).
> **Message passing:** `send` and `receive` through the **OS**, with **no shared variables**. It's easier, works across machines, and synchronizes itself through blocking. Its link has design choices: direct or indirect, blocking or not, and zero, bounded, or unbounded buffering.

> [!question]- 7. "Explain the bounded-buffer solution. Why does it hold only BUFFER_SIZE − 1 items?"
> A circular array `buffer[BUFFER_SIZE]` is shared, with `in` (next free slot) and `out` (next full slot).
> - The **producer** busy-waits while `(in + 1) % BUFFER_SIZE == out` (full), then writes `buffer[in]` and advances `in`.
> - The **consumer** busy-waits while `in == out` (empty), then reads `buffer[out]` and advances `out`.
>
> It can only use **BUFFER_SIZE − 1** slots: if every slot filled, `in` would equal `out`, which already means *empty*, so one slot is sacrificed to tell full from empty.

> [!question]- 8. "What are the properties of a link in direct (or indirect) communication?"
> **Direct:** established automatically · exactly one pair · exactly one link per pair · usually bidirectional.
> **Indirect:** only if the processes share a mailbox · may serve many processes · a pair may share several links · uni- or bidirectional.

> [!tip] How to write the answer
> - **Comparisons** (direct vs indirect, blocking vs non-blocking, shared memory vs message passing): **draw a 2-column table**. It's the fastest way to show every difference.
> - **Lists** (buffering, the implementation issues, the mailbox solutions): **give the count first** ("there are three…"), then one line each.
> - **Write the primitives**: `send(P, msg)` vs `send(A, msg)` shows the direct/indirect difference in two lines.

## Numbers and keywords to memorize

| | |
| --- | --- |
| Message-passing operations | **2**: `send(message)`, `receive(message)` |
| Implementation issues | **6**: established · processes per link · links per pair · capacity · size · direction |
| Physical media | **3**: shared memory, hardware bus, network |
| Logical choices | **3**: direct/indirect · sync/async · automatic/explicit buffering |
| Direct link properties | **4**: automatic · one pair · one link · usually bidirectional |
| Indirect link properties | **4**: shared mailbox · many processes · several links · uni- or bidirectional |
| Mailbox operations | **3**: create · send/receive · destroy |
| Mailbox-sharing solutions | **3**: at most two processes · one receiver at a time · the system picks and tells the sender |
| Blocking | = synchronous. Both blocking = **rendezvous** |
| Non-blocking receive | A valid message **or null** |
| Buffering | **3**: zero (the sender waits) · bounded *n* (waits if full) · unbounded (never waits) |
| Bounded buffer | Holds **BUFFER_SIZE − 1**. Empty: `in == out`. Full: `(in + 1) % BUFFER_SIZE == out` |
