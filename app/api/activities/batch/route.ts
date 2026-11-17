import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, children } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { dateStringToFortalezaTimestamp } from '@/lib/timezone';

const VALID_CATEGORIES = ['positivos', 'especiais', 'negativos', 'graves'];
const MAX_QUANTITY_PER_ITEM = 99;
const MAX_DATES = 62;
const MAX_TOTAL_ROWS = 2000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/activities/batch
 *
 * Registers several activities, each with a quantity, on one or more days in a
 * single request. Each unit becomes its own row (same shape as POST /api/activities),
 * so the history, reports and the "remove" buttons keep working unchanged.
 *
 * Body: {
 *   childId: number,
 *   dates: string[]            // YYYY-MM-DD
 *   items: { name, points, category, multiplier, quantity }[]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, dates, items } = body ?? {};

    const parsedChildId = parseInt(childId);
    if (isNaN(parsedChildId)) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 });
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'At least one date is required' }, { status: 400 });
    }
    const uniqueDates = Array.from(new Set(dates.map(String)));
    if (uniqueDates.length > MAX_DATES) {
      return NextResponse.json({ error: `No máximo ${MAX_DATES} dias por lançamento` }, { status: 400 });
    }
    if (uniqueDates.some(d => !DATE_RE.test(d))) {
      return NextResponse.json({ error: 'Dates must be in YYYY-MM-DD format' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one activity is required' }, { status: 400 });
    }

    const parsedItems = [];
    for (const item of items) {
      const points = parseInt(item?.points);
      const multiplier = item?.multiplier ? parseInt(item.multiplier) : 1;
      const quantity = parseInt(item?.quantity);
      if (
        !item?.name || isNaN(points) || isNaN(multiplier) || isNaN(quantity) ||
        !VALID_CATEGORIES.includes(item?.category)
      ) {
        return NextResponse.json({ error: 'Invalid activity in items' }, { status: 400 });
      }
      if (quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json({ error: `Quantidade deve estar entre 1 e ${MAX_QUANTITY_PER_ITEM}` }, { status: 400 });
      }
      parsedItems.push({ name: String(item.name), points, multiplier, quantity, category: item.category });
    }

    const rows: (typeof activities.$inferInsert)[] = [];
    for (const date of uniqueDates.sort()) {
      const activityDate = dateStringToFortalezaTimestamp(date);
      for (const item of parsedItems) {
        for (let i = 0; i < item.quantity; i++) {
          rows.push({
            childId: parsedChildId,
            name: item.name,
            points: item.points,
            category: item.category,
            multiplier: item.multiplier,
            date: activityDate,
          });
        }
      }
    }

    if (rows.length > MAX_TOTAL_ROWS) {
      return NextResponse.json({ error: `Lançamento muito grande (${rows.length} registros, máximo ${MAX_TOTAL_ROWS})` }, { status: 400 });
    }

    const inserted = await db.insert(activities).values(rows).returning({ id: activities.id });

    const pointsChange = rows.reduce((sum, r) => sum + r.points * (r.multiplier ?? 1), 0);
    await db.update(children)
      .set({
        totalPoints: sql`${children.totalPoints} + ${pointsChange}`,
        updatedAt: new Date(),
      })
      .where(eq(children.id, parsedChildId));

    return NextResponse.json({ created: inserted.length, days: uniqueDates.length, pointsChange }, { status: 201 });
  } catch (error) {
    console.error('Error creating activities in batch:', error);
    return NextResponse.json({
      error: 'Failed to create activities',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
