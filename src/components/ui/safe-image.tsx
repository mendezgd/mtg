"use client";

import React from "react";
import { ImageService } from "@/lib/image-utils";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackSrc,
  priority = false,
  loading = "lazy",
}) => {
  const [imgSrc, setImgSrc] = React.useState(() => {
    return ImageService.processImageUrl(src || fallbackSrc || ImageService.getFallbackUrl());
  });
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const newSrc = ImageService.processImageUrl(src || fallbackSrc || ImageService.getFallbackUrl());
    setImgSrc(newSrc);
    setHasError(false);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== ImageService.getFallbackUrl()) {
      setHasError(true);
      setImgSrc(ImageService.getFallbackUrl());
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: width || '100%', height: height || 'auto' }}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
      />
    </div>
  );
};

export default SafeImage; 