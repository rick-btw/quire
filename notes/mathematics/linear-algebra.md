---
title: Linear algebra
description: Vectors, matrices, and the picture behind them.
tags: [mathematics, foundations]
aliases: [linalg]
---
# Linear algebra

A **vector** is an arrow with a length and a direction. Adding two vectors puts them head to tail:

![[vector-addition.svg|300]]

The same picture as a plain markdown image: ![vector addition](attachments/vector-addition.svg)

## Matrices

A matrix is a linear map written down. For $A \in \mathbb{R}^{m \times n}$ and $x \in \mathbb{R}^n$:

$$
Ax = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}
\begin{bmatrix} x_1 \\ x_2 \end{bmatrix}
= \begin{bmatrix} a_{11}x_1 + a_{12}x_2 \\ a_{21}x_1 + a_{22}x_2 \end{bmatrix}
$$

```python
import numpy as np

A = np.array([[2, 0], [0, 3]])
x = np.array([1, 1])
print(A @ x)  # [2 3]
```

> [!tip] Geometry first
> Read $Ax$ as "where does $A$ send $x$", not as a pile of arithmetic.

## Norms

| Norm | Formula |
| --- | --- |
| $\ell_1$ | $\sum_i \lvert x_i \rvert$ |
| $\ell_2$ | $\sqrt{\sum_i x_i^2}$ |

Gradient descent ([[gradient-descent]]) lives on top of this. A link that goes nowhere: [[Nowhere]].
