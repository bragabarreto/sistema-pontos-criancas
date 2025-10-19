/**
 * Utility functions for calculating daily balance history
 * FIXED VERSION: Includes childId validation to prevent data mixing
 */

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

  // If no start date, use the earliest activity date or today
  const now = new Date();
  const fortalezaNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
  
  let startDate: Date;
  if (childStartDate) {
    startDate = new Date(childStartDate);
  } else if (validActivities.length > 0) {
    // Find earliest activity
    const earliestActivity = validActivities.reduce((earliest, activity) => {
      const activityDate = new Date(activity.date);
      return activityDate < earliest ? activityDate : earliest;
    }, new Date(validActivities[0].date));
    startDate = earliestActivity;
  } else {
    // No activities and no start date, use today
    startDate = fortalezaNow;
  }

  // Normalize start date to beginning of day in Fortaleza timezone
  const startDateFortaleza = new Date(startDate.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
  const normalizedStartDate = new Date(
    startDateFortaleza.getFullYear(),
    startDateFortaleza.getMonth(),
    startDateFortaleza.getDate(),
    0, 0, 0, 0
  );

  // Normalize end date to end of today in Fortaleza timezone
  const normalizedEndDate = new Date(
    fortalezaNow.getFullYear(),
    fortalezaNow.getMonth(),
    fortalezaNow.getDate(),
    23, 59, 59, 999
  );

  const dailyBalances: DailyBalance[] = [];
  let currentBalance = childInitialBalance;

  // Iterate through each day from start to today
  const currentDate = new Date(normalizedStartDate);
  
  while (currentDate <= normalizedEndDate) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Filter activities for this day
    const dayActivities = validActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      const activityFortaleza = new Date(activityDate.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
      return activityFortaleza >= dayStart && activityFortaleza <= dayEnd;
    });

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

    // Filter expenses for this day
    const dayExpenses = validExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseFortaleza = new Date(expenseDate.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
      return expenseFortaleza >= dayStart && expenseFortaleza <= dayEnd;
    });

    // Calculate total expenses for the day
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate final balance using the correct formula
    // Formula: Final Balance = Initial Balance + Positive Points - Negative Points - Expenses
    // Example: 100 + 20 - 5 - 10 = 105
    // Note: negativePoints is already absolute, so we subtract it
    const initialBalanceOfDay = currentBalance;
    const finalBalanceOfDay = currentBalance + positivePoints - negativePoints - totalExpenses;

    // Format date string
    const dateString = `${String(dayStart.getDate()).padStart(2, '0')}/${String(dayStart.getMonth() + 1).padStart(2, '0')}/${dayStart.getFullYear()}`;

    dailyBalances.push({
      date: new Date(dayStart),
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
    currentDate.setDate(currentDate.getDate() + 1);
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
  const now = new Date();
  const fortalezaNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
  const todayDateString = `${String(fortalezaNow.getDate()).padStart(2, '0')}/${String(fortalezaNow.getMonth() + 1).padStart(2, '0')}/${fortalezaNow.getFullYear()}`;
  
  return dailyBalances.find(balance => balance.dateString === todayDateString) || null;
}

