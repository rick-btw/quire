---
title: Linear regression
tags: [machine-learning]
---
# Linear regression

Fit a line (or hyperplane) $\hat{y} = Xw$ by minimising squared error:

$$
J(w) = \frac{1}{2n} \lVert Xw - y \rVert^2
$$

## Closed form

$$
w^\star = (X^\top X)^{-1} X^\top y
$$

That inverse is $O(d^3)$: fine for a few hundred features, hopeless for a few million.

## With gradient descent

The gradient is $\nabla J(w) = \frac{1}{n} X^\top (Xw - y)$, so [[GD]] just repeats

```typescript
for (let step = 0; step < steps; step++) {
  const residual = X.mul(w).sub(y);
  w = w.sub(X.T.mul(residual).scale(alpha / n));
}
```

until the residual stops shrinking.
