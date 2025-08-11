"use client";

import React from "react";

interface SimpleBackgroundProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
}

const SimpleBackground: React.FC<SimpleBackgroundProps> = ({
  src,
  alt,
  className = "",
  fallbackColor = "rgba(0, 0, 0, 0.1)",
}) => {
  return (
    <div
      className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundColor: fallbackColor,
      }}
      role="img"
      aria-label={alt}
    />
  );
};

export default SimpleBackground;
