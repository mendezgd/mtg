import React from "react";
import { SearchableCard } from "@/types/card";
import SafeImage from "./safe-image";

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
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1.5 w-full ${className}`}
    >
      {cards.map((card, index) => (
        <div
          key={card.id || `${card.name}-${index}`}
          className="rounded-lg p-0.5 flex flex-col bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors h-48 w-full min-w-0"
        >
          <div className="flex-1 relative group min-h-0 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                handleCardClick(card);
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <SafeImage
                src={card.image_uris?.normal || "/images/default-card.jpg"}
                alt={card.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform rounded-lg max-h-full"
                loading="lazy"
              />
            </button>
          </div>

          <div className="mt-1 space-y-1 flex-shrink-0 min-w-0">
            <h3 className="font-medium text-xs text-gray-200 text-center truncate w-full">
              {card.name}
            </h3>
            {onAddToDeck && (
              <button
                className="w-full text-xs py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
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
