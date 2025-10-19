# Dashboard Rectangle Display - Visual Guide

## Overview

This document provides a visual representation of how the Dashboard rectangles work and how data flows through the system.

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         📊 Dashboard - Child Name                           │
│                    Segunda-feira - 21/10/2024                               │
│                         🕐 15:30:45                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│    BLUE      │    GREEN     │     RED      │    ORANGE    │   PURPLE     │
│   🔵 Blue    │   🟢 Green   │   🔴 Red     │   🟠 Orange  │   🟣 Purple  │
│              │              │              │              │              │
│   Saldo      │   Pontos     │   Pontos     │   Gastos     │   Saldo      │
│   Inicial    │  Positivos   │  Negativos   │   do Dia     │   Atual      │
│   do Dia     │    Hoje      │    Hoje      │              │              │
│              │              │              │              │              │
│     100      │     +20      │      -5      │      -8      │     107      │
│              │              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
    ↑              ↑              ↑              ↑              ↑
    │              │              │              │              │
    │              │              │              │              └─── Result of formula
    │              │              │              │
    │              │              │              └───────────────── Total expenses
    │              │              │
    │              │              └──────────────────────────────── Absolute value of 
    │              │                                                 negative activities
    │              │
    │              └─────────────────────────────────────────────── Sum of positive 
    │                                                                activities
    │
    └────────────────────────────────────────────────────────────── Starting balance
                                                                     of the day
```

## Data Flow Diagram

```
                          Activities from Database
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Filter Today's Activities   │
                    │   (by date and childId)       │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  Filter points > 0  │       │  Filter points < 0  │
        │  (Positive)         │       │  (Negative)         │
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                              │
                   ▼                              ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │ Sum with multiplier │       │ Math.abs() to make  │
        │ points * multiplier │       │ value positive      │
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                              │
                   ▼                              ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │ positivePointsToday │       │ negativePointsToday │
        │     (e.g., 20)      │       │     (e.g., 5)       │
        └──────────┬──────────┘       └──────────┬──────────┘
                   │                              │
                   │              Expenses         │
                   │                  │            │
                   │                  ▼            │
                   │       ┌──────────────────┐   │
                   │       │  expensesToday   │   │
                   │       │    (e.g., 8)     │   │
                   │       └────────┬─────────┘   │
                   │                │             │
                   └────────────────┼─────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      Display in Dashboard     │
                    │                               │
                    │  Green:  +{20}                │
                    │  Red:    -{5}                 │
                    │  Orange: -{8}                 │
                    │                               │
                    │  Formula:                     │
                    │  100 + 20 - 5 - 8 = 107      │
                    └───────────────────────────────┘
```

## Example Calculation

### Input Data

**Activities for Today:**
```
┌────┬──────────────────┬────────┬────────────┬──────────┐
│ ID │ Description      │ Points │ Multiplier │ Category │
├────┼──────────────────┼────────┼────────────┼──────────┤
│  1 │ Homework done    │   +10  │     1      │ positivo │
│  2 │ Ate vegetables   │    +5  │     2      │ positivo │
│  3 │ Arrived late     │    -3  │     1      │ negativo │
│  4 │ Forgot cleanup   │    -2  │     1      │ negativo │
└────┴──────────────────┴────────┴────────────┴──────────┘

**Expenses for Today:**
┌────┬──────────────┬────────┐
│ ID │ Description  │ Amount │
├────┼──────────────┼────────┤
│  1 │ Candy        │    8   │
└────┴──────────────┴────────┘

**Initial Balance:** 100 points
```

### Step-by-Step Calculation

```
Step 1: Calculate Positive Points
─────────────────────────────────────
Activity 1:  10 × 1 = 10
Activity 2:   5 × 2 = 10
                    ────
Positive Total:      20  ✅ Goes to GREEN rectangle


Step 2: Calculate Negative Points (as absolute)
─────────────────────────────────────
Activity 3: |-3 × 1| = 3
Activity 4: |-2 × 1| = 2
                     ───
Negative Total:       5  ✅ Goes to RED rectangle (displayed as -5)


Step 3: Calculate Expenses
─────────────────────────────────────
Expense 1:            8  ✅ Goes to ORANGE rectangle (displayed as -8)


Step 4: Calculate Current Balance
─────────────────────────────────────
Formula: Initial + Positive - Negative - Expenses

         100   +   20   -    5    -    8   = 107  ✅ Goes to PURPLE rectangle


