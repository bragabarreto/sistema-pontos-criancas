import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities, children } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const activityId = parseInt(params.id);
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, points, category, orderIndex } = body;

    // Get the activity to find its base activityId
    const [activity] = await db.select()
      .from(customActivities)
      .where(eq(customActivities.id, activityId));
      
    if (!activity) {
      return NextResponse.json({ error: 'Custom activity not found' }, { status: 404 });
    }

    // Extract base activityId (without child prefix)
    const baseActivityId = activity.activityId.replace(/^(luiza|miguel)-/, '');
    
    // Get all children to update activity for both
    const allChildren = await db.select().from(children);
    
    const updatedActivities = [];
    
    // Update activity for each child
    for (const child of allChildren) {
      const childActivityId = `${child.name.toLowerCase()}-${baseActivityId}`;
      
      const updated = await db.update(customActivities)
        .set({
          ...(name !== undefined && { name }),
          ...(points !== undefined && { points: parseInt(points) }),
          ...(category !== undefined && { category }),
          ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex) }),
          updatedAt: new Date(),
        })
        .where(eq(customActivities.activityId, childActivityId))
        .returning();
        
      if (updated.length > 0) {
        updatedActivities.push(updated[0]);
      }
    }

    if (updatedActivities.length === 0) {
      return NextResponse.json({ error: 'Custom activity not found' }, { status: 404 });
    }

    // Return the activity for the original child
    const originalActivity = updatedActivities.find(a => a.id === activityId);
    return NextResponse.json(originalActivity || updatedActivities[0]);
  } catch (error) {
    console.error('Error updating custom activity:', error);
    return NextResponse.json({ 
      error: 'Failed to update custom activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    // Get the activity to find its base activityId
    const [activity] = await db.select()
      .from(customActivities)
      .where(eq(customActivities.id, activityId));
      
    if (!activity) {
      return NextResponse.json({ error: 'Custom activity not found' }, { status: 404 });
    }

    // Extract base activityId (without child prefix)
    const baseActivityId = activity.activityId.replace(/^(luiza|miguel)-/, '');
    
    // Get all children to delete activity for both
    const allChildren = await db.select().from(children);
    
    const deletedActivities = [];
    
    // Delete activity for each child
    for (const child of allChildren) {
      const childActivityId = `${child.name.toLowerCase()}-${baseActivityId}`;
      
      const result = await db.delete(customActivities)
        .where(eq(customActivities.activityId, childActivityId))
        .returning();
        
      if (result.length > 0) {
        deletedActivities.push(result[0]);
      }
    }
    
    if (deletedActivities.length === 0) {
      return NextResponse.json({ error: 'Custom activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom activity:', error);
    return NextResponse.json({ 
      error: 'Failed to delete custom activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
