import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Get activity first to update child points
    const activity = await db.select().from(activities).where(eq(activities.id, parseInt(params.id)));
    
    if (activity.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const { childId, points, multiplier } = activity[0];
    const pointsChange = points * multiplier;

    // Delete activity
    await db.delete(activities).where(eq(activities.id, parseInt(params.id)));

    // Update child's total points
    await db.execute(`
      UPDATE children 
      SET total_points = total_points - ${pointsChange},
          updated_at = NOW()
      WHERE id = ${childId}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}
