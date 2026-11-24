import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq, ne } from 'drizzle-orm';
import { AUTH_SETTINGS_KEY } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Password data is never exposed through this endpoint
    if (key === AUTH_SETTINGS_KEY) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    if (key) {
      const setting = await db.select().from(settings).where(eq(settings.key, key));
      return NextResponse.json(setting.length > 0 ? setting[0] : null);
    }

    const allSettings = await db.select().from(settings).where(ne(settings.key, AUTH_SETTINGS_KEY));
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return appropriate type based on whether key was requested
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (key) {
      return NextResponse.json(null, { status: 500 });
    }
    // Always return an array when fetching all settings, even on error
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || key === AUTH_SETTINGS_KEY) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    }

    // Try to update existing setting first
    const existingSetting = await db.select().from(settings).where(eq(settings.key, key));
    
    if (existingSetting.length > 0) {
      const updated = await db.update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return NextResponse.json(updated[0]);
    }

    // Create new setting
    const newSetting = await db.insert(settings).values({
      key,
      value,
    }).returning();

    return NextResponse.json(newSetting[0], { status: 201 });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
