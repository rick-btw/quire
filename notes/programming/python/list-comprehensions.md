---
title: List comprehensions
description: Build a list from an iterable in one expression.
tags: [python]
---
A comprehension replaces a `for` loop that appends to a list.

```python
squares = [n * n for n in range(10)]
evens = [n for n in range(20) if n % 2 == 0]
pairs = [(a, b) for a in "xy" for b in (1, 2)]
```

The same shape works for sets, dicts, and generators:

```python
unique_lengths = {len(word) for word in words}
index = {word: i for i, word in enumerate(words)}
total = sum(n * n for n in range(1_000_000))  # no list is built
```

## When not to

- [ ] More than two `for` clauses: write a loop.
- [ ] Side effects inside the expression: write a loop.
- [x] A simple map or filter: comprehension.

Comprehensions are how [[hash-maps|dictionaries]] usually get built in Python.
