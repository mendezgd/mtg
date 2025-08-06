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
  return (
    <img
      src={src || fallbackSrc}
      alt={alt}
      className={className}
      style={{ width: width || '100%', height: height || 'auto' }}
    />
  );
};

export default SafeImage; 