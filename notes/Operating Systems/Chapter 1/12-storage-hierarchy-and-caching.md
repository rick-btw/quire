---
title: "Storage hierarchy and caching"
description: How storage is organized by speed, cost, and volatility, how caching works and what makes it hard, and the role of device drivers.
tags: [operating-systems, storage]
---
# Storage hierarchy and caching

*Slides 1.36–1.40 · Part of [[00-overview|Chapter 1 overview]]*

## The storage hierarchy

Storage systems are organized in a hierarchy by **speed**, **cost**, and **volatility**. No single technology is fast, cheap, large, and permanent all at once, so systems combine several.

```text
            registers          ▲  faster
            cache              │  smaller
            main memory        │  more expensive per byte
  ── volatile ─────────────────┼─────────────────────────
     nonvolatile               │
            solid-state disk   │
            hard disk          │  slower
            optical disk       │  larger
            magnetic tapes     ▼  cheaper per byte
```

- Everything **above main memory** (registers, cache) is tied to the CPU.
- **Main memory** is the largest storage the CPU accesses directly ([[11-storage-structure|storage structure]]).
- Everything **below the line** is nonvolatile secondary or tertiary storage.

> [!info] Beyond the slides: who manages each level
> - **Registers**: the compiler.
> - **Cache**: the hardware.
> - **Main memory and disks**: the operating system.

## Caching

**Caching** is the principle of **copying information into a faster storage system**. It is an important principle performed at **many levels** in a computer: in hardware, in the operating system, and in software.

**How it works:**
1. Information **in use** is **copied from slower to faster storage** temporarily.
2. The faster storage (the **cache**) is **checked first** to see whether the information is there.
   - If it is (a **hit**), the information is **used directly from the cache**, which is fast.
   - If not (a **miss**), the data is **copied into the cache** and used there.

**Main memory can be viewed as a cache for secondary storage.** The same pattern repeats at every level of the hierarchy.

**Why it's a design problem:**
- **The cache is smaller than the storage being cached**, so it can't hold everything.
- **Cache management** is an important design problem. The two key decisions are the **cache size** and the **replacement policy** (which item to evict when the cache is full).

Slide 1.40 makes the point with a picture of tools. You keep the few tools you use all the time within reach, and fetch the rest from storage only when you need them.

> [!info] Beyond the slides: cache coherency
> In a [[13-multiprocessor-systems|multiprocessor]], each CPU has its own cache. The same data can then have copies in several caches. When one CPU changes its copy, the others must be updated or invalidated. This is called **cache coherency**, and it is handled by the hardware.

## Device drivers

There is a **device driver for each device controller** to manage I/O. It provides a **uniform interface between the controller and the kernel**. See [[07-computer-system-organization|computer-system organization]].

## Check yourself

> [!question]- What three properties is the storage hierarchy organized by?
> Speed, cost, and volatility.

> [!question]- What happens on a cache hit and on a cache miss?
> On a hit, the data is used directly from the faster cache. On a miss, it is copied from slower storage into the cache, then used.

> [!question]- What are the two main design decisions in cache management?
> The cache size and the replacement policy.

> [!question]- In what sense is main memory a cache?
> It holds copies of the parts of secondary storage currently in use, so the CPU can work with them quickly.

---
[[11-storage-structure|← Storage structure]] · [[00-overview|Overview]] · [[13-multiprocessor-systems|Next: Multiprocessor systems →]]
