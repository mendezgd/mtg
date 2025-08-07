import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageName = searchParams.get('name');

  if (!imageName) {
    return new NextResponse('Missing image name', { status: 400 });
  }

  // List of allowed local images
  const allowedImages = [
    'pixelpox.webp',
    'chudix.webp', 
    'chudixd.webp'
  ];

  if (!allowedImages.includes(imageName)) {
    return new NextResponse('Invalid image name', { status: 400 });
  }

  try {
    const imagePath = join(process.cwd(), 'public', 'images', imageName);
    const imageBuffer = readFileSync(imagePath);
    
    // Determine content type based on file extension
    const contentType = imageName.endsWith('.webp') 
      ? 'image/webp' 
      : imageName.endsWith('.jpg') 
      ? 'image/jpeg'
      : imageName.endsWith('.png')
      ? 'image/png'
      : 'image/svg+xml';
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving local image:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}
