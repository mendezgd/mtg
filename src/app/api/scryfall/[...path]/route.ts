import { NextRequest, NextResponse } from 'next/server';

const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await context.params;
    const path = resolvedParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const scryfallUrl = `${SCRYFALL_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`[API] Proxying request to: ${scryfallUrl}`);
    
    const response = await fetch(scryfallUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MTG-App/1.0 (https://github.com/your-repo)',
      },
      cache: 'no-store',
    });
    
    console.log(`[API] Scryfall response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[API] Scryfall error: ${response.status} ${response.statusText}`);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access forbidden. Please check your request.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Scryfall API error: ${response.status} - ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Add CORS headers
    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    nextResponse.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    return nextResponse;
  } catch (error) {
    console.error('[API] Error proxying to Scryfall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
