import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (childId) {
      const childCustomActivities = await db.select()
        .from(customActivities)
        .where(eq(customActivities.childId, parseInt(childId)))
        .orderBy(asc(customActivities.orderIndex));
      return NextResponse.json(childCustomActivities);
    }

    const allCustomActivities = await db.select().from(customActivities).orderBy(asc(customActivities.orderIndex));
    return NextResponse.json(allCustomActivities);
  } catch (error) {
    console.error('Error fetching custom activities:', error);
    // Always return an array, even on error, to prevent frontend issues
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, activityId, name, points, category } = body;

    // Validate required fields
    if (!childId || !activityId || !name || points === undefined || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: childId, activityId, name, points, and category are required' 
      }, { status: 400 });
    }

    // Validate data types
    const parsedChildId = parseInt(childId);
    const parsedPoints = parseInt(points);

    if (isNaN(parsedChildId) || isNaN(parsedPoints)) {
      return NextResponse.json({ 
        error: 'Invalid data types: childId and points must be numbers' 
      }, { status: 400 });
    }

    // Get the max orderIndex for this child and category
    const existingActivities = await db.select()
      .from(customActivities)
      .where(eq(customActivities.childId, parsedChildId));
    
    const categoryActivities = existingActivities.filter(a => a.category === category);
    const maxOrder = categoryActivities.length > 0 
      ? Math.max(...categoryActivities.map(a => a.orderIndex || 0))
      : -1;

    const newCustomActivity = await db.insert(customActivities).values({
      childId: parsedChildId,
      activityId,
      name,
      points: parsedPoints,
      category,
      orderIndex: maxOrder + 1,
    }).returning();

    return NextResponse.json(newCustomActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating custom activity:', error);
    return NextResponse.json({ 
      error: 'Failed to create custom activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
