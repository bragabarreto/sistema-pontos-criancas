import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities, children } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, category, activityId, direction } = body;

    // Get all children to synchronize the reordering
    const allChildren = await db.select().from(children);
    
    // Perform reordering for each child
    for (const child of allChildren) {
      // Get all activities for this child and category
      const activities = await db.select()
        .from(customActivities)
        .where(eq(customActivities.childId, child.id));
      
      const categoryActivities = activities
        .filter(a => a.category === category)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

      // Find the activity to move by matching the base activityId pattern
      // The activityId contains child name prefix, so we need to find by name and category
      const baseActivityId = activityId.replace(/^(luiza|miguel)-/, '');
      const currentIndex = categoryActivities.findIndex(a => 
        a.activityId.replace(/^(luiza|miguel)-/, '') === baseActivityId
      );
      
      if (currentIndex === -1) {
        continue; // Skip if activity not found for this child
      }

      // Calculate new index
      let newIndex = currentIndex;
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < categoryActivities.length - 1) {
        newIndex = currentIndex + 1;
      } else {
        // No movement needed for this child
        continue;
      }

      // Swap the activities
      const temp = categoryActivities[currentIndex];
      categoryActivities[currentIndex] = categoryActivities[newIndex];
      categoryActivities[newIndex] = temp;

      // Update order indices in database for this child
      for (let i = 0; i < categoryActivities.length; i++) {
        await db.update(customActivities)
          .set({ orderIndex: i, updatedAt: new Date() })
          .where(eq(customActivities.id, categoryActivities[i].id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering activities:', error);
    return NextResponse.json({ error: 'Failed to reorder activities' }, { status: 500 });
  }
}
