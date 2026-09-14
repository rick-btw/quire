---
title: Derivatives
description: The instantaneous rate of change.
tags: [mathematics, calculus]
---
The derivative of $f$ at $x$ is the slope of the tangent line:

$$
f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}
$$

## Rules worth memorising

| Rule | Statement |
| --- | --- |
| Power | $\frac{d}{dx} x^n = n x^{n-1}$ |
| Product | $(fg)' = f'g + fg'$ |
| Chain | $(f \circ g)' = (f' \circ g) \cdot g'$ |

## Partial derivatives

For $f(x, y)$, hold one variable fixed and differentiate the other. The vector of partials is the **gradient**, $\nabla f$, which points uphill. [[gradient-descent]] walks the other way.

## یادداشت فارسی

مشتق، سرعتِ تغییر یک تابع را در یک نقطه اندازه می‌گیرد. اگر $f'(x) > 0$ باشد، تابع در آن نقطه صعودی است و اگر منفی باشد، نزولی.
