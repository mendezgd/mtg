import React from "react";
import { SearchableCard } from "@/types/card";

interface CardGridProps {
  cards: SearchableCard[];
  onCardClick?: (card: SearchableCard) => void;
  onCardPreview?: (card: SearchableCard) => void;
  onAddToDeck?: (card: SearchableCard) => void;
  className?: string;
  isMobile?: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
  onCardPreview,
  onAddToDeck,
  className = "",
  isMobile = false,
}) => {
  const handleCardClick = (card: SearchableCard) => {
    if (onCardClick) {
      onCardClick(card);
    } else if (onCardPreview) {
      onCardPreview(card);
    }
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 ${className}`}>
      {cards.map((card) => (
        <div key={card.id || card.name} className="rounded-lg p-2 flex flex-col bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors">
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