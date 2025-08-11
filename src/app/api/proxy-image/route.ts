import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    logger.warn('Proxy image request missing URL parameter');
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    logger.debug('Proxying image:', imageUrl);
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'MTG-Premodern/1.0',
        'Accept': 'image/*',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      logger.error('Failed to fetch image:', response.status, response.statusText);
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      logger.warn('Invalid content type for image:', contentType);
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const buffer = await response.arrayBuffer();
    
    logger.debug('Successfully proxied image:', imageUrl, 'Size:', buffer.byteLength);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    logger.error('Image proxy error:', error.message);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    
    if (error.message.includes('Failed to fetch')) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
