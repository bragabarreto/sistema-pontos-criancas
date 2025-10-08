import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { getFortalezaNow, dateStringToFortalezaTimestamp } from '@/lib/timezone';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (childId) {
      const childExpenses = await db.select()
        .from(expenses)
        .where(eq(expenses.childId, parseInt(childId)))
        .orderBy(desc(expenses.date));
      return NextResponse.json(childExpenses);
    }

    const allExpenses = await db.select().from(expenses).orderBy(desc(expenses.date));
    return NextResponse.json(allExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    // Always return an array, even on error, to prevent frontend issues
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, description, amount, date } = body;

    // Validate required fields
    if (!childId || !description || amount === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: childId, description, and amount are required' 
      }, { status: 400 });
    }

    // Validate data types
    const parsedChildId = parseInt(childId);
    const parsedAmount = parseInt(amount);

    if (isNaN(parsedChildId) || isNaN(parsedAmount)) {
      return NextResponse.json({ 
        error: 'Invalid data types: childId and amount must be numbers' 
      }, { status: 400 });
    }

    if (parsedAmount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 });
    }

    // Create expense with Fortaleza timezone
    const expenseDate = date 
      ? dateStringToFortalezaTimestamp(date) 
      : getFortalezaNow();
    
    const newExpense = await db.insert(expenses).values({
      childId: parsedChildId,
      description,
      amount: parsedAmount,
      date: expenseDate,
    }).returning();

    return NextResponse.json(newExpense[0], { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ 
      error: 'Failed to create expense', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
