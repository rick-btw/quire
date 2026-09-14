---
title: Common C mistakes
description: What goes wrong in beginner C, how to recognize it, and how to fix it.
tags: [cs50, c, debugging]
---
# Common C mistakes

[Start here](00-start-here.md) · [Syntax reference](03-c-syntax-reference.md) · [Practice](05-practice.md)

Examples marked **Wrong** are deliberately incorrect. Assume any variables mentioned are declared in the enclosing program.

## 1. Assignment instead of comparison

**Wrong when you intend to compare:**

```c
if (count = 3)
{
    printf("Three!\n");
}
```

This assigns `3` to `count`. The assignment expression has value `3`, which is true in a condition, so the body runs.

**Fix:** `if (count == 3)`. A compiler warning can identify a real logic error even when compilation succeeds.

## 2. An incomplete OR comparison

**Wrong:** `if (choice == 'a' || 'A')`

The right side is a character constant with a nonzero value, so this condition is true regardless of `choice`.

**Fix:** `if (choice == 'a' || choice == 'A')`

Each side must express its own comparison. Likewise, write `low <= x && x <= high`, not the mathematical chain `low <= x <= high`.

## 3. An accidental empty loop body

**Wrong:**

```c
int i = 0;
while (i < 3);
{
    i++;
}
```

The semicolon is an empty statement that becomes the loop body. Nothing changes `i` in the loop, so this example never reaches the block below it.

**Fix:** remove the semicolon after the condition. Keep the semicolon at the end of a `do ... while` statement; that one is required.

## 4. Counting one time too many

If `n` is `4`, `i = 0; i <= n; i++` visits `0, 1, 2, 3, 4`: five iterations.

For four iterations starting at zero, use `i < n`. Check the first value, the last value that enters the body, and the value that stops the loop.

This becomes especially significant with arrays: an array of length `n` has no element at index `n`.

## 5. Losing fractions before assignment

```c
double first = 5 / 8;           // 0.0
double second = (double) 5 / 8; // 0.625
double third = (double) (5 / 8);// 0.0
```

The operands determine how division happens. A `double` destination cannot restore a fraction already discarded by integer division. Convert an operand **before** dividing, or use a floating-point literal such as `5.0 / 8`.

## 6. Confusing output formatting with precision

`printf("%.2f\n", value)` displays two decimal places. It does not round the stored variable to two places or make its earlier calculations exact.

Binary floating-point cannot represent every decimal fraction exactly, much as decimal notation cannot represent one third with finitely many digits. `double` usually reduces approximation error compared with `float`, but does not eliminate it.

## 7. Assuming a larger destination prevents overflow

If `a` and `b` are `int`, `long total = a + b;` still performs the addition as `int`. The addition may overflow before assignment.

`long total = (long) a + b;` performs the addition as `long`. This helps only if `long` has sufficient range and the result fits. Type ranges remain finite.

Signed overflow is undefined behavior: do not treat an observed wraparound as a guaranteed C rule. Unsigned arithmetic has defined modular behavior, but switching to unsigned does not automatically make a calculation correct.

## 8. Using a name outside its scope

**Wrong:**

```c
if (true)
{
    int points = 10;
}
printf("%i\n", points);
```

`points` is no longer in scope at the print statement. Declare a variable in a surrounding block if it must be used there, and ensure it receives a value before every read.

Similarly, `int value;` alone does not initialize an automatic local integer to zero. The validation pattern is safe because `get_int` assigns it before the condition reads it.

## 9. Expecting a helper to change a caller's integer

Changing an integer parameter changes the function's local copy. To update the caller's variable, return the calculated value and assign it:

```c
count = triple(count);
```

This assumes a suitable `triple` function has been declared and defined. The return value is discarded if you call `triple(count);` by itself.

## 10. Mismatching a placeholder and its argument

**Wrong:** `printf("%i\n", 2.5);`

The literal `2.5` is a `double`, but `%i` requires an `int`. This mismatch causes undefined behavior; it is not a request to convert the number to an integer.

**Fix:** `printf("%f\n", 2.5);`

Also match the number and order of arguments to placeholders. Use `%s` for text, `%c` for a character, and `%li` for a `long`. See the [printf manual](https://manual.cs50.io/3/printf).

## 11. Treating strings as individual characters

`'q'` and `"q"` have different meanings. Compare a `char` to `'q'`. Do not use `==` to compare the contents of two strings; it does not perform a text-content comparison. String comparison will become clearer as you study arrays and strings.

## 12. Running an old executable

If compilation fails, an executable from an earlier successful build may still exist. Running it tests the old program.

Save your source, resolve the first reported compiler error, rebuild successfully, then run again. One missing brace or quote can cause many later error messages.

## A small debugging routine

1. State the expected result for one specific input.
2. Classify the problem: compile error, crash, wrong result, or failure to stop.
3. Read the first diagnostic, or trace the variables through the relevant lines.
4. Temporarily print values just before the decision or calculation that seems wrong.
5. Make one focused correction and test ordinary input plus boundary cases.

For a valid range of `2` through `8`, useful tests include `1`, `2`, `8`, and `9`. Check both ends of the range, not just a value in the middle.
