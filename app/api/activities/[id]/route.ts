import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, children } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const activityId = parseInt(params.id);
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
    }

    // Get activity first to update child points
    const activity = await db.select().from(activities).where(eq(activities.id, activityId));
    
    if (activity.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const { childId, points, multiplier } = activity[0];
    const pointsChange = points * multiplier;

    // Delete activity
    await db.delete(activities).where(eq(activities.id, activityId));

    // Update child's total points using Drizzle ORM (safe from SQL injection)
    const [currentChild] = await db.select().from(children).where(eq(children.id, childId));
    
    if (currentChild) {
      await db.update(children)
        .set({
          totalPoints: currentChild.totalPoints - pointsChange,
          updatedAt: new Date(),
        })
        .where(eq(children.id, childId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ 
      error: 'Failed to delete activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
