import React from "react";
import { SearchableCard } from "@/types/card";

interface CardPriceProps {
  card: SearchableCard;
  className?: string;
}

export const CardPrice: React.FC<CardPriceProps> = ({ card, className = "" }) => {
  const formatPrice = (price: string | undefined) => {
    if (!price) return "N/A";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "N/A";
    return `$${numPrice.toFixed(2)}`;
  };

  const getLowestPrice = () => {
    const prices = card.prices;
    if (!prices) return null;

    const priceValues = [
      { type: "Regular", price: prices.usd },
      { type: "Foil", price: prices.usd_foil },
      { type: "Etched", price: prices.usd_etched },
    ].filter(p => p.price && parseFloat(p.price) > 0);

    if (priceValues.length === 0) return null;

    const lowest = priceValues.reduce((min, current) => {
      const currentPrice = parseFloat(current.price!);
      const minPrice = parseFloat(min.price!);
      return currentPrice < minPrice ? current : min;
    });

    return lowest;
  };

  const lowestPrice = getLowestPrice();

  if (!lowestPrice) {
    return (
      <div className={`text-sm text-gray-400 ${className}`}>
        Precio no disponible
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">
          {lowestPrice.type}
        </span>
        <span className="text-sm font-bold text-green-400">
          {formatPrice(lowestPrice.price)}
        </span>
      </div>
      
      {/* Mostrar otros precios si están disponibles */}
      {card.prices && (
        <div className="text-xs text-gray-500 space-y-1">
          {card.prices.usd && card.prices.usd !== lowestPrice.price && (
            <div className="flex justify-between">
              <span>Regular:</span>
              <span>{formatPrice(card.prices.usd)}</span>
            </div>
          )}
          {card.prices.usd_foil && card.prices.usd_foil !== lowestPrice.price && (
            <div className="flex justify-between">
              <span>Foil:</span>
              <span>{formatPrice(card.prices.usd_foil)}</span>
            </div>
          )}
          {card.prices.usd_etched && card.prices.usd_etched !== lowestPrice.price && (
            <div className="flex justify-between">
              <span>Etched:</span>
              <span>{formatPrice(card.prices.usd_etched)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 