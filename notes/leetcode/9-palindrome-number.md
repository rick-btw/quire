---
title: 9. Palindrome Number
tags: [leetcode, easy, math]
---
https://leetcode.com/problems/palindrome-number/

Return `true` if an integer reads the same forwards and backwards.

## Without strings

Reverse the second half of the number and compare it with the first half. Stop when the reversed part catches up.

```python
def is_palindrome(x: int) -> bool:
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    reversed_half = 0
    while x > reversed_half:
        reversed_half = reversed_half * 10 + x % 10
        x //= 10
    return x == reversed_half or x == reversed_half // 10
```

Same trick as [[1-two-sum#Complexity]]: do the work once, in one pass.

> [!note]+ Edge cases
> Negative numbers are never palindromes. Numbers ending in zero (other than zero itself) cannot be, because no positive number starts with zero.
