---
title: C syntax reference
description: Copyable C patterns, operators, format codes, headers, and terminal commands.
tags: [cs50, c, reference]
---
# C syntax reference

[Start here](00-start-here.md) · [Concept explanations](02-lecture-1-programming-in-c.md) · [Common mistakes](04-common-mistakes.md)

A reference for the C used around CS50x lectures 1–2. Unless marked **Complete program**, examples are fragments; supply the appropriate headers and enclosing function.

## Program skeleton and headers

**Complete program — standard C:**

```c
#include <stdio.h>

int main(void)
{
    printf("Review time!\n");
    return 0;
}
```

| Header | Use it for |
| --- | --- |
| `#include <stdio.h>` | `printf` and standard input/output declarations |
| `#include <cs50.h>` | CS50's `string` alias and `get_*` input functions |
| `#include <stdbool.h>` | `bool`, `true`, and `false` in the C11-style examples here |

CS50's header also includes Boolean support. A header supplies declarations and definitions needed to compile your source; using an external library also requires linking its implementation. CS50's environment handles that setup for its library. See the [library documentation](https://cs50.readthedocs.io/libraries/cs50/c/).

## Declarations and types

```c
int count = 6;
count = 9;
const int LIMIT = 20;
```

Declare a variable with its type; omit the type when updating it. `const` prevents ordinary assignment to that variable after initialization. Uppercase names for constants are a convention, not a language requirement.

| Type | Intended use | Example declaration | `printf` code |
| --- | --- | --- | --- |
| `int` | Whole numbers | `int count = 6;` | `%i` or `%d` |
| `long` | Whole numbers, potentially a wider range | `long population = 5000000000L;` | `%li` or `%ld` |
| `float` | Floating-point numbers | `float distance = 2.5f;` | `%f` |
| `double` | Floating-point with at least as much precision as `float` | `double average = 2.5;` | `%f` |
| `char` | A single byte-sized character value, such as an ASCII letter | `char grade = 'B';` | `%c` |
| `bool` | True or false | `bool ready = true;` | `%i` for `0` or `1` |
| `string` | Text, using CS50's alias | `string topic = "Arrays";` | `%s` |

The large `long` example assumes a 64-bit `long`, as in CS50's Linux environment. Type sizes depend on the platform: `long` is not universally 64 bits. The suffix `L` makes an integer literal a `long` when it fits; `f` makes a floating literal a `float`. A decimal literal such as `2.5` is a `double` by default.

Use **single quotes** for a character (`'B'`) and **double quotes** for a string (`"B"`). A `char` is not a general container for an arbitrary Unicode character.

## Input and formatted output

CS50 input fragments:

```c
int count = get_int("Count: ");
long distance = get_long("Distance: ");
float temperature = get_float("Temperature: ");
double average = get_double("Average: ");
char choice = get_char("Choice: ");
string topic = get_string("Topic: ");
```

Output fragments, using the variables above:

```c
printf("Count: %i\n", count);
printf("%s: %.2f\n", topic, average);
printf("Progress: 75%%\n");
```

Placeholders consume arguments in order. `%.2f` displays two digits after the decimal point; it does not change the variable. `%%` displays a literal percent sign and consumes no argument. `printf` uses `%f` for both `float` and `double` arguments; `float` is promoted when passed to it. These are **output** rules, not a guide to `scanf`. See the official [printf reference](https://manual.cs50.io/3/printf).

| Escape sequence in a string | Meaning |
| --- | --- |
| `\n` | Newline |
| `\t` | Horizontal tab |
| `\"` | Double quote |
| `\\` | Backslash |

## Operators

| Category | Operators | Example |
| --- | --- | --- |
| Arithmetic | `+`, `-`, `*`, `/` | `double half = 9 / 2.0;` |
| Integer remainder | `%` | `int leftover = 17 % 5;` gives `2` |
| Assignment | `=` | `count = 4;` |
| Update | `+=`, `-=`, `*=`, `/=` | `count += 3;` |
| Increment / decrement | `++`, `--` | `count++;` |
| Equality | `==`, `!=` | `count != 0` |
| Ordering | `<`, `<=`, `>`, `>=` | `count >= 2` |
| Logical AND | `&&` | `count >= 2 && count <= 8` |
| Logical OR | `\|\|` | `choice == 'a' \|\| choice == 'A'` |
| Logical NOT | `!` | `!ready` |

Multiplication and division bind more tightly than addition and subtraction. Use parentheses to make intent clear: `(a + b) / 2.0` averages two numbers; `a + b / 2.0` does not.

For integer operands, `/` discards the fractional part toward zero: `9 / 4` is `2`; `-9 / 4` is `-2`. `%` is integer remainder. Neither integer division nor remainder is valid with a zero divisor.

```c
int a = 9;
int b = 4;
double quotient = (double) a / b;
```

`&&` and `||` short-circuit: the right side is evaluated only when needed. In `divisor != 0 && value % divisor == 0`, the remainder is skipped when `divisor` is zero.

## Conditional pattern

```c
if (score >= 80)
{
    printf("Target reached.\n");
}
else if (score >= 50)
{
    printf("Keep going.\n");
}
else
{
    printf("Try a smaller step.\n");
}
```

`score` must already be declared. Use `else` without a condition. Normally, do not put a semicolon immediately after an `if` condition or after the block's closing brace.

## Loop patterns

Count `n` times, assuming `n` is a nonnegative integer:

```c
for (int i = 0; i < n; i++)
{
    printf("%i\n", i);
}
```

Repeat while a condition holds:

```c
int remaining = 4;
while (remaining > 0)
{
    printf("%i\n", remaining);
    remaining--;
}
```

Prompt at least once, repeating while invalid; requires `cs50.h`:

```c
int value;
do
{
    value = get_int("Enter 2 through 8: ");
}
while (value < 2 || value > 8);
```

**Optional extra — loop controls:** `break;` leaves the innermost loop immediately. `continue;` skips the rest of the current iteration; a `for` loop still performs its update before testing again.

## Function patterns

A prototype belongs at file scope, before the function is called:

```c
int triple(int number);
```

A definition also belongs at file scope, outside `main` and other functions:

```c
int triple(int number)
{
    return number * 3;
}
```

A call can appear inside `main`:

```c
int result = triple(4);
printf("%i\n", result);
```

Use small inputs here so the multiplication fits in `int`.

| Signature | Returns | Accepts |
| --- | --- | --- |
| `void announce(void)` | No value | No arguments |
| `void announce(int count)` | No value | One integer |
| `int read_count(void)` | An integer | No arguments |
| `int triple(int number)` | An integer | One integer |

A prototype ends with `;`. A definition has a body. Every path that finishes a value-returning helper should return the promised value. `return;` can end a `void` function early.

## Comments and punctuation

```c
// A single-line comment.

/* A comment that can
   span multiple lines. */
```

| Symbol | Common job here |
| --- | --- |
| `;` | End a statement or prototype; separate parts of a `for` header |
| `{ }` | Enclose a function, branch, or loop body |
| `( )` | Enclose conditions, function arguments, or grouped expressions |
| `,` | Separate arguments or parameters |
| `#` | Begin a preprocessing directive such as `#include` |

`#include` lines do not end in semicolons. C is case-sensitive: `Count` and `count` are different names. Braces determine blocks; indentation makes those blocks readable.

## Terminal reference

These commands go in the terminal, not in a `.c` file.

| Command | Purpose |
| --- | --- |
| `pwd` | Show your current folder |
| `ls` | List its contents |
| `cd practice` | Enter the `practice` folder |
| `cd ..` | Go up one folder |
| `mkdir practice` | Create a folder |
| `code sample.c` | Open a source file in the course editor |
| `make sample` | Build `sample` from `sample.c` in the CS50 setup |
| `./sample` | Run that executable |
| `cp sample.c backup.c` | Copy a file |
| `mv old.c new.c` | Rename or move a file |
| `rm backup.c` | Delete a file |
| `rmdir empty-folder` | Remove an empty folder |

For a standard C program that does not use the CS50 library, a local Clang installation can build it explicitly:

```sh
clang -std=c11 -Wall -Wextra sample.c -o sample
./sample
```

If output looks unchanged, check that you saved the file, rebuilt successfully, and ran the executable from the intended folder.
