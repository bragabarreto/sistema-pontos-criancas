import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allChildren = await db.select().from(children);
    return NextResponse.json(allChildren);
  } catch (error) {
    console.error('Error fetching children:', error);
    // Always return an array, even on error, to prevent frontend issues
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, initialBalance, startDate } = body;

    const newChild = await db.insert(children).values({
      name,
      initialBalance: initialBalance || 0,
      startDate: startDate ? new Date(startDate) : null,
      totalPoints: initialBalance || 0,
    }).returning();

    return NextResponse.json(newChild[0], { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
  }
}
