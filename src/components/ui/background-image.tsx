"use client";

import React, { useState } from "react";
import Image from "next/image";

interface BackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
  priority?: boolean;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt,
  className = "",
  fallbackColor = "rgba(0, 0, 0, 0.1)",
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{ backgroundColor: fallbackColor }}
      />
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        priority={priority}
        onError={() => setHasError(true)}
        sizes="100vw"
        unoptimized={true} // Forzar sin optimización para WebP locales
      />
      {/* Fallback de color de fondo */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: fallbackColor }}
      />
    </>
  );
};

export default BackgroundImage;
