import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, children } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (childId) {
      const childActivities = await db.select()
        .from(activities)
        .where(eq(activities.childId, parseInt(childId)))
        .orderBy(desc(activities.date));
      return NextResponse.json(childActivities);
    }

    const allActivities = await db.select().from(activities).orderBy(desc(activities.date));
    return NextResponse.json(allActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, name, points, category, date, multiplier } = body;

    // Create activity
    const newActivity = await db.insert(activities).values({
      childId,
      name,
      points,
      category,
      date: date ? new Date(date) : new Date(),
      multiplier: multiplier || 1,
    }).returning();

    // Update child's total points
    const pointsChange = points * (multiplier || 1);
    await db.execute(`
      UPDATE children 
      SET total_points = total_points + ${pointsChange},
          updated_at = NOW()
      WHERE id = ${childId}
    `);

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
