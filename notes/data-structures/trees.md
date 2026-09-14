---
title: Trees
tags: [data-structures]
aliases: [tree]
---
# Trees

A tree is a connected [[graphs|graph]] with no cycles. One node is the **root**; every other node has exactly one parent.

## Vocabulary

- **Leaf**: a node with no children.
- **Depth**: edges from the root to a node.
- **Height**: the longest root-to-leaf path.

## Traversals

- [x] Pre-order: node, left, right
- [x] In-order: left, node, right (sorted output for a binary search tree)
- [ ] Post-order: left, right, node
- [ ] Level order, which is [[breadth-first-search|BFS]] on a tree

## Binary search trees

```typescript
interface Node<T> {
  value: T;
  left?: Node<T>;
  right?: Node<T>;
}

function insert<T>(root: Node<T> | undefined, value: T): Node<T> {
  if (!root) return { value };
  if (value < root.value) root.left = insert(root.left, value);
  else root.right = insert(root.right, value);
  return root;
}
```

See [[graphs#Representations]] for how the same shapes are stored in memory.
