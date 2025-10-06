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
    const body = await request.json();
    const { name, points, category, orderIndex } = body;

    const updatedCustomActivity = await db.update(customActivities)
      .set({
        ...(name !== undefined && { name }),
        ...(points !== undefined && { points }),
        ...(category !== undefined && { category }),
        ...(orderIndex !== undefined && { orderIndex }),
        updatedAt: new Date(),
      })
      .where(eq(customActivities.id, parseInt(params.id)))
      .returning();

    if (updatedCustomActivity.length === 0) {
      return NextResponse.json({ error: 'Custom activity not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCustomActivity[0]);
  } catch (error) {
    console.error('Error updating custom activity:', error);
    return NextResponse.json({ error: 'Failed to update custom activity' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await db.delete(customActivities).where(eq(customActivities.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom activity:', error);
    return NextResponse.json({ error: 'Failed to delete custom activity' }, { status: 500 });
  }
}
