---
title: Graphs
description: Things and the relationships between them.
tags: [data-structures, fundamentals]
---
A graph $G = (V, E)$ is a set of **vertices** and a set of **edges** between them. This vault is a graph: notes are vertices and links are edges.

## Representations

An **adjacency list** stores, for each vertex, the vertices it touches. It is the right default for sparse graphs:

```python
graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D"],
    "D": [],
}
```

An **adjacency matrix** is an $n \times n$ table where entry $(i, j)$ says whether $i$ connects to $j$. It costs $O(n^2)$ memory but answers "are these connected?" in $O(1)$.

## Walking a graph

[[breadth-first-search]] explores level by level and finds shortest paths in unweighted graphs. Depth-first search goes as deep as it can first and is the natural fit for recursion.

A [[trees|tree]] is just a graph with $|E| = |V| - 1$ and no cycles.

## Related

The [[Chain rule]] has nothing to do with graphs; this link is left broken on purpose to show how an unresolved link looks.
