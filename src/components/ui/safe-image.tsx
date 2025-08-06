"use client";

import React from "react";

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
  fallbackSrc = "/images/default-card.svg",
  priority = false,
  loading = "lazy",
}) => {
  const [imgSrc, setImgSrc] = React.useState(src || fallbackSrc);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
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
      crossOrigin="anonymous"
    />
  );
};

export default SafeImage; 