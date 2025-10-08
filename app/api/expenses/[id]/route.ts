import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const expenseId = parseInt(params.id);

    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    // Delete the expense
    await db.delete(expenses).where(eq(expenses.id, expenseId));

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ 
      error: 'Failed to delete expense', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
