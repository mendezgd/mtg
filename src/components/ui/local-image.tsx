"use client";

import React from "react";
import Image from "next/image";

interface LocalImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

const LocalImage: React.FC<LocalImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  loading = "lazy",
  fill = false,
  sizes,
  quality = 85,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(src);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/images/default-card.svg');
    }
  };

  // Preparar las props para el componente Image
  const imageProps: any = {
    src: imgSrc,
    alt,
    width,
    height,
    className,
    fill,
    sizes,
    quality,
    onError: handleError,
    unoptimized: false,
  };

  // Solo pasar priority o loading, no ambos
  if (priority) {
    imageProps.priority = true;
  } else {
    imageProps.loading = loading;
  }

  return <Image {...imageProps} />;
};

export default LocalImage;
