import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    faviconUrls: [
      '/favicon.ico',
      '/images/pixelpox.webp',
      '/api/favicon'
    ],
    message: 'Test favicon endpoints - check if these URLs return images',
    note: 'The favicon should work on both local and Vercel deployment'
  });
}
