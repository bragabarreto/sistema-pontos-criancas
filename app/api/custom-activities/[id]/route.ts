import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities } from '@/lib/schema';
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

    const updatedCustomActivity = await db.update(customActivities)
      .set({
        ...(name !== undefined && { name }),
        ...(points !== undefined && { points: parseInt(points) }),
        ...(category !== undefined && { category }),
        ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex) }),
        updatedAt: new Date(),
      })
      .where(eq(customActivities.id, activityId))
      .returning();

    if (updatedCustomActivity.length === 0) {
      return NextResponse.json({ error: 'Custom activity not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCustomActivity[0]);
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

    const result = await db.delete(customActivities).where(eq(customActivities.id, activityId)).returning();
    
    if (result.length === 0) {
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
