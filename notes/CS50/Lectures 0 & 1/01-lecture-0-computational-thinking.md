---
title: "Lecture 0: computational thinking"
description: Binary, representation, algorithms, pseudocode, abstraction, and the building blocks from Scratch.
tags: [cs50, computational-thinking]
---
# Lecture 0: computational thinking

[Start here](00-start-here.md) · [Next: programming in C](02-lecture-1-programming-in-c.md)

## The central idea

Programming turns a problem into instructions that a computer can execute. Before choosing syntax, identify what you receive, what you need to produce, and the steps connecting them.

```text
Input              Algorithm                 Output
Temperatures  -->  Find the largest value --> Highest temperature
```

A program can carry out its instructions perfectly and still give the wrong answer if the instructions describe the wrong procedure.

## Bits, bytes, and binary

A **bit** has two possible values: `0` or `1`. In the systems used in CS50, a **byte** contains eight bits.

Decimal uses powers of ten as place values. Binary uses powers of two:

```text
Place value:  128  64  32  16   8   4   2   1
Bits:           0   0   1   0   1   1   0   1

00101101 = 32 + 8 + 4 + 1 = 45
```

Read from the right: the first place is `2^0 = 1`, then `2^1 = 2`, then `2^2 = 4`, and so on. Here `^` means exponentiation in mathematical notation; it does **not** mean exponentiation in C.

With `n` bits, there are `2^n` different patterns. When all patterns represent nonnegative integers, the range is `0` through `2^n - 1`.

| Bits | Patterns | Unsigned range |
| --- | --- | --- |
| 3 | 8 | 0–7 |
| 4 | 16 | 0–15 |
| 8 | 256 | 0–255 |

**Why subtract one?** Zero uses one of the available patterns. Eight patterns do not let you count from zero through eight.

To convert a small decimal number to binary, subtract the largest power of two that fits, mark that position `1`, and repeat with the remainder. For `19`, choose `16`, then `2`, then `1`: `00010011`.

## Bits need an interpretation

A bit pattern has no built-in meaning such as “letter” or “color.” An encoding and the program reading it determine the interpretation.

| Kind of data | How bits can represent it |
| --- | --- |
| Integers | Positions contribute powers of two |
| Text | Numeric character codes are stored using an agreed encoding |
| Images | Numbers describe pixel colors |
| Audio | Numbers describe sampled sound amplitude over time |
| Video | A sequence of images, usually with audio |

### ASCII and Unicode

**ASCII** assigns codes to 128 characters, including letters, digits, punctuation, and control characters. For example, uppercase `B` has code `66`; lowercase `b` has code `98`. A digit character such as `'7'` has a character code; it is not the integer value `7`.

**Unicode** assigns code points to a much wider collection of characters. Encodings such as UTF-8 specify how to store those code points as bytes. A visible character or emoji can require multiple bytes and sometimes multiple code points.

Remember the distinction: **one visible character does not always equal one byte**. This will matter when you work with strings.

### RGB

One common color representation uses red, green, and blue intensities. With eight bits per channel, each intensity ranges from `0` to `255`.

| RGB values | Color |
| --- | --- |
| `(0, 0, 0)` | Black |
| `(255, 255, 255)` | White |
| `(255, 0, 0)` | Red |
| `(0, 0, 255)` | Blue |

This RGB representation uses 24 bits per pixel for color. Actual image files may include compression, metadata, or additional channels.

## Algorithms: correctness and efficiency

An **algorithm** is a precise procedure for solving a problem.

Suppose you are looking for a word in a sorted glossary:

- Checking every entry in order works, but a larger glossary can require proportionally more checks.
- Checking the middle and discarding the half that cannot contain the word shrinks the remaining search much faster.

Halving repeatedly takes roughly one extra decision each time the glossary doubles in size. That strategy depends on the glossary being **sorted**. Discarding half of an unsorted collection could discard your target.

Three useful questions:

1. Does the procedure return the right result?
2. Does it stop, including when the target is absent?
3. How does the amount of work grow as the input grows?

You will formalize efficiency later. For now, recognize that two correct procedures can do very different amounts of work.

## Pseudocode: solve the logic first

**Pseudocode** expresses the steps without requiring valid syntax in a particular programming language.

For a room with a capacity of 12 people:

```text
Ask how many people are coming
While the number is negative
    Ask again
If the number is at most 12
    Report that the group fits
Otherwise
    Report that a larger room is needed
```

The indentation shows which steps belong together. The procedure includes ordinary input, invalid input, and the boundary value `12`.

Good pseudocode describes actions precisely enough to implement. “Handle the input” hides the decision you still need to make.

## The building blocks from Scratch

| Concept | Meaning | Scratch example |
| --- | --- | --- |
| Sequence | Perform instructions in order | Move, then play a sound |
| Function | A named action or operation | `say`, `move`, or a custom block |
| Argument | A value supplied to an operation | The number of steps to move |
| Result | A value an operation produces for later use | The value reported by an operator block |
| Variable | Named state that can change | A score or countdown |
| Boolean expression | A question with a true/false answer | “Is score greater than 10?” |
| Conditional | Choose which instructions run | `if` / `else` |
| Loop | Repeat instructions | `repeat`, `forever`, `repeat until` |
| Event | Something that starts a script | Green flag clicked or key pressed |
| Concurrent scripts | Multiple scripts progressing during execution | One sprite moves while another reacts |

Scratch's `ask` block makes the response available through `answer`. In C, functions such as `get_int` provide input through a **return value**.

An operation can also have a **side effect**: a visible or external change, such as displaying text or playing a sound. Producing a value and displaying it are different things.

## Abstraction and decomposition

**Decomposition** breaks a larger task into smaller tasks. A quiz game might need to show a question, accept an answer, check it, and update the score.

**Abstraction** gives a useful name and interface to some details so other code can use them without repeating them. A custom `celebrate` block could contain sound, animation, and a message. Its caller only needs to request `celebrate`.

Parameters make abstractions reusable: `move_steps(distance)` expresses one operation that works for different distances.

An abstraction should make the program easier to understand. It is useful when its name captures a coherent job.

## Recall before moving on

- How many values can six bits distinguish?
- Why could the same byte represent either a number or a letter?
- What assumption makes repeatedly halving a search correct?
- What is the difference between a Boolean expression and a conditional?
- How does a custom Scratch block prepare you for a C function?

Check your understanding with [practice questions 1–4](05-practice.md).

Course reference: these topics appear in the official [Week 0 outline](https://cs50.harvard.edu/x/weeks/0/); the [Lecture 0 notes](https://cs50.harvard.edu/x/notes/0/) include the course demonstrations.
