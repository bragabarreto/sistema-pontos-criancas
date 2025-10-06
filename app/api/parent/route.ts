import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parentUser } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET parent user info
export async function GET() {
  try {
    const parents = await db.select().from(parentUser);
    
    if (parents.length === 0) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(parents[0]);
  } catch (error) {
    console.error('Error fetching parent user:', error);
    return NextResponse.json({ error: 'Failed to fetch parent user' }, { status: 500 });
  }
}

// POST or UPDATE parent user info
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, gender, appStartDate } = body;

    if (!name || !appStartDate) {
      return NextResponse.json({ error: 'Name and app start date are required' }, { status: 400 });
    }

    // Check if parent already exists
    const existing = await db.select().from(parentUser);
    
    if (existing.length > 0) {
      // Update existing parent
      const updated = await db.update(parentUser)
        .set({
          name,
          gender,
          appStartDate: new Date(appStartDate),
          updatedAt: new Date(),
        })
        .where(eq(parentUser.id, existing[0].id))
        .returning();
      
      return NextResponse.json(updated[0]);
    } else {
      // Create new parent
      const created = await db.insert(parentUser)
        .values({
          name,
          gender,
          appStartDate: new Date(appStartDate),
        })
        .returning();
      
      return NextResponse.json(created[0]);
    }
  } catch (error) {
    console.error('Error saving parent user:', error);
    return NextResponse.json({ error: 'Failed to save parent user' }, { status: 500 });
  }
}