Step 5: Display in Dashboard
─────────────────────────────────────
┌────────────┬──────────┬──────────┬──────────┬────────────┐
│   Blue     │  Green   │   Red    │  Orange  │  Purple    │
├────────────┼──────────┼──────────┼──────────┼────────────┤
│    100     │   +20    │    -5    │    -8    │    107     │
└────────────┴──────────┴──────────┴──────────┴────────────┘
```

## Key Implementation Details

### Positive Points (Green Rectangle)

```typescript
// Filter activities where points > 0
const positivePoints = dayActivities
  .filter(a => a.points > 0)
  .reduce((sum, a) => sum + (a.points * a.multiplier), 0);

// Display with + sign
<p className="text-3xl font-bold">+{positivePointsToday}</p>
```

**Result:** Shows "+20" in green rectangle

### Negative Points (Red Rectangle)

```typescript
// Filter activities where points < 0 and convert to absolute
const negativePoints = dayActivities
  .filter(a => a.points < 0)
  .reduce((sum, a) => sum + Math.abs(a.points * a.multiplier), 0);
  //                        ^^^^^^^^
  //                        Key: Convert to positive!

// Display with - sign (value is already positive, we add the sign)
<p className="text-3xl font-bold">-{negativePointsToday}</p>
```

**Result:** 
- Internal value: `5` (positive number)
- Display: "-5" (negative sign added for display)

### Expenses (Orange Rectangle)

```typescript
// Sum all expenses
const totalExpenses = dayExpenses
  .reduce((sum, e) => sum + e.amount, 0);

// Display with - sign
<p className="text-3xl font-bold">-{expensesToday}</p>
```

**Result:** Shows "-8" in orange rectangle

### Current Balance (Purple Rectangle)

```typescript
// Formula: initial + positive - negative - expenses
const finalBalance = currentBalance + positivePoints - negativePoints - totalExpenses;
//                                                     ^
//                                                     Subtract the absolute value

// Display without sign (can be positive or negative)
<p className="text-3xl font-bold">{currentBalance}</p>
```

**Result:** Shows "107" in purple rectangle

## Common Scenarios

### Scenario 1: Only Positive Activities
```
Activities: +10, +15
Expenses: 0

┌────────────┬──────────┬──────────┬──────────┬────────────┐
│    100     │   +25    │     0    │     0    │    125     │
└────────────┴──────────┴──────────┴──────────┴────────────┘
```

### Scenario 2: Only Negative Activities
```
Activities: -10, -15
Expenses: 0

┌────────────┬──────────┬──────────┬──────────┬────────────┐
│    100     │     0    │   -25    │     0    │     75     │
└────────────┴──────────┴──────────┴──────────┴────────────┘
```

### Scenario 3: Mixed with Expenses
```
Activities: +30, -10
Expenses: 15

┌────────────┬──────────┬──────────┬──────────┬────────────┐
│    100     │   +30    │   -10    │   -15    │    105     │
└────────────┴──────────┴──────────┴──────────┴────────────┘
```

### Scenario 4: Negative Balance Result
```
Activities: -50
Expenses: 60
Initial: 100

┌────────────┬──────────┬──────────┬──────────┬────────────┐
│    100     │     0    │   -50    │   -60    │    -10     │
└────────────┴──────────┴──────────┴──────────┴────────────┘
```

## What Makes This Implementation Correct

### ✅ Proper Separation
- Positive activities → Green rectangle ONLY
- Negative activities → Red rectangle ONLY
- Expenses → Orange rectangle ONLY
- No mixing between rectangles

### ✅ Correct Math
- Negative points stored as absolute values
- Formula subtracts the absolute values
- Display adds signs for visual clarity

### ✅ Clear Visual Distinction
- Colors match meaning (green=good, red=bad, orange=spending)
- Signs reinforce meaning (+, -, -)
- Labels are clear and descriptive

## Test Coverage

All scenarios tested in `__tests__/dashboard-display.test.ts`:

```
✅ Correct separation of positive and negative points
✅ Only positive points in positive rectangle
✅ Only negative points in negative rectangle
✅ Correct separation of expenses from points
✅ Complete formula verification
✅ Never show negative in positivePoints
✅ Never show positive in negativePoints
✅ Correct handling of multipliers
✅ Zero-point activities handling
✅ Child ID filtering (no data mixing)
```

---

**Visual Guide Created:** October 19, 2024  
**Status:** ✅ VERIFIED AND DOCUMENTED
