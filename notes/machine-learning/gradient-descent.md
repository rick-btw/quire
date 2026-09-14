---
title: Gradient descent
description: Follow the slope downhill until the loss stops shrinking.
tags: [machine-learning, optimization]
aliases: [GD]
---
Gradient descent minimises a loss function by repeatedly stepping in the direction of steepest descent.

## The update

For parameters $\theta$, a loss $J$, and learning rate $\alpha$:

$$
\theta_{t+1} = \theta_t - \alpha \, \nabla J(\theta_t)
$$

The gradient collects the partial [[mathematics/derivatives|derivatives]] into a vector; that is where [[mathematics/linear-algebra|linear algebra]] and calculus meet.

## A worked step

Take $J(w) = w^2$. Then $J'(w) = 2w$, so with $\alpha = 0.1$ starting at $w = 1$:

$$
\begin{aligned}
w_1 &= 1 - 0.1 \cdot 2 = 0.8 \\
w_2 &= 0.8 - 0.1 \cdot 1.6 = 0.64 \\
w_3 &= 0.64 - 0.1 \cdot 1.28 = 0.512
\end{aligned}
$$

Each step shrinks $w$ by a factor of $0.8$.

## Learning rate

| Learning rate | Typical behaviour |
| --- | --- |
| too small | crawls, may never arrive |
| about right | steady decrease |
| too large | overshoots and diverges |

> [!warning] Downhill is local
> Gradient descent finds *a* minimum, not necessarily *the* minimum. Non-convex losses have many valleys.

[[Linear regression]] is the simplest place to watch it work.
