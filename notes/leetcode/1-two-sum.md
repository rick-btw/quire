---
title: 1. Two Sum
description: Find two numbers that add up to a target.
tags: [leetcode, easy, arrays]
---
https://leetcode.com/problems/two-sum/

Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Each input has exactly one solution and you may not use the same element twice.

> [!example] Example
> **Input:** `nums = [2, 7, 11, 15]`, `target = 9`
> **Output:** `[0, 1]`, because `nums[0] + nums[1] == 9`

## Brute force

Check every pair: $O(n^2)$ time, $O(1)$ space.

## One-pass hash map

Walk the array once. For each number, ask the [[data-structures/hash-maps|hash map]] whether `target - num` has already been seen.

```python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
    return []
```

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        Integer j = seen.get(target - nums[i]);
        if (j != null) return new int[] { j, i };
        seen.put(nums[i], i);
    }
    return new int[0];
}
```

## Complexity

| Approach | Time | Space |
| --- | --- | --- |
| brute force | $O(n^2)$ | $O(1)$ |
| hash map | $O(n)$ | $O(n)$ |
