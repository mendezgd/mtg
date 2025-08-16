/**
 * Unified Image Service for handling all image-related operations
 */
export class ImageService {
  /**
   * Process and transform image URLs to avoid CORS issues
   */
  static processUrl(url: string): string {
    if (!url) return this.getFallbackUrl();
    if (this.isLocalUrl(url)) return url;
    // For static export, we'll use external URLs directly
    // CORS will need to be handled by the external service
    return url;
  }

  /**
   * Transform Scryfall image URLs to use our proxy
   */
  static getProxiedImageUrl(originalUrl: string): string {
    return this.processUrl(originalUrl);
  }

  /**
   * Transform local image URLs to use our API route for Vercel deployment
   */
  static getLocalImageUrl(imagePath: string): string {
    if (!imagePath) return this.getFallbackUrl();
    
    // Extract image name from path
    const imageName = imagePath.split('/').pop();
    
    if (!imageName) return this.getFallbackUrl();
    
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
  static isScryfallUrl(url: string): boolean {
    return url.includes('cards.scryfall.io') || url.includes('api.scryfall.com');
  }

  /**
   * Checks if a URL is local
   */
  private static isLocalUrl(url: string): boolean {
    return url.startsWith('/');
  }

  /**
   * Creates a proxy URL for external images
   * Note: This is disabled for static export
   */
  private static proxyUrl(url: string): string {
    // For static export, return the original URL
    return url;
  }

  /**
   * Gets the fallback image URL
   */
  static getFallbackUrl(): string {
    return '/images/default-card.svg';
  }

  /**
   * Process image URL with both proxy and local handling
   */
  static processImageUrl(src: string): string {
    const processedSrc = this.getProxiedImageUrl(src || this.getFallbackUrl());
    return this.getLocalImageUrl(processedSrc);
  }
}

// Legacy function exports for backward compatibility
export function getProxiedImageUrl(originalUrl: string): string {
  return ImageService.getProxiedImageUrl(originalUrl);
}

export function getLocalImageUrl(imagePath: string): string {
  return ImageService.getLocalImageUrl(imagePath);
}

export function isScryfallUrl(url: string): boolean {
  return ImageService.isScryfallUrl(url);
}

export function getFallbackImageUrl(): string {
  return ImageService.getFallbackUrl();
}
