"use client";

import React from "react";
import { getProxiedImageUrl, getLocalImageUrl, getFallbackImageUrl } from "@/lib/image-utils";

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
  fallbackSrc = getFallbackImageUrl(),
  priority = false,
  loading = "lazy",
}) => {
  const [imgSrc, setImgSrc] = React.useState(() => {
    const processedSrc = getProxiedImageUrl(src || fallbackSrc);
    return getLocalImageUrl(processedSrc);
  });
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const processedSrc = getProxiedImageUrl(src || fallbackSrc);
    const newSrc = getLocalImageUrl(processedSrc);
    setImgSrc(newSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={{ width: width || '100%', height: height || 'auto' }}
      onError={handleError}
      loading={loading}
      // Remove crossOrigin since we're now proxying through our own domain
    />
  );
};

export default SafeImage; 