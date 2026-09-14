---
title: "Answer key: refresher practice"
description: Explanations and solutions for the refresher practice questions.
tags: [cs50, c, practice]
---
# Answer key: refresher practice

[Start here](00-start-here.md) · [Back to the questions](05-practice.md)

These answers correspond to the original exercises in the practice note. Several correct implementations are possible.

## 1. Binary

`00110110` is `32 + 16 + 4 + 2 = 54`.

`25 = 16 + 8 + 1`, so its eight-bit representation is `00011001`.

Six bits distinguish `2^6 = 64` patterns. Interpreted as unsigned integers, their range is `0` through `63`.

## 2. Representation

Bits acquire meaning from how a program interprets them. A pattern could be an integer, a character code, or part of a pixel's color.

A visible character does not necessarily fit into one byte. Unicode encodings can use multiple bytes per code point, and a visible symbol can combine several code points.

## 3. Algorithms

Checking titles individually can require visiting the whole list. Repeated halving reduces the remaining candidates quickly: after one step, about half remain; after two, about a quarter.

The list must be sorted according to the order used for comparisons. That lets you conclude that the target cannot be in the discarded half. Also handle the case where no candidates remain.

## 4. Building blocks

| Pair | Difference |
| --- | --- |
| Boolean expression / conditional | An expression produces a true/false result; a conditional uses a condition to choose what runs |
| Argument / parameter | An argument is supplied at the call; a parameter is the input name in the function definition |
| Return value / side effect | A return value goes back to the caller; a side effect changes something observable, such as terminal output |
| Abstraction / decomposition | Abstraction hides details behind an interface; decomposition divides a larger problem into smaller jobs |

## 5. Loop boundary

```text
0
1
2
3
```

Four iterations. The condition is still true when `i` is `3`; after the update to `4`, it becomes false.

## 6. Integer division

```text
2 2.25 2.00
```

`a / b` divides two integers. `(double) a / b` converts an operand before division, preserving the fraction. `(double) (a / b)` first calculates integer `2`, then converts it to a `double`. Formatting displays that last result as `2.00`.

## 7. Nested loops

```text
@@
@@
@@
```

Three rows times two inner iterations gives six executions of the inner body. Each completed row is followed by one newline.

## 8. Scope and values

```text
5 7
```

The helper's parameter is a separate integer initialized with a copy of `5`. Updating it does not update the caller's variable. The returned `7` initializes `result`.

## 9. Range validation

A number cannot be both less than `2` and greater than `8`, so the original condition is always false and never requests another input.

The corrected condition is:

```c
while (value < 2 || value > 8);
```

Being outside either boundary is enough to make the value invalid. The valid range uses AND; its invalid complement uses OR.

## 10. Character choice

The constant `'R'` is nonzero, so the original OR condition is always true. Repeat the comparison:

```c
if (choice == 'r' || choice == 'R')
{
    printf("Restart selected.\n");
}
```

## 11. Lifetime of a name

The declaration inside the `do` block is not in scope at the condition or the final `printf`. Move it outside:

```c
int attempts;
do
{
    attempts = get_int("Positive attempts: ");
}
while (attempts < 1);

printf("%i\n", attempts);
```

The first iteration assigns the variable before either later use.

## 12. Countdown

**Complete program — standard C.** Save as `countdown.c`:

```c
#include <stdio.h>

int main(void)
{
    for (int remaining = 4; remaining > 0; remaining--)
    {
        printf("%i\n", remaining);
    }
    printf("Go!\n");
}
```

Expected output:

```text
4
3
2
1
Go!
```

The final message comes after the loop so it prints once.

## 13. A reusable conversion

**Complete program — standard C.** Save as `conversion.c`:

```c
#include <stdio.h>

int hours_to_minutes(int hours);

int main(void)
{
    int minutes = hours_to_minutes(2);
    printf("%i minutes\n", minutes);
}

int hours_to_minutes(int hours)
{
    return hours * 60;
}
```

Expected output: `120 minutes`, followed by a newline. The prototype describes the interface; the definition performs the conversion. The exercise assumes an input whose converted value fits in `int`.

## 14. Validated input

**Complete program — requires CS50.** Save as `session.c`:

```c
#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int minutes;
    do
    {
        minutes = get_int("Session length (5-60 minutes): ");
    }
    while (minutes < 5 || minutes > 60);

    printf("Session: %i minutes\n", minutes);
}
```

`4` and `61` should trigger another prompt. `5` and `60` should be accepted. Test rejected values followed by an accepted value so the program can finish.

## 15. Bonus review application

**Complete program — requires CS50.** Save as `rounds.c`:

```c
#include <cs50.h>
#include <stdio.h>

void print_rounds(int count);

int main(void)
{
    int rounds;
    do
    {
        rounds = get_int("Practice rounds (1-5): ");
    }
    while (rounds < 1 || rounds > 5);

    print_rounds(rounds);
}

void print_rounds(int count)
{
    for (int round = 1; round <= count; round++)
    {
        printf("Round %i\n", round);
    }
}
```

For input `3`, after the prompt:

```text
Round 1
Round 2
Round 3
```

The counter starts at `1` to match the labels people see. A zero-based version can keep the internal counter separate from the displayed number:

```c
for (int i = 0; i < count; i++)
{
    printf("Round %i\n", i + 1);
}
```

Both print exactly `count` rounds. Starting at zero is useful for indexing, but not mandatory for every loop.
