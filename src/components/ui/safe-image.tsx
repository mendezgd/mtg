"use client";

import React, { useState } from "react";
import Image from "next/image";

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
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Preparar las props para Next.js Image
  const imageProps: any = {
    src: imgSrc,
    alt,
    width: width || 100,
    height: height || 140,
    className,
    onError: handleError,
    unoptimized: false,
  };

  // Solo usar priority o loading, no ambos
  if (priority) {
    imageProps.priority = true;
  } else {
    imageProps.loading = loading;
  }

  // Usar Next.js Image para todas las imágenes (locales y externas)
  // ya que cards.scryfall.io está configurado en next.config.ts
  return <Image {...imageProps} />;
};

export default SafeImage; 