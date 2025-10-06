import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const child = await db.select().from(children).where(eq(children.id, parseInt(params.id)));
    
    if (child.length === 0) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    return NextResponse.json(child[0]);
  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json({ error: 'Failed to fetch child' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { name, initialBalance, startDate, totalPoints } = body;

    const updatedChild = await db.update(children)
      .set({
        ...(name !== undefined && { name }),
        ...(initialBalance !== undefined && { initialBalance }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(totalPoints !== undefined && { totalPoints }),
        updatedAt: new Date(),
      })
      .where(eq(children.id, parseInt(params.id)))
      .returning();

    if (updatedChild.length === 0) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json(updatedChild[0]);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await db.delete(children).where(eq(children.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
  }
}
