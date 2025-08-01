import React, { useState, useEffect } from "react";
import { SearchableCard } from "@/types/card";

interface CardGridProps {
  cards: SearchableCard[];
  onCardClick?: (card: SearchableCard) => void;
  onCardPreview?: (card: SearchableCard) => void;
  onAddToDeck?: (card: SearchableCard) => void;
  className?: string;
  isMobile?: boolean;
}

// Custom hook to get screen size
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return screenSize;
};

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
  onCardPreview,
  onAddToDeck,
  className = "",
  isMobile = false,
}) => {
  const { width } = useScreenSize();

  const getGridColumns = () => {
    if (width >= 1280) return 5; // xl
    if (width >= 1024) return 5; // lg
    if (width >= 768) return 4;  // md
    if (width >= 640) return 3;  // sm
    return 2; // default
  };

  const gridColumns = getGridColumns();

  const handleCardClick = (card: SearchableCard) => {
    if (onCardClick) {
      onCardClick(card);
    } else if (onCardPreview) {
      onCardPreview(card);
    }
  };

  return (
    <div 
      className={`grid gap-3 ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: '0.75rem'
      }}
    >
      {cards.map((card, index) => (
        <div key={card.id || `${card.name}-${index}`} className="rounded-lg p-2 flex flex-col bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex-1 relative group">
            <button
              onClick={() => handleCardClick(card)}
              className="w-full h-full"
            >
              {card.image_uris?.normal ? (
                <img
                  src={card.image_uris.normal}
                  alt={card.name}
                  className="w-full h-auto object-contain hover:scale-105 transition-transform rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 bg-gray-700 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </button>
          </div>
          
          <div className="mt-2 space-y-2">
            <h3 className="font-medium text-sm text-gray-200 text-center truncate w-full">
              {card.name}
            </h3>
            {onAddToDeck && (
              <button
                className="w-full text-xs py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToDeck(card);
                }}
              >
                {isMobile ? "Agregar" : "Agregar al Mazo"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 