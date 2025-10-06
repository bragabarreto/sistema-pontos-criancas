import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (childId) {
      const childCustomActivities = await db.select()
        .from(customActivities)
        .where(eq(customActivities.childId, parseInt(childId)));
      return NextResponse.json(childCustomActivities);
    }

    const allCustomActivities = await db.select().from(customActivities);
    return NextResponse.json(allCustomActivities);
  } catch (error) {
    console.error('Error fetching custom activities:', error);
    return NextResponse.json({ error: 'Failed to fetch custom activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, activityId, name, points, category } = body;

    const newCustomActivity = await db.insert(customActivities).values({
      childId,
      activityId,
      name,
      points,
      category,
    }).returning();

    return NextResponse.json(newCustomActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating custom activity:', error);
    return NextResponse.json({ error: 'Failed to create custom activity' }, { status: 500 });
  }
}
