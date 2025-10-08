# Database Migration: Add Expenses Table

This document describes how to add the expenses table to the existing database.

## Migration SQL

Run this SQL in your database (PostgreSQL) to add the expenses table:

```sql
-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  child_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_expenses_child
    FOREIGN KEY (child_id)
    REFERENCES children(id)
    ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_child_id ON expenses(child_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
```

## Using Drizzle Kit

Alternatively, you can use Drizzle Kit to push the schema changes:

```bash
npm run db:push
```

This will synchronize the database schema with the changes in `lib/schema.ts`.

## Verification

After running the migration, verify the table was created:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'expenses';

-- Check table structure
\d expenses
```

## Rollback (if needed)

To remove the expenses table:

```sql
DROP TABLE IF EXISTS expenses CASCADE;
```

## Notes

- The `amount` field stores expense values as integers (points deducted from the child's balance)
- The `date` field allows expenses to be assigned to specific dates, not just the current day
- The foreign key constraint ensures that deleting a child also deletes their associated expenses
- The migration is safe to run multiple times due to the `IF NOT EXISTS` clauses
