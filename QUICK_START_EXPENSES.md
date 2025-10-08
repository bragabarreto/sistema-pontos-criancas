# Quick Start Guide - Expense Feature

## 🚀 Getting Started in 3 Steps

### Step 1: Database Migration
Run this command in your project directory:
```bash
npm run db:push
```

This will add the `expenses` table to your database.

### Step 2: Verify Installation
Build the project to ensure everything compiles:
```bash
npm run build
```

You should see no errors. The build output will show the new API routes:
- `/api/expenses`
- `/api/expenses/[id]`

### Step 3: Deploy
Push your changes to deploy:
```bash
git push origin main
```

## 🎯 How to Use

### Register an Expense
1. Go to the **Dashboard** tab
2. Scroll to the "💰 Gastos" section
3. Click **"+ Adicionar Gasto"** button
4. Fill in the form:
   - **Descrição**: What was purchased (e.g., "Sorvete", "Brinquedo")
   - **Valor**: How many points to deduct (e.g., 10)
   - **Data**: Select date from calendar (defaults to today)
5. Click **"Salvar"**

The expense is saved and the child's balance is automatically updated!

### View Expenses

**On Dashboard:**
- The **"Gastos do Dia"** card (orange) shows today's total expenses
- Recent expenses appear in the list below with 🗑️ delete buttons

**On Reports:**
- The **"Total de Gastos"** card shows expenses for the selected period
- The **"Histórico de Gastos"** section shows all expenses with dates

### Delete an Expense
1. Find the expense in the list
2. Click the **🗑️** (trash) button
3. Confirm deletion

The balance will automatically recalculate.

## 📊 Understanding the Dashboard

The dashboard now has **5 cards** showing:

1. 🔵 **Saldo Inicial do Dia** - Starting balance for today
2. 🟢 **Pontos Positivos Hoje** - Points earned today
3. 🔴 **Pontos Negativos Hoje** - Points lost today
4. 🟠 **Gastos do Dia** - NEW! Expenses made today
5. 🟣 **Saldo Atual** - Current balance

### Balance Formula:
```
Saldo Atual = Saldo Inicial + Pontos Positivos - Pontos Negativos - Gastos
```

## 🔍 Troubleshooting

### "Table expenses does not exist"
→ Run the database migration: `npm run db:push`

### "Build failed"
→ Make sure all dependencies are installed: `npm install`

### "Expense not appearing"
→ Refresh the page and check the console for errors

### "Delete not working"
→ Ensure the database migration completed successfully

## 📖 More Information

For detailed documentation, see:
- `EXPENSE_FEATURE_DOCUMENTATION.md` - Complete feature guide
- `EXPENSES_MIGRATION.md` - Database migration details
- `VISUAL_CHANGES_EXPENSES.md` - UI design guide
- `EXPENSE_IMPLEMENTATION_SUMMARY.md` - Technical overview

## ✅ Success Checklist

After deployment, verify:
- [ ] Dashboard shows 5 cards (including orange "Gastos do Dia")
- [ ] "Adicionar Gasto" button appears
- [ ] Can create a new expense
- [ ] Expense appears in the list
- [ ] "Gastos do Dia" card updates correctly
- [ ] "Saldo Atual" decreases by expense amount
- [ ] Historical table has "Gastos" column
- [ ] Reports show "Total de Gastos" card
- [ ] Can delete expenses

## 🎉 You're All Set!

The expense tracking feature is now active. Children can now spend their points, and parents can track all expenses in one place!

---

Need help? Check the full documentation or review the test cases for expected behavior.
