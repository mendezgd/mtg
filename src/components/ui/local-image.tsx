"use client";

import React, { useState } from "react";
import Image from "next/image";

interface LocalImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

const LocalImage: React.FC<LocalImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc = "/images/default-card.svg",
  priority = false,
  fill = false,
  sizes,
  style,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      priority={priority}
      fill={fill}
      sizes={sizes}
      style={style}
      onError={handleError}
      {...props}
    />
  );
};

export default LocalImage;
