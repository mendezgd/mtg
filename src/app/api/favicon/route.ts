import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Try to serve the WebP favicon
    const webpPath = join(process.cwd(), 'public', 'images', 'pixelpox.webp');
    const webpBuffer = readFileSync(webpPath);
    
    return new NextResponse(webpBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // Fallback to a simple response if file not found
    return new NextResponse('Favicon not found', { status: 404 });
  }
}
