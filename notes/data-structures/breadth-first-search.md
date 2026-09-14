---
title: Breadth-first search
description: Explore a graph one layer at a time.
tags: [algorithms, data-structures]
aliases: [BFS]
---
BFS visits every vertex at distance 1 from the start, then distance 2, and so on. Because it expands in rings, the first time it reaches a vertex is along a shortest path.

## The algorithm

```python
from collections import deque

def bfs(graph, start):
    seen = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in seen:
                seen.add(neighbour)
                queue.append(neighbour)
    return order
```

```java
static List<String> bfs(Map<String, List<String>> graph, String start) {
    Set<String> seen = new HashSet<>(List.of(start));
    Deque<String> queue = new ArrayDeque<>(List.of(start));
    List<String> order = new ArrayList<>();
    while (!queue.isEmpty()) {
        String node = queue.poll();
        order.add(node);
        for (String next : graph.get(node)) {
            if (seen.add(next)) queue.add(next);
        }
    }
    return order;
}
```

> [!tip]- Why a queue?
> A queue is first-in, first-out, so vertices are processed in the order they were discovered. Swap it for a stack and you get depth-first search.

Runs in $O(|V| + |E|)$ on a [[graphs|graph]] stored as an adjacency list.
