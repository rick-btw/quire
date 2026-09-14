---
title: "Practice: recall, trace, fix, write"
description: Recall questions, code tracing, debugging, and small C exercises for lectures 0 and 1.
tags: [cs50, c, practice]
---
# Practice: recall, trace, fix, write

[Start here](00-start-here.md) · [Answer key](06-answer-key.md)

Try predicting results before running anything. These are original refresher exercises. The answer key is a separate note so you can keep it closed.

For fragments, assume the appropriate enclosing function and headers unless the question is about a missing declaration or scope.

## Recall

### 1. Binary

Convert `00110110` to decimal. Write decimal `25` in eight-bit binary. How many different values can six bits distinguish, and what is their unsigned range?

### 2. Representation

Why could one byte be interpreted as either a number or a character? Does one visible character always occupy one byte? Explain.

### 3. Algorithms

You need to find a title in an alphabetically sorted list. Why can repeatedly discarding half be faster than checking every title? What assumption makes discarding a half valid?

### 4. Building blocks

Explain each pair in your own words:

- Boolean expression and conditional.
- Argument and parameter.
- Return value and side effect.
- Abstraction and decomposition.

## Trace the code

### 5. Loop boundary

What numbers are printed? How many times does the body run?

```c
for (int i = 0; i <= 3; i++)
{
    printf("%i\n", i);
}
```

### 6. Integer division

What does this print, and why?

```c
int a = 9;
int b = 4;
printf("%i %.2f %.2f\n", a / b, (double) a / b, (double) (a / b));
```

### 7. Nested loops

Write the exact output. How many times does the inner body execute overall?

```c
for (int row = 0; row < 3; row++)
{
    for (int column = 0; column < 2; column++)
    {
        printf("@");
    }
    printf("\n");
}
```

### 8. Scope and values

**Complete program — standard C:**

```c
#include <stdio.h>

int add_two(int number);

int main(void)
{
    int number = 5;
    int result = add_two(number);
    printf("%i %i\n", number, result);
}

int add_two(int number)
{
    number += 2;
    return number;
}
```

What is printed? Why does modifying `number` inside the helper not modify the variable in `main`?

## Find and fix the bug

### 9. Range validation

This fragment intends to accept an integer from `2` through `8`, inclusive. What is wrong with its condition?

```c
int value;
do
{
    value = get_int("Enter 2 through 8: ");
}
while (value < 2 && value > 8);
```

### 10. Character choice

This fragment should print only when `choice` contains lowercase or uppercase `r`. Explain the mistake and fix it.

```c
if (choice == 'r' || 'R')
{
    printf("Restart selected.\n");
}
```

### 11. Lifetime of a name

Why does this fail to compile? Rewrite it so the final `printf` can use the input.

```c
do
{
    int attempts = get_int("Positive attempts: ");
}
while (attempts < 1);

printf("%i\n", attempts);
```

## Write a small program

### 12. Countdown

Write a complete standard C program that prints `4`, `3`, `2`, and `1`, each on its own line, followed by `Go!`. Use a loop.

### 13. A reusable conversion

Write a function `int hours_to_minutes(int hours)` and a `main` that calls it with `2` and prints the returned result. Put a prototype above `main` and the definition below it. Assume a small, nonnegative input.

### 14. Validated input

Using the CS50 library, request a session length from `5` through `60` minutes, inclusive. Repeat until the input is valid, then print the accepted length. Try inputs `4`, `5`, `60`, and `61`.

### 15. Bonus: a tiny review application

Ask for a number of practice rounds from `1` through `5`. Write a function `void print_rounds(int count)` that prints `Round 1` through `Round count`, each on a separate line. Keep input validation in `main` and printing in the helper.

Explain why the counter used for display starts at `1`, and how you could produce identical output using a counter that starts at `0`.

## Check your recall

For each question, mark whether you could explain it unaided, needed a hint, or need to revisit the concept. Then open the [answer key](06-answer-key.md). Reattempt the uncertain questions later without rereading their answers first.
