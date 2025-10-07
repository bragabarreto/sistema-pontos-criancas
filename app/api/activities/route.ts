import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, children } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { getFortalezaNow, dateStringToFortalezaTimestamp } from '@/lib/timezone';

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
    // Always return an array, even on error, to prevent frontend issues
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, name, points, category, date, multiplier } = body;

    // Validate required fields
    if (!childId || !name || points === undefined || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: childId, name, points, and category are required' 
      }, { status: 400 });
    }

    // Validate data types
    const parsedChildId = parseInt(childId);
    const parsedPoints = parseInt(points);
    const parsedMultiplier = multiplier ? parseInt(multiplier) : 1;

    if (isNaN(parsedChildId) || isNaN(parsedPoints) || isNaN(parsedMultiplier)) {
      return NextResponse.json({ 
        error: 'Invalid data types: childId, points, and multiplier must be numbers' 
      }, { status: 400 });
    }

    // Create activity with Fortaleza timezone
    // If date is provided (YYYY-MM-DD), use current time in Fortaleza for that date
    // If no date is provided, use current date/time in Fortaleza
    const activityDate = date 
      ? dateStringToFortalezaTimestamp(date) 
      : getFortalezaNow();
    
    const newActivity = await db.insert(activities).values({
      childId: parsedChildId,
      name,
      points: parsedPoints,
      category,
      date: activityDate,
      multiplier: parsedMultiplier,
    }).returning();

    // Update child's total points using Drizzle ORM (safe from SQL injection)
    const pointsChange = parsedPoints * parsedMultiplier;
    
    // First, get the current child to update total points
    const [currentChild] = await db.select().from(children).where(eq(children.id, parsedChildId));
    
    if (currentChild) {
      await db.update(children)
        .set({
          totalPoints: currentChild.totalPoints + pointsChange,
          updatedAt: new Date(),
        })
        .where(eq(children.id, parsedChildId));
    }

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ 
      error: 'Failed to create activity', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
