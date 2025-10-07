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

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: 'O nome é obrigatório' 
      }, { status: 400 });
    }

    if (!appStartDate) {
      return NextResponse.json({ 
        error: 'A data de início do app é obrigatória' 
      }, { status: 400 });
    }

    // Validate date format
    let parsedDate: Date;
    try {
      parsedDate = new Date(appStartDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (e) {
      return NextResponse.json({ 
        error: 'Data inválida. Use o formato correto (YYYY-MM-DD)' 
      }, { status: 400 });
    }

    // Check if parent already exists
    const existing = await db.select().from(parentUser);
    
    if (existing.length > 0) {
      // Update existing parent
      const updated = await db.update(parentUser)
        .set({
          name: name.trim(),
          gender: gender || null,
          appStartDate: parsedDate,
          updatedAt: new Date(),
        })
        .where(eq(parentUser.id, existing[0].id))
        .returning();
      
      return NextResponse.json(updated[0]);
    } else {
      // Create new parent
      const created = await db.insert(parentUser)
        .values({
          name: name.trim(),
          gender: gender || null,
          appStartDate: parsedDate,
        })
        .returning();
      
      return NextResponse.json(created[0]);
    }
  } catch (error) {
    console.error('Error saving parent user:', error);
    return NextResponse.json({ 
      error: 'Falha ao salvar informações do pai/mãe', 
      details: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}
