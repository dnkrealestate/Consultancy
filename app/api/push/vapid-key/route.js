import { NextResponse } from 'next/server';

// Returns the VAPID public key so the client doesn't rely on NEXT_PUBLIC_ env inlining
export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return NextResponse.json({ error: 'VAPID key not configured' }, { status: 500 });
  return NextResponse.json({ publicKey: key });
}
