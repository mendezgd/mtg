/**
 * Transforms Scryfall image URLs to use our proxy to avoid CORS issues
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return '/images/default-card.svg';
  
  // If it's already a local URL or our proxy URL, return as is
  if (originalUrl.startsWith('/') || originalUrl.includes('/api/proxy-image')) {
    return originalUrl;
  }
  
  // If it's a Scryfall URL, proxy it
  if (originalUrl.includes('cards.scryfall.io') || originalUrl.includes('api.scryfall.com')) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/proxy-image?url=${encodedUrl}`;
  }
  
  // For other external URLs, return as is (they might have CORS headers)
  return originalUrl;
}

/**
 * Transforms local image URLs to use our API route for Vercel deployment
 */
export function getLocalImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/default-card.svg';
  
  // Extract image name from path
  const imageName = imagePath.split('/').pop();
  
  if (!imageName) return '/images/default-card.svg';
  
  // List of images that need to be served via API route
  const localImages = [
    'pixelpox.webp', 
    'chudix.webp', 
    'chudixd.webp'
  ];
  
  if (localImages.includes(imageName)) {
    // Serve directly from public folder instead of API route
    return `/images/${imageName}`;
  }
  
  // For other local images, return as is
  return imagePath;
}

/**
 * Checks if a URL is from Scryfall
 */
export function isScryfallUrl(url: string): boolean {
  return url.includes('cards.scryfall.io') || url.includes('api.scryfall.com');
}

/**
 * Gets the fallback image URL
 */
export function getFallbackImageUrl(): string {
  return '/images/default-card.svg';
}
