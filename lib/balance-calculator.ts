/**
 * Utility functions for calculating daily balance history
 * FIXED VERSION: Includes childId validation to prevent data mixing
 *
 * PERFORMANCE: activities/expenses are grouped by day in a single pass
 * (O(n + days)) instead of re-filtering the whole list for every day
 * (O(days × n)). The old approach also created Intl formatters per item,
 * which froze mobile browsers once a few months of data accumulated.
 */

import { getFortalezaDayKey } from './timezone';

export interface DailyBalance {
  date: Date;
  dateString: string;
  initialBalance: number;
  positivePoints: number;
  negativePoints: number;
  expenses: number;
  finalBalance: number;
  activities: any[];
  expensesList: any[];
}

// Safety cap: prevents a corrupted/ancient start date (e.g. year 1970)
// from generating tens of thousands of rows and crashing the browser
const MAX_HISTORY_DAYS = 3700; // ~10 years

/**
 * Group items by their calendar day (Fortaleza timezone).
 * Items with invalid dates are skipped instead of breaking the calculation.
 */
function groupByDay(items: any[]): Map<string, any[]> {
  const byDay = new Map<string, any[]>();
  for (const item of items) {
    const date = new Date(item.date);
    if (isNaN(date.getTime())) continue;
    const key = getFortalezaDayKey(date);
    const list = byDay.get(key);
    if (list) {
      list.push(item);
    } else {
      byDay.set(key, [item]);
    }
  }
  return byDay;
}

/**
 * Calculate daily balances from start date to today
 * @param activities - All activities for the child
 * @param expenses - All expenses for the child
 * @param childInitialBalance - Initial balance set in child settings
 * @param childStartDate - Start date set in child settings
 * @param childId - ID of the child (optional, for validation)
 * @returns Array of daily balances
 */
export function calculateDailyBalances(
  activities: any[],
  expenses: any[],
  childInitialBalance: number,
  childStartDate: Date | null,
  childId?: number
): DailyBalance[] {
  // FIX: Validate and filter data by childId if provided
  let validActivities = activities;
  let validExpenses = expenses;

  if (childId !== undefined && childId !== null) {
    validActivities = activities.filter(a => a.childId === childId);
    validExpenses = expenses.filter(e => e.childId === childId);

    // Log warning if data was filtered out
    const filteredActivitiesCount = activities.length - validActivities.length;
    const filteredExpensesCount = expenses.length - validExpenses.length;

    if (filteredActivitiesCount > 0) {
      console.warn(`[Balance Calculator] Filtered out ${filteredActivitiesCount} activities from other children`);
    }
    if (filteredExpensesCount > 0) {
      console.warn(`[Balance Calculator] Filtered out ${filteredExpensesCount} expenses from other children`);
    }
  }

  const activitiesByDay = groupByDay(validActivities);
  const expensesByDay = groupByDay(validExpenses);

  const todayKey = getFortalezaDayKey(new Date());

  // Determine the first day of the history:
  // child start date if valid, otherwise the earliest activity, otherwise today.
  // Day keys are YYYY-MM-DD strings, so lexicographic comparison is chronological.
  let startKey: string | null = null;
  if (childStartDate) {
    const start = new Date(childStartDate);
    if (!isNaN(start.getTime())) {
      startKey = getFortalezaDayKey(start);
    }
  }
  if (!startKey) {
    for (const key of activitiesByDay.keys()) {
      if (!startKey || key < startKey) startKey = key;
    }
  }
  if (!startKey || startKey > todayKey) {
    startKey = todayKey;
  }

  const [startYear, startMonth, startDay] = startKey.split('-').map(Number);

  // Iterate days using a UTC-noon cursor: immune to DST/timezone edge cases,
  // and toISOString().slice(0, 10) yields the YYYY-MM-DD key directly
  const cursor = new Date(Date.UTC(startYear, startMonth - 1, startDay, 12));

  const dailyBalances: DailyBalance[] = [];
  let currentBalance = childInitialBalance;

  for (let i = 0; i < MAX_HISTORY_DAYS; i++) {
    const dayKey = cursor.toISOString().slice(0, 10);
    if (dayKey > todayKey) break;

    const dayActivities = activitiesByDay.get(dayKey) || [];
    const dayExpenses = expensesByDay.get(dayKey) || [];

    // Calculate positive points: sum of all activities with category 'positivos' or 'especiais'
    // Example: activities with points 10, 5, 8 → positivePoints = 23
    const positivePoints = dayActivities
      .filter(a => a.category === 'positivos' || a.category === 'especiais')
      .reduce((sum, a) => sum + (a.points * a.multiplier), 0);

    // Calculate negative points as ABSOLUTE VALUE
    // Filter by category 'negativos' or 'graves' instead of point sign
    // We convert to positive for display and calculation using Math.abs()
    // This ensures negativePoints is always a positive number (e.g., 100, not -100)
    // Example: activities with category 'graves' with 1 point × 100 multiplier → negativePoints = 100
    const negativePoints = dayActivities
      .filter(a => a.category === 'negativos' || a.category === 'graves')
      .reduce((sum, a) => sum + Math.abs(a.points * a.multiplier), 0);

    // Calculate total expenses for the day
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate final balance using the correct formula
    // Formula: Final Balance = Initial Balance + Positive Points - Negative Points - Expenses
    // Example: 100 + 20 - 5 - 10 = 105
    // Note: negativePoints is already absolute, so we subtract it
    const initialBalanceOfDay = currentBalance;
    const finalBalanceOfDay = currentBalance + positivePoints - negativePoints - totalExpenses;

    const [year, month, day] = dayKey.split('-');
    const dateString = `${day}/${month}/${year}`;

    dailyBalances.push({
      date: new Date(Number(year), Number(month) - 1, Number(day)),
      dateString,
      initialBalance: initialBalanceOfDay,
      positivePoints,
      negativePoints,
      expenses: totalExpenses,
      finalBalance: finalBalanceOfDay,
      activities: dayActivities,
      expensesList: dayExpenses,
    });

    // Update current balance for next day
    currentBalance = finalBalanceOfDay;

    // Move to next day
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dailyBalances;
}

/**
 * Get the current balance (final balance of today or last day with data)
 * @param dailyBalances - Array of daily balances
 * @returns Current balance
 */
export function getCurrentBalance(dailyBalances: DailyBalance[]): number {
  if (dailyBalances.length === 0) return 0;
  return dailyBalances[dailyBalances.length - 1].finalBalance;
}

/**
 * Get today's balance data
 * @param dailyBalances - Array of daily balances
 * @returns Today's balance or null if not found
 */
export function getTodayBalance(dailyBalances: DailyBalance[]): DailyBalance | null {
  const todayKey = getFortalezaDayKey(new Date());
  const [year, month, day] = todayKey.split('-');
  const todayDateString = `${day}/${month}/${year}`;

  return dailyBalances.find(balance => balance.dateString === todayDateString) || null;
}
