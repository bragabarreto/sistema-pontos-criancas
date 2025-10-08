import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateDailyBalances, getCurrentBalance, getTodayBalance } from '../lib/balance-calculator';

describe('Balance Calculator', () => {
  it('should calculate daily balances correctly with no activities', () => {
    const activities: any[] = [];
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, initialBalance, startDate);

    // Should have balances for each day from start to today
    assert.ok(balances.length > 0, 'Should have at least one day');
    
    // First day should have initial balance
    assert.strictEqual(balances[0].initialBalance, initialBalance);
    assert.strictEqual(balances[0].positivePoints, 0);
    assert.strictEqual(balances[0].negativePoints, 0);
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
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, initialBalance, startDate);

    // Find the first day
    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 20); // 10*1 + 5*2
    assert.strictEqual(firstDay!.negativePoints, 0);
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
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 0);
    assert.strictEqual(firstDay!.negativePoints, 11); // 5*1 + 3*2
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
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, initialBalance, startDate);

    const firstDay = balances.find(b => b.dateString.startsWith('01/01/2024'));
    
    assert.ok(firstDay, 'Should have data for first day');
    assert.strictEqual(firstDay!.initialBalance, 100);
    assert.strictEqual(firstDay!.positivePoints, 10);
    assert.strictEqual(firstDay!.negativePoints, 3);
    assert.strictEqual(firstDay!.finalBalance, 107); // 100 + 10 - 3
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
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, initialBalance, startDate);

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
    const initialBalance = 100;
    const startDate = new Date('2024-01-01');

    const balances = calculateDailyBalances(activities, initialBalance, startDate);
    const currentBalance = getCurrentBalance(balances);
    
    // Current balance should be the final balance of the last day
    const lastDay = balances[balances.length - 1];
    assert.strictEqual(currentBalance, lastDay.finalBalance);
  });

  it('should handle empty balance array', () => {
    const currentBalance = getCurrentBalance([]);
    assert.strictEqual(currentBalance, 0);
  });
});
