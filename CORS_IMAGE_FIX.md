# CORS and Image Loading Fixes

## Issues Fixed

### 1. Missing Favicon Files (404 Errors)
- **Problem**: Layout referenced favicon files that didn't exist in the public directory
- **Solution**: Updated to use proper favicon files:
  - Updated `layout.tsx` to use proper favicon files (ICO, PNG, Apple Touch Icon)
  - Updated `site.webmanifest` with proper app metadata and icon references
  - Added Android Chrome icons for better mobile experience
  - Removed placeholder files and API routes for favicon

### 2. CORS Error with Scryfall Images
- **Problem**: `Access to image at 'https://cards.scryfall.io/...' has been blocked by CORS policy`
- **Root Cause**: Scryfall's CDN doesn't include CORS headers for cross-origin requests
- **Solution**: 
  - Created a proxy API route (`/api/proxy-image`) to handle Scryfall image requests
  - Added image URL transformation utility to automatically proxy Scryfall URLs
  - Removed external image domains from Next.js config since we're now proxying
  - Added proper error handling with fallback images

### 3. Local Images Not Loading on Vercel
- **Problem**: Local images (`pixelpox.webp`, `chudix.webp`, `chudixd.webp`) not loading on Vercel deployment
- **Root Cause**: Vercel may not serve WebP files correctly from static directory
- **Solution**:
  - Created `/api/local-image` route to serve local images with proper headers
  - Added `getLocalImageUrl()` utility to transform local image URLs
  - Updated SafeImage component to use API route for problematic images
  - Fixed LifeCounter component to use API routes for background images

### 4. Image Loading Improvements
- **Enhanced SafeImage Component**:
  - Added error handling with fallback images
  - Added `crossOrigin="anonymous"` attribute
  - Improved state management for image loading
  - Added proper error recovery

- **Updated Next.js Configuration**:
  - Added `remotePatterns` for better external image handling
  - Maintained `unoptimized: true` for external images
  - Added proper CORS headers

## Technical Details

### SafeImage Component Changes
```typescript
// Added proxy URL transformation
const [imgSrc, setImgSrc] = React.useState(() => getProxiedImageUrl(src || fallbackSrc));

// Removed crossOrigin since we're now proxying through our own domain
<img
  onError={handleError}
  // ... other props
/>
```

### Next.js Config Changes
```typescript
// Removed external domains since we're now proxying through our API
// Removed remotePatterns since we're handling external images via proxy
```

### New Proxy API Route
```typescript
// /api/proxy-image - Handles Scryfall image requests
export async function GET(request: NextRequest) {
  const imageUrl = searchParams.get('url');
  // Fetches image from Scryfall and returns it with proper CORS headers
}
```

### Image URL Transformation
```typescript
// src/lib/image-utils.ts
export function getProxiedImageUrl(originalUrl: string): string {
  // Automatically transforms Scryfall URLs to use our proxy
  if (originalUrl.includes('cards.scryfall.io')) {
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  }
}
```

## Testing

To verify the fixes work:

1. **Favicon Errors**: Check browser dev tools - no more 404 errors for favicon files
2. **CORS Errors**: Scryfall images should load without CORS errors (now proxied through our API)
3. **Local Images**: Local images should load on both local and Vercel deployment
4. **Fallback Images**: If an image fails to load, it should show the default card image
5. **Proxy Test**: Visit `/api/test-proxy` to see the proxy URL transformation in action
6. **Local Images Test**: Visit `/api/test-local-images` to see local image endpoints

## Files Added/Modified

### New Files:
- `src/app/api/proxy-image/route.ts` - Proxy API for Scryfall images
- `src/app/api/test-proxy/route.ts` - Test endpoint for proxy functionality
- `src/app/api/local-image/route.ts` - API route for local images on Vercel
- `src/app/api/test-local-images/route.ts` - Test endpoint for local images
- `src/app/test-local-images/page.tsx` - Test page to verify local image API
- `src/lib/image-utils.ts` - Image URL transformation utilities

### Modified Files:
- `src/components/ui/safe-image.tsx` - Updated to use proxy URLs
- `src/components/ui/card-grid.tsx` - Updated to use new fallback system
- `src/components/LifeCounter.tsx` - Updated to use API routes for background images
- `next.config.ts` - Removed external image domains

## Notes

- Favicon now uses proper favicon files (ICO, PNG, Apple Touch Icon) for maximum compatibility
- Local images are served via API routes to ensure they work on Vercel
- The proxy solution completely eliminates CORS issues by serving images from our own domain
- External images from Scryfall are now proxied through our API, ensuring they load properly
- All API routes include proper caching headers for better performance
