import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateDailyBalances, getTodayBalance } from '../lib/balance-calculator';

/**
 * Tests specifically for Dashboard display logic
 * Ensures that positive and negative points are correctly separated and displayed
 */
describe('Dashboard Display Logic', () => {
  // Helper to get today's date string in the expected format
  const getTodayString = () => {
    const now = new Date();
    const fortalezaNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
    return `${String(fortalezaNow.getDate()).padStart(2, '0')}/${String(fortalezaNow.getMonth() + 1).padStart(2, '0')}/${fortalezaNow.getFullYear()}`;
  };

  it('should correctly separate positive points from negative points in dashboard', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 10,
        multiplier: 1,
        name: 'Homework done',
        category: 'positivos'
      },
      {
        id: 2,
        childId: 1,
        date: today,
        points: -5,
        multiplier: 1,
        name: 'Bad behavior',
        category: 'negativos'
      },
      {
        id: 3,
        childId: 1,
        date: today,
        points: 8,
        multiplier: 1,
        name: 'Helped with chores',
        category: 'positivos'
      }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // Verify positive points are only positive activities
    assert.strictEqual(todayBalance!.positivePoints, 18, 'Positive points should be 10 + 8 = 18');
    
    // Verify negative points are converted to absolute value
    assert.strictEqual(todayBalance!.negativePoints, 5, 'Negative points should be abs(-5) = 5');
    
    // Negative points should NEVER be negative in the data structure
    assert.ok(todayBalance!.negativePoints >= 0, 'Negative points value should be non-negative (absolute)');
    
    // Verify final balance calculation
    const expectedFinal = 100 + 18 - 5; // initial + positive - negative
    assert.strictEqual(todayBalance!.finalBalance, expectedFinal, 'Final balance should be 113');
  });

  it('should display only positive points in positive rectangle (no negative values)', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: -10,
        multiplier: 1,
        name: 'Penalty',
        category: 'negativos'
      },
      {
        id: 2,
        childId: 1,
        date: today,
        points: -15,
        multiplier: 2,
        name: 'Major penalty',
        category: 'graves'
      }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // When there are only negative activities, positive points should be 0
    assert.strictEqual(todayBalance!.positivePoints, 0, 'Positive points should be 0 when only negative activities exist');
    
    // All negative points should be in the negative points field
    assert.strictEqual(todayBalance!.negativePoints, 40, 'Negative points should be 10 + (15*2) = 40');
  });

  it('should display only negative points in negative rectangle (no positive values)', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 20,
        multiplier: 1,
        name: 'Great job',
        category: 'positivos'
      },
      {
        id: 2,
        childId: 1,
        date: today,
        points: 15,
        multiplier: 2,
        name: 'Special achievement',
        category: 'especiais'
      }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // When there are only positive activities, negative points should be 0
    assert.strictEqual(todayBalance!.negativePoints, 0, 'Negative points should be 0 when only positive activities exist');
    
    // All positive points should be in the positive points field
    assert.strictEqual(todayBalance!.positivePoints, 50, 'Positive points should be 20 + (15*2) = 50');
  });

  it('should correctly separate expenses from points in dashboard', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 20,
        multiplier: 1,
        name: 'Good work',
        category: 'positivos'
      }
    ];
    const expenses = [
      {
        id: 1,
        childId: 1,
        date: today,
        amount: 10,
        description: 'Candy'
      }
    ];

    const balances = calculateDailyBalances(activities, expenses, 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // Verify points and expenses are separate
    assert.strictEqual(todayBalance!.positivePoints, 20, 'Positive points should be 20');
    assert.strictEqual(todayBalance!.negativePoints, 0, 'Negative points should be 0');
    assert.strictEqual(todayBalance!.expenses, 10, 'Expenses should be 10');
    
    // Expenses should NOT appear in positive or negative points
    assert.notStrictEqual(todayBalance!.positivePoints, 10, 'Expenses should not be counted as positive points');
    assert.notStrictEqual(todayBalance!.negativePoints, 10, 'Expenses should not be counted as negative points');
    
    // Final balance should account for expenses
    const expectedFinal = 100 + 20 - 10; // initial + positive - expenses
    assert.strictEqual(todayBalance!.finalBalance, expectedFinal, 'Final balance should be 110');
  });

  it('should handle the complete dashboard formula: initial + positive - negative - expenses', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 25,
        multiplier: 1,
        name: 'Great behavior',
        category: 'positivos'
      },
      {
        id: 2,
        childId: 1,
        date: today,
        points: -8,
        multiplier: 1,
        name: 'Small mistake',
        category: 'negativos'
      },
      {
        id: 3,
        childId: 1,
        date: today,
        points: 10,
        multiplier: 2,
        name: 'Special task',
        category: 'especiais'
      }
    ];
    const expenses = [
      {
        id: 1,
        childId: 1,
        date: today,
        amount: 12,
        description: 'Ice cream'
      }
    ];

    const initialBalance = 100;
    const balances = calculateDailyBalances(activities, expenses, initialBalance, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // Verify each component
    assert.strictEqual(todayBalance!.initialBalance, 100, 'Initial balance should be 100');
    assert.strictEqual(todayBalance!.positivePoints, 45, 'Positive points should be 25 + (10*2) = 45');
    assert.strictEqual(todayBalance!.negativePoints, 8, 'Negative points should be abs(-8) = 8');
    assert.strictEqual(todayBalance!.expenses, 12, 'Expenses should be 12');
    
    // Verify the complete formula
    const calculatedFinal = todayBalance!.initialBalance + todayBalance!.positivePoints - todayBalance!.negativePoints - todayBalance!.expenses;
    assert.strictEqual(todayBalance!.finalBalance, calculatedFinal, 'Final should match formula');
    assert.strictEqual(todayBalance!.finalBalance, 125, 'Final balance should be 100 + 45 - 8 - 12 = 125');
  });

  it('should never show negative values in positivePoints field', () => {
    const today = new Date();
    // Edge case: all activities are negative
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: -100,
        multiplier: 1,
        name: 'Major issue',
        category: 'graves'
      }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    assert.strictEqual(todayBalance!.positivePoints, 0, 'Positive points must be 0, not negative');
    assert.ok(todayBalance!.positivePoints >= 0, 'Positive points must never be negative');
  });

  it('should never show positive values in negativePoints field', () => {
    const today = new Date();
    // Edge case: all activities are positive
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 100,
        multiplier: 1,
        name: 'Excellent work',
        category: 'especiais'
      }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    assert.strictEqual(todayBalance!.negativePoints, 0, 'Negative points must be 0, not positive');
    assert.ok(todayBalance!.negativePoints >= 0, 'Negative points field should store absolute values (non-negative)');
  });

  it('should correctly handle multiple activities with multipliers', () => {
    const today = new Date();
    const activities = [
      { id: 1, childId: 1, date: today, points: 5, multiplier: 3, name: 'A', category: 'especiais' },
      { id: 2, childId: 1, date: today, points: -3, multiplier: 2, name: 'B', category: 'graves' },
      { id: 3, childId: 1, date: today, points: 10, multiplier: 1, name: 'C', category: 'positivos' },
      { id: 4, childId: 1, date: today, points: -5, multiplier: 1, name: 'D', category: 'negativos' }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // Positive: (5*3) + (10*1) = 15 + 10 = 25
    assert.strictEqual(todayBalance!.positivePoints, 25, 'Positive points with multipliers should be 25');
    
    // Negative: abs(-3*2) + abs(-5*1) = 6 + 5 = 11
    assert.strictEqual(todayBalance!.negativePoints, 11, 'Negative points with multipliers should be 11');
    
    // Final: 100 + 25 - 11 = 114
    assert.strictEqual(todayBalance!.finalBalance, 114, 'Final balance should be 114');
  });

  it('should handle zero points activities', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 0,
        multiplier: 1,
        name: 'Neutral activity',
        category: 'neutros'
      },
      {
        id: 2,
        childId: 1,
        date: today,
        points: 10,
        multiplier: 1,
        name: 'Good',
        category: 'positivos'
      }
    ];

    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // Zero points should not be counted as positive or negative
    assert.strictEqual(todayBalance!.positivePoints, 10, 'Only non-zero positive points should count');
    assert.strictEqual(todayBalance!.negativePoints, 0, 'Zero points should not count as negative');
  });

  it('should correctly filter activities by child ID to prevent data mixing', () => {
    const today = new Date();
    const activities = [
      {
        id: 1,
        childId: 1,
        date: today,
        points: 10,
        multiplier: 1,
        name: 'Child 1 activity',
        category: 'positivos'
      },
      {
        id: 2,
        childId: 2,
        date: today,
        points: 20,
        multiplier: 1,
        name: 'Child 2 activity',
        category: 'positivos'
      },
      {
        id: 3,
        childId: 1,
        date: today,
        points: -5,
        multiplier: 1,
        name: 'Child 1 negative',
        category: 'negativos'
      }
    ];

    // Calculate for child 1 only
    const balances = calculateDailyBalances(activities, [], 100, today, 1);
    const todayBalance = getTodayBalance(balances);

    assert.ok(todayBalance, 'Today balance should exist');
    
    // Should only count child 1's activities (10 and -5), not child 2's (20)
    assert.strictEqual(todayBalance!.positivePoints, 10, 'Should only count child 1 positive points');
    assert.strictEqual(todayBalance!.negativePoints, 5, 'Should only count child 1 negative points');
    assert.notStrictEqual(todayBalance!.positivePoints, 30, 'Should not include other children activities');
  });
});
