import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const parentUser = pgTable('parent_user', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  gender: text('gender'), // 'masculino', 'feminino', 'outro'
  appStartDate: timestamp('app_start_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const children = pgTable('children', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  initialBalance: integer('initial_balance').default(0).notNull(),
  startDate: timestamp('start_date'),
  totalPoints: integer('total_points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  childId: integer('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  points: integer('points').notNull(),
  category: text('category').notNull(), // positivos, especiais, negativos, graves
  date: timestamp('date').defaultNow().notNull(),
  multiplier: integer('multiplier').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customActivities = pgTable('custom_activities', {
  id: serial('id').primaryKey(),
  childId: integer('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  activityId: text('activity_id').notNull().unique(),
  name: text('name').notNull(),
  points: integer('points').notNull(),
  category: text('category').notNull(), // positivos, especiais, negativos, graves
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  childId: integer('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type CustomActivity = typeof customActivities.$inferSelect;
export type NewCustomActivity = typeof customActivities.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type ParentUser = typeof parentUser.$inferSelect;
export type NewParentUser = typeof parentUser.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
