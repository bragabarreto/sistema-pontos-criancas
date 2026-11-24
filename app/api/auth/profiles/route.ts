import { NextResponse } from 'next/server';
import { listProfiles } from '@/lib/auth';

export async function GET() {
  try {
    return NextResponse.json(await listProfiles());
  } catch (error) {
    console.error('Error listing profiles:', error);
    return NextResponse.json([], { status: 500 });
  }
}
