import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateDailyBalances, getCurrentBalance, getTodayBalance } from '../lib/balance-calculator';

describe('Balance Calculator', () => {
  it('should calculate daily balances correctly with no activities', () => {
    const activities: any[] = [];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    // Should have balances for each day from start to today
    assert.ok(balances.length > 0, 'Should have at least one day');
    
    // First day should have initial balance
    assert.strictEqual(balances[0].initialBalance, initialBalance);
    assert.strictEqual(balances[0].positivePoints, 0);
    assert.strictEqual(balances[0].negativePoints, 0);
    assert.strictEqual(balances[0].expenses, 0);
    assert.strictEqual(balances[0].finalBalance, initialBalance);
  });

  it('should calculate daily balances with positive activities', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 10,
        multiplier: 1,
        name: 'Good behavior',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-01T14:00:00'),
        points: 5,
        multiplier: 2,
        name: 'Homework',
        category: 'especiais'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    // Find the first day
    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 20); // 10*1 + 5*2
    assert.strictEqual(firstDay!.negativePoints, 0);
    assert.strictEqual(firstDay!.expenses, 0);
    assert.strictEqual(firstDay!.finalBalance, 120); // 100 + 20
  });

  it('should calculate daily balances with negative activities', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: -5,
        multiplier: 1,
        name: 'Bad behavior',
        category: 'negativos'
      },
      {
        id: 2,
        date: new Date('2024-01-01T14:00:00'),
        points: -3,
        multiplier: 2,
        name: 'Serious issue',
        category: 'graves'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 0);
    assert.strictEqual(firstDay!.negativePoints, 11); // 5*1 + 3*2
    assert.strictEqual(firstDay!.expenses, 0);
    assert.strictEqual(firstDay!.finalBalance, 89); // 100 - 11
  });

  it('should calculate daily balances with mixed activities', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 10,
        multiplier: 1,
        name: 'Good behavior',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-01T14:00:00'),
        points: -3,
        multiplier: 1,
        name: 'Bad behavior',
        category: 'negativos'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 10);
    assert.strictEqual(firstDay!.negativePoints, 3);
    assert.strictEqual(firstDay!.expenses, 0);
    assert.strictEqual(firstDay!.finalBalance, 107); // 100 + 10 - 3
  });

  it('should calculate daily balances with expenses', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 10,
        multiplier: 1,
        name: 'Good behavior',
        category: 'positivos'
      }
    ];
    const expenses = [
      {
        id: 1,
        date: new Date('2024-01-01T12:00:00'),
        amount: 5,
        description: 'Ice cream'
      }
    ];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 10);
    assert.strictEqual(firstDay!.negativePoints, 0);
    assert.strictEqual(firstDay!.expenses, 5);
    assert.strictEqual(firstDay!.finalBalance, 105); // 100 + 10 - 5
  });

  it('should calculate daily balances with mixed activities and expenses', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 20,
        multiplier: 1,
        name: 'Good behavior',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-01T14:00:00'),
        points: -5,
        multiplier: 1,
        name: 'Bad behavior',
        category: 'negativos'
      }
    ];
    const expenses = [
      {
        id: 1,
        date: new Date('2024-01-01T12:00:00'),
        amount: 8,
        description: 'Snack'
      }
    ];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 20);
    assert.strictEqual(firstDay!.negativePoints, 5);
    assert.strictEqual(firstDay!.expenses, 8);
    assert.strictEqual(firstDay!.finalBalance, 107); // 100 + 20 - 5 - 8
  });

  it('should carry over balance to next day', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 10,
        multiplier: 1,
        name: 'Good behavior',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-02T10:00:00'),
        points: 5,
        multiplier: 1,
        name: 'More good behavior',
        category: 'positivos'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const day1 = balances.find(b => b.dateString.startsWith('01/01/2024'));
    const day2 = balances.find(b => b.dateString.startsWith('02/01/2024'));
    
    assert.ok(day1, 'Should have data for day 1');
    assert.ok(day2, 'Should have data for day 2');
    
    // Day 1 calculations
    assert.strictEqual(day1!.initialBalance, 100);
    assert.strictEqual(day1!.finalBalance, 110); // 100 + 10
    
    // Day 2 should start with day 1's final balance
    assert.strictEqual(day2!.initialBalance, 110);
    assert.strictEqual(day2!.finalBalance, 115); // 110 + 5
  });

  it('should get current balance correctly', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 10,
        multiplier: 1,
        name: 'Good behavior',
        category: 'positivos'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);
    const currentBalance = getCurrentBalance(balances);
    
    // Current balance should be the final balance of the last day
    const lastDay = balances[balances.length - 1];
    assert.strictEqual(currentBalance, lastDay.finalBalance);
  });

  it('should handle empty balance array', () => {
    const currentBalance = getCurrentBalance([]);
    assert.strictEqual(currentBalance, 0);
  });

  it('should correctly carry over balance across multiple days', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 15,
        multiplier: 1,
        name: 'Day 1 activity',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-02T10:00:00'),
        points: -3,
        multiplier: 1,
        name: 'Day 2 activity',
        category: 'negativos'
      },
      {
        id: 3,
        date: new Date('2024-01-03T10:00:00'),
        points: 10,
        multiplier: 1,
        name: 'Day 3 activity',
        category: 'positivos'
      },
      {
        id: 4,
        date: new Date('2024-01-03T14:00:00'),
        points: -5,
        multiplier: 1,
        name: 'Day 3 negative',
        category: 'negativos'
      }
    ];
    const expenses = [
      {
        id: 1,
        date: new Date('2024-01-02T12:00:00'),
        amount: 5,
        description: 'Day 2 expense'
      },
      {
        id: 2,
        date: new Date('2024-01-03T16:00:00'),
        amount: 2,
        description: 'Day 3 expense'
      }
    ];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const day1 = balances.find(b => b.dateString.startsWith('01/01/2024'));
    const day2 = balances.find(b => b.dateString.startsWith('02/01/2024'));
    const day3 = balances.find(b => b.dateString.startsWith('03/01/2024'));

    // Day 1: 100 + 15 = 115
    assert.ok(day1, 'Day 1 should exist');
    assert.strictEqual(day1!.initialBalance, 100);
    assert.strictEqual(day1!.positivePoints, 15);
    assert.strictEqual(day1!.negativePoints, 0);
    assert.strictEqual(day1!.expenses, 0);
    assert.strictEqual(day1!.finalBalance, 115);

    // Day 2: 115 - 3 - 5 = 107 (previous final becomes initial)
    assert.ok(day2, 'Day 2 should exist');
    assert.strictEqual(day2!.initialBalance, 115, 'Day 2 initial should be Day 1 final');
    assert.strictEqual(day2!.positivePoints, 0);
    assert.strictEqual(day2!.negativePoints, 3);
    assert.strictEqual(day2!.expenses, 5);
    assert.strictEqual(day2!.finalBalance, 107);

    // Day 3: 107 + 10 - 5 - 2 = 110 (previous final becomes initial)
    assert.ok(day3, 'Day 3 should exist');
    assert.strictEqual(day3!.initialBalance, 107, 'Day 3 initial should be Day 2 final');
    assert.strictEqual(day3!.positivePoints, 10);
    assert.strictEqual(day3!.negativePoints, 5);
    assert.strictEqual(day3!.expenses, 2);
    assert.strictEqual(day3!.finalBalance, 110);
  });

  it('should handle activities with multipliers correctly', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 5,
        multiplier: 3,
        name: 'Special achievement',
        category: 'especiais'
      },
      {
        id: 2,
        date: new Date('2024-01-01T14:00:00'),
        points: -2,
        multiplier: 2,
        name: 'Serious issue',
        category: 'graves'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.positivePoints, 15); // 5*3
    assert.strictEqual(firstDay!.negativePoints, 4); // 2*2 (absolute value)
    assert.strictEqual(firstDay!.finalBalance, 111); // 100 + 15 - 4
  });

  it('should handle days with no activities correctly', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 20,
        multiplier: 1,
        name: 'Day 1 activity',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-03T10:00:00'),
        points: 5,
        multiplier: 1,
        name: 'Day 3 activity',
        category: 'positivos'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const day1 = balances.find(b => b.dateString.startsWith('01/01/2024'));
    const day2 = balances.find(b => b.dateString.startsWith('02/01/2024'));
    const day3 = balances.find(b => b.dateString.startsWith('03/01/2024'));

    // Day 1: 100 + 20 = 120
    assert.ok(day1, 'Day 1 should exist');
    assert.strictEqual(day1!.finalBalance, 120);

    // Day 2: No activities, balance should carry over unchanged
    assert.ok(day2, 'Day 2 should exist');
    assert.strictEqual(day2!.initialBalance, 120, 'Day 2 initial should be Day 1 final');
    assert.strictEqual(day2!.positivePoints, 0);
    assert.strictEqual(day2!.negativePoints, 0);
    assert.strictEqual(day2!.expenses, 0);
    assert.strictEqual(day2!.finalBalance, 120, 'Day 2 final should equal initial (no changes)');

    // Day 3: 120 + 5 = 125
    assert.ok(day3, 'Day 3 should exist');
    assert.strictEqual(day3!.initialBalance, 120, 'Day 3 initial should be Day 2 final');
    assert.strictEqual(day3!.finalBalance, 125);
  });

  it('should handle negative final balance correctly', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: -50,
        multiplier: 1,
        name: 'Major penalty',
        category: 'graves'
      }
    ];
    const expenses: any[] = [];
    const initialBalance = 30;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 30);
    assert.strictEqual(firstDay!.positivePoints, 0);
    assert.strictEqual(firstDay!.negativePoints, 50);
    assert.strictEqual(firstDay!.finalBalance, -20); // 30 - 50
  });

  it('should apply formula correctly: initial + positive - negative - expenses', () => {
    const activities = [
      {
        id: 1,
        date: new Date('2024-01-01T10:00:00'),
        points: 25,
        multiplier: 1,
        name: 'Positive',
        category: 'positivos'
      },
      {
        id: 2,
        date: new Date('2024-01-01T11:00:00'),
        points: -8,
        multiplier: 1,
        name: 'Negative',
        category: 'negativos'
      }
    ];
    const expenses = [
      {
        id: 1,
        date: new Date('2024-01-01T12:00:00'),
        amount: 12,
        description: 'Purchase'
      }
    ];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, expenses, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    
    // Verify each component
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 25);
    assert.strictEqual(firstDay!.negativePoints, 8); // absolute value
    assert.strictEqual(firstDay!.expenses, 12);
    
    // Verify formula: 100 + 25 - 8 - 12 = 105
    const expectedFinal = firstDay!.initialBalance + firstDay!.positivePoints - firstDay!.negativePoints - firstDay!.expenses;
    assert.strictEqual(firstDay!.finalBalance, expectedFinal);
    assert.strictEqual(firstDay!.finalBalance, 105);
  });
});
