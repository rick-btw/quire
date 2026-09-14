---
title: Hash maps
description: Constant-time lookups by trading memory for speed.
tags: [data-structures, fundamentals]
aliases: [hashmap, dictionary, hash table]
---
A **hash map** stores key–value pairs. A hash function turns each key into a bucket index, so a lookup never has to scan.

## Operations

| Operation | Average | Worst case |
| --- | --- | --- |
| insert | $O(1)$ | $O(n)$ |
| lookup | $O(1)$ | $O(n)$ |
| delete | $O(1)$ | $O(n)$ |

The worst case happens when many keys collide into the same bucket.

## In Python

```python
counts: dict[str, int] = {}
for word in "the quick brown fox jumps over the lazy dog".split():
    counts[word] = counts.get(word, 0) + 1
print(counts["the"])  # 2
```

## Where it shows up

- [[1-two-sum]] is the classic interview use: trade a second pass for a lookup.
- A [[trees|tree]] is the alternative when you also need ordering.
- Sets are hash maps without values.

> [!question] Why is the worst case linear?
> If every key hashes to the same bucket, the map degrades into a list. Good hash functions and resizing keep that from happening in practice.
