import { NextResponse } from 'next/server';

export async function GET() {
  const testImageUrl = 'https://cards.scryfall.io/normal/front/8/b/8b4d1c74-8b73-445c-b226-349c57a972f6.jpg?1562630963';
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(testImageUrl)}`;
  
  return NextResponse.json({
    originalUrl: testImageUrl,
    proxyUrl: proxyUrl,
    message: 'Proxy test endpoint - use the proxyUrl to test image loading'
  });
}
