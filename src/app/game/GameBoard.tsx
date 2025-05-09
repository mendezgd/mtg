"use client";

import React, { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface CardData {
  name: string;
  image_uris?: {
    small: string;
    normal?: string;
  };
  id?: string;
  x?: number;
  y?: number;
  tapped?: boolean;
}

const cardStyle = {
  width: "70px",
  height: "98px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "9px",
  fontWeight: "bold",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  cursor: "pointer",
  userSelect: "none",
  marginBottom: "3px",
};

const ItemType = {
  CARD: "card",
};

const shuffleDeck = (deck: CardData[]): CardData[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const DraggableCard: React.FC<{
  card: CardData;
  onTap?: () => void;
}> = ({ card, onTap }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.CARD,
    item: card,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      style={{
        ...cardStyle,
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none" as const,
        position: "absolute",
        left: card.x,
        top: card.y,
        transform: card.tapped ? "rotate(90deg)" : "none",
        transition: "transform 0.3s ease",
      }}
      className="hover:scale-110 transition-transform duration-200"
      title={card.name}
      onClick={(e) => {
        e.stopPropagation();
        if (onTap) onTap();
      }}
    >
      {card.image_uris?.normal ? (
        <img
          src={card.image_uris.normal}
          alt={card.name}
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <div className="text-center text-xs bg-gray-600 text-white p-2 rounded">
          Sin Imagen
        </div>
      )}
    </div>
  );
};

const DropZone: React.FC<{
  onDrop: (card: CardData, position: { x: number; y: number }) => void;
  children?: React.ReactNode;
}> = ({ onDrop, children }) => {
  const dropZoneRef = React.useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop(() => ({
    accept: ItemType.CARD,
    drop: (item: CardData, monitor) => {
      const sourceOffset = monitor.getSourceClientOffset();
      if (sourceOffset && dropZoneRef.current) {
        const rect = dropZoneRef.current.getBoundingClientRect();
        const x = sourceOffset.x - rect.left;
        const y = sourceOffset.y - rect.top;
        onDrop(item, { x, y });
      }
    },
  }));

  return (
    <div
      ref={(node) => {
        drop(node);
        dropZoneRef.current = node;
      }}
      className="relative flex flex-wrap p-6 border-2 border-dashed border-gray-500 rounded-lg bg-gray-700/50 
                h-full w-full overflow-y-auto"
    >
      {children}
    </div>
  );
};

export const GameBoard: React.FC<{ initialDeck: CardData[] }> = ({
  initialDeck,
}) => {
  const [playerDeck, setPlayerDeck] = useState<CardData[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [playArea, setPlayArea] = useState<CardData[]>([]);

  // Shuffle the deck on component load
  useEffect(() => {
    const shuffledDeck = shuffleDeck(initialDeck);
    setPlayerDeck(shuffledDeck);
  }, [initialDeck]);

  // Draw a card from the deck
  const drawCardFromDeck = () => {
    if (playerDeck.length > 0) {
      const cardWithId = {
        ...playerDeck[0],
        id: Math.random().toString(36).substr(2, 9),
        x: playerHand.length * 80, // Position cards horizontally in the hand
        y: 0,
      };
      setPlayerHand((prevHand) => [...prevHand, cardWithId]);
      setPlayerDeck((prevDeck) => prevDeck.slice(1));
    }
  };

  // Handle dropping a card into the play area
  const handleCardDropToPlayArea = (
    card: CardData,
    position: { x: number; y: number }
  ) => {
    if (!card.id) return;

    setPlayArea((prevPlayArea) => {
      const existingCardIndex = prevPlayArea.findIndex((c) => c.id === card.id);

      if (existingCardIndex !== -1) {
        // Update position of existing card
        const updatedCards = [...prevPlayArea];
        updatedCards[existingCardIndex] = {
          ...updatedCards[existingCardIndex],
          x: position.x,
          y: position.y,
        };
        return updatedCards;
      } else {
        // Remove from hand and add to play area
        setPlayerHand((prevHand) => {
          const updatedHand = prevHand.filter((c) => c.id !== card.id);
          // Recalculate x positions for the remaining cards
          return updatedHand.map((c, index) => ({
            ...c,
            x: index * 80, // Reassign x position based on the new index
          }));
        });
        return [...prevPlayArea, { ...card, x: position.x, y: position.y }];
      }
    });
  };

  const toggleCardTap = (cardId: string | undefined) => {
    if (!cardId) return;
    setPlayArea((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, tapped: !card.tapped } : card
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen w-screen bg-gray-800 text-white">
        {/* Play Area */}
        <div className="flex-1 p-4">
          <h2 className="text-lg mb-2 text-[#7DF9FF]">Zona de Juego</h2>
          <DropZone onDrop={handleCardDropToPlayArea}>
            {playArea.map((card) => (
              <DraggableCard
                key={card.id}
                card={card}
                onTap={() => toggleCardTap(card.id)}
              />
            ))}
          </DropZone>
        </div>

        {/* Deck and Hand Area */}
        <div className="flex flex-col md:flex-row items-end p-4 gap-4">
          {/* Deck */}
          <div
            className="w-20 h-28 md:w-24 md:h-36 bg-gray-700 rounded-lg shadow-lg flex justify-center items-center 
                     cursor-pointer hover:scale-105 transition-transform self-start"
            onClick={drawCardFromDeck}
            title="Haz clic para robar una carta"
          >
            <p className="text-white text-center text-sm md:text-base">
              Mazo ({playerDeck.length})
            </p>
          </div>

          {/* Hand */}
          <div className="flex-1">
            <h2 className="text-lg mb-2 text-[#7DF9FF]">Mano</h2>
            <div className="relative w-full h-20 md:h-24 bg-gray-700 rounded-lg shadow-lg flex items-center overflow-x-auto">
              {playerHand.map((card) => (
                <DraggableCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
