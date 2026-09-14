---
title: "Lecture 1: programming in C"
description: How a C program works, from types and decisions to loops, functions, and scope.
tags: [cs50, c]
---
# Lecture 1: programming in C

[Start here](00-start-here.md) · [C syntax reference](03-c-syntax-reference.md) · [Common mistakes](04-common-mistakes.md)

## From blocks to text

The core ideas from Scratch still apply. C requires you to express their structure explicitly using types, parentheses, braces, and punctuation.

```text
Write source code --> Build an executable --> Run it --> Inspect the result
       ^                                                    |
       +---------------- Revise and repeat -----------------+
```

**Source code** is the text in a `.c` file. A **compiler** translates C into lower-level code; the build process produces an executable. `make` is a build tool that invokes the needed commands, including compilation. It is not itself the C compiler.

Saving an edit does not update an existing executable. Rebuild before running your changed program.

## Anatomy of a program

**Complete program — standard C.** Save as `welcome.c`:

```c
#include <stdio.h>

int main(void)
{
    printf("Ready to review C!\n");
    return 0;
}
```

| Piece | Meaning |
| --- | --- |
| `#include <stdio.h>` | Makes standard input/output declarations available, including `printf` |
| `int main(void)` | Defines the program's entry function, returning an integer and accepting no arguments |
| `{ ... }` | Groups statements into a block |
| `printf(...)` | Calls a function to format and display output |
| `"..."` | A string literal |
| `\n` | A newline escape sequence within the string |
| `;` | Ends a statement such as a function call or `return` |
| `return 0;` | Ends `main` with a success status |

Reaching the closing brace of `main` also returns zero in modern C, which is why some CS50 examples omit the explicit return.

In the CS50 environment:

```sh
make welcome
./welcome
```

`./` refers to the current directory. Use `make welcome`, without `.c`, to build the executable named `welcome`.

## Variables, types, and input

A variable has a name and a type. Its type constrains the values it can represent and affects operations performed with it.

```c
int attempts = 0;
attempts = attempts + 1;
```

The first line **declares and initializes** `attempts`. The second assigns a new value to the existing variable. Read the second line as: “Calculate the old value plus one, then store the result.”

**Complete program — requires CS50.** Save as `reading.c`:

```c
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int pages = get_int("Pages read today: ");
    printf("You read %i pages.\n", pages);
}
```

Here the prompt is an argument to `get_int`. The returned integer initializes `pages`. Later, `pages` is an argument to `printf`.

`get_int` handles requesting integer input, but a valid integer may still be unsuitable for your application. For example, `-8` is an integer but not a sensible page count.

