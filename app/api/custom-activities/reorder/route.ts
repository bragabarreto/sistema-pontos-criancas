import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, category, activityId, direction } = body;

    // Get all activities for this child and category
    const activities = await db.select()
      .from(customActivities)
      .where(eq(customActivities.childId, childId));
    
    const categoryActivities = activities
      .filter(a => a.category === category)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    // Find the activity to move
    const currentIndex = categoryActivities.findIndex(a => a.activityId === activityId);
    
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Calculate new index
    let newIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < categoryActivities.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      // No movement needed
      return NextResponse.json({ success: true });
    }

    // Swap the activities
    const temp = categoryActivities[currentIndex];
    categoryActivities[currentIndex] = categoryActivities[newIndex];
    categoryActivities[newIndex] = temp;

    // Update order indices in database
    for (let i = 0; i < categoryActivities.length; i++) {
      await db.update(customActivities)
        .set({ orderIndex: i, updatedAt: new Date() })
        .where(eq(customActivities.id, categoryActivities[i].id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering activities:', error);
    return NextResponse.json({ error: 'Failed to reorder activities' }, { status: 500 });
  }
}
