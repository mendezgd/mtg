import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = "md", 
  text = "Cargando...", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-500 mb-4`} />
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
  </div>
);

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`loading-skeleton rounded ${className}`} />
); 