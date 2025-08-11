"use client";

import React, { useState } from "react";

interface BackgroundImageCSSProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
}

const BackgroundImageCSS: React.FC<BackgroundImageCSSProps> = ({
  src,
  alt,
  className = "",
  fallbackColor = "rgba(0, 0, 0, 0.1)",
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
    <div
      className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundColor: fallbackColor,
      }}
      onError={() => setHasError(true)}
      role="img"
      aria-label={alt}
    />
  );
};

export default BackgroundImageCSS;
