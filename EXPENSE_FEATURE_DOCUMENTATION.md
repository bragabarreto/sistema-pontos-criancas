# Feature: Expense Tracking System

## Overview

This feature adds comprehensive expense tracking for children, allowing parents to register expenses (gastos) that are automatically deducted from the child's point balance. Expenses are fully integrated into the dashboard, reports, and balance calculations.

## User Stories

1. **As a parent, I want to register expenses for my child** so that their spending is tracked and deducted from their balance.
2. **As a parent, I want to see today's total expenses on the dashboard** so I can monitor daily spending.
3. **As a parent, I want to view expense history** so I can review past spending.
4. **As a parent, I want expenses to be included in reports** so I can see spending patterns over time.

## Features Implemented

### 1. Expense Registration
- **Location**: Dashboard > "Adicionar Gasto" button
- **Fields**:
  - Description: Text field for expense description (e.g., "Sorvete", "Brinquedo")
  - Amount: Number field for points to deduct (must be positive)
  - Date: Date picker for selecting expense date (defaults to today)
- **Validation**:
  - All fields are required
  - Amount must be a positive integer
  - Date can be selected using the app's calendar
- **Action**: On save, expense is created and balance is automatically recalculated

### 2. Dashboard Integration
- **New Card**: "Gastos do Dia" (orange gradient)
  - Position: Between "Pontos Negativos Hoje" and "Saldo Atual"
  - Displays: Total expenses for the current day
  - Format: `-{amount}` to indicate deduction
- **Grid Update**: Changed from 4 to 5 cards
- **Expense List**: Shows recent expenses with:
  - Description
  - Date
  - Amount (in orange color)
  - Delete button

### 3. Balance Calculation
- **New Formula**: 
  ```
  Saldo Atual = Saldo Inicial + Pontos Positivos - Pontos Negativos - Gastos
  ```
- **Daily Calculation**: Each day's balance now includes:
  - Initial Balance
  - Positive Points
  - Negative Points
  - **Expenses** (NEW)
  - Final Balance

### 4. Historical View Updates
- **Table View**: Added "Gastos" column
  - Shows expenses in orange color
  - Included in daily balance calculation
- **Chart View**: Expenses affect the daily change calculation
  - Daily change now: `positivePoints - negativePoints - expenses`

### 5. Reports Integration
- **Statistics**: Added "Total de Gastos" card (orange)
- **Calculation**: Total period balance now accounts for expenses
  - Formula: `positivePoints + negativePoints - expenses`
- **Expense History Section**: New section showing all expenses for the selected period
  - Filtered by selected period (week/month/all)
  - Shows description, date, and amount
  - Same styling as activities list

## API Endpoints

### GET /api/expenses
- **Query Parameters**: `?childId={id}` (optional)
- **Response**: Array of expense objects
- **Example**:
  ```json
  [
    {
      "id": 1,
      "childId": 1,
      "description": "Sorvete",
      "amount": 10,
      "date": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
  ```

### POST /api/expenses
- **Body**:
  ```json
  {
    "childId": 1,
    "description": "Sorvete",
    "amount": 10,
    "date": "2024-01-15"  // Optional, defaults to today
  }
  ```
- **Response**: Created expense object
- **Status Codes**:
  - 201: Success
  - 400: Validation error
  - 500: Server error

### DELETE /api/expenses/[id]
- **Parameters**: Expense ID in URL
- **Response**: Success message
- **Status Codes**:
  - 200: Success
  - 400: Invalid ID
  - 500: Server error

## Database Schema

### expenses table
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Color Scheme

The expense feature uses a consistent orange color theme to distinguish it from points:
- **Dashboard Card**: Orange gradient (from-orange-500 to-orange-600)
- **Expense Values**: Orange text (text-orange-600)
- **Add Button**: Orange background (bg-orange-600)
- **Report Card**: Light orange background (bg-orange-100)

This creates clear visual separation:
- 🟢 Green = Positive Points
- 🔴 Red = Negative Points
- 🟠 Orange = Expenses
- 🟣 Purple = Final Balance
- 🔵 Blue = Initial Balance

## Usage Example

1. **Register an Expense**:
   - Go to Dashboard
   - Click "Adicionar Gasto"
   - Fill in:
     - Description: "Sorvete"
     - Amount: 10
     - Date: Select from calendar
   - Click "Salvar"

2. **View in Dashboard**:
   - "Gastos do Dia" card shows total: -10
   - "Saldo Atual" is automatically reduced by 10
   - Expense appears in the list below

3. **Check Reports**:
   - Go to Reports
   - Select period (week/month/all)
   - See "Total de Gastos" in statistics
   - View full expense history in the dedicated section

## Technical Implementation Details

### Balance Calculator Updates
- Modified `DailyBalance` interface to include:
  - `expenses: number` - Total expenses for the day
  - `expensesList: any[]` - Array of expense objects for the day
- Updated `calculateDailyBalances` function:
  - Accepts `expenses` parameter
  - Filters expenses by date (using Fortaleza timezone)
  - Calculates daily totals
  - Deducts from final balance

### Component State Management
- Dashboard component:
  - New state: `expenses`, `showExpenseModal`, `expenseDescription`, `expenseAmount`, `expenseDate`
  - New functions: `loadExpenses()`, `addExpense()`, `deleteExpense()`
- Reports component:
  - New state: `expenses`
  - New function: `loadExpenses()`
  - Updated filtering logic to include expenses

### Data Flow
1. User creates expense → POST /api/expenses
2. API validates and stores in database
3. Frontend reloads expenses
4. Balance calculator recalculates with new expense
5. Dashboard and charts update automatically

## Migration Required

Before using this feature in production, the database must be migrated. See `EXPENSES_MIGRATION.md` for instructions.

## Future Enhancements

Potential improvements for future versions:
- Expense categories (food, toys, treats, etc.)
- Spending limits and warnings
- Expense approval workflow
- Recurring expenses
- Expense analytics and charts
- Export expense reports to PDF/CSV