Common types include `int`, `long`, `float`, `double`, `char`, and `bool`. CS50 additionally defines `string`; it is not a built-in C type. See the [type table](03-c-syntax-reference.md) for declarations and format codes. The [CS50 library documentation](https://cs50.readthedocs.io/libraries/cs50/c/) describes the input helpers and their environment requirements.

## Decisions and Boolean expressions

```c
int temperature = 18;

if (temperature < 15)
{
    printf("Bring a jacket.\n");
}
else if (temperature < 25)
{
    printf("Mild weather.\n");
}
else
{
    printf("Bring water.\n");
}
```

Conditions are checked in order. The first true branch runs, then the whole chain finishes. When the second condition is reached, you already know the temperature is at least `15`.

Separate `if` statements are different: each is checked independently, so more than one body may run.

- `x == y` asks whether values are equal; `x = y` assigns a value.
- `x >= 1 && x <= 6` requires both comparisons to be true.
- `choice == 'a' || choice == 'A'` requires at least one comparison to be true.
- `!finished` negates a condition.

In C, zero is false and nonzero is true when interpreted as a condition. Prefer explicit comparisons while rebuilding your confidence.

## Loops and boundaries

Use a loop when the same operation must happen repeatedly.

### `for`: keep counting details together

```c
for (int i = 0; i < 4; i++)
{
    printf("Step %i\n", i);
}
```

Execution order:

1. Initialize `i` once.
2. Check `i < 4`; stop if false.
3. Execute the body.
4. Increment `i`, then return to the condition.

The body sees `0`, `1`, `2`, and `3`: four iterations. On the next check, `i` is `4`, so the body does not run.

### `while`: test before running

```c
int remaining = 3;
while (remaining > 0)
{
    printf("%i remaining\n", remaining);
    remaining--;
}
```

A `while` loop may run zero times. Make sure something can cause its condition to become false when termination is intended.

### `do ... while`: run before testing

Fragment inside `main`, with `cs50.h` included:

```c
int rating;
do
{
    rating = get_int("Rating from 1 to 5: ");
}
while (rating < 1 || rating > 5);
```

This prompts at least once, then repeats **while the input is invalid**. The variable is declared outside the braces so the condition can access it. Notice the semicolon after `while (...)`.

### Nested loops

```c
for (int row = 0; row < 2; row++)
{
    for (int column = 0; column < 4; column++)
    {
        printf("+");
    }
    printf("\n");
}
```

Output:

```text
++++
++++
```

The inner loop starts over for each outer iteration. There are eight calls that print `+`, and two that print newlines. The newline belongs after the inner loop because it ends a whole row.

## Functions: arguments, parameters, and results

**Complete program — standard C.** Save as `duration.c`:

```c
#include <stdio.h>

int minutes_to_seconds(int minutes);

int main(void)
{
    int duration = minutes_to_seconds(3);
    printf("Duration: %i seconds\n", duration);
}

int minutes_to_seconds(int minutes)
{
    return minutes * 60;
}
```

This example assumes a small, nonnegative duration that fits in `int` after conversion.

- **Prototype:** `int minutes_to_seconds(int minutes);` tells the compiler how the function can be called before its definition appears.
- **Definition:** the function header and body implement its behavior.
- **Parameter:** `minutes` is the local name for input inside the function.
- **Argument:** `3` is the actual value supplied by this call.
- **Return value:** `180` is sent back to the caller and stored in `duration`.

The conversion function computes a result; `printf` displays it. A function that performs an action without returning a value uses a return type of `void`.

`return` ends the current function immediately. Returning a number does not automatically print it.

## Scope and passing values

**Scope** determines where a name is usable. A local variable is generally available from its declaration through the end of its enclosing block. A loop variable declared in a `for` header belongs to that loop.

For integer arguments, the function receives its own copy of the value. Changing that parameter does not change the caller's integer variable. Two functions can each have a variable named `count`; those are separate variables.

If you need a calculated value in the caller, return it and store it there. Practice question 8 tests this distinction.

## Arithmetic has limits

```c
int completed = 5;
int total = 8;
double fraction = (double) completed / total;
```

Without the cast, `completed / total` uses integer division and yields `0`. Casting one operand before division makes this calculation floating-point and yields `0.625`.

Other limits to remember:

- Integer types have finite ranges. A wider type may give more room, but cannot hold arbitrarily large values.
- Signed integer overflow is undefined behavior in C. Do not depend on it wrapping to a particular value.
- Floating-point numbers approximate many fractions. More decimal places in output do not create more stored precision.

See [common mistakes](04-common-mistakes.md) for worked examples.

## Correctness, design, and style

| Dimension | A question to ask yourself |
| --- | --- |
| Correctness | Does it work for ordinary inputs, boundaries, and invalid inputs? |
| Design | Are responsibilities clear, with useful functions and little unnecessary repetition? |
| Style | Are names, indentation, spacing, and comments clear and consistent? |

Compile success checks neither your intended behavior nor all possible runtime problems. Test the boundary values yourself. A helpful comment explains a decision, such as why a limit exists.

## Connection to lecture 2

You already know how to store one value, pass a value into a function, and repeat an operation with a counter. Arrays let you work with a sequence of values under one name.

**Small preview:** for an array containing `n` elements, valid indices are `0` through `n - 1`. That is why `i = 0; i < n; i++` deserves special attention. The syntax and memory details belong to lecture 2 and later.

Course reference: the official [Lecture 1 notes](https://cs50.harvard.edu/x/notes/1/) cover C's basic building blocks, functions, scope, and numeric limitations; the [Week 1 page](https://cs50.harvard.edu/x/weeks/1/) also links the shorts.
