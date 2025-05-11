"use client";

import React, { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

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

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const cardStyle = {
  width: "100px",
  height: "140px",
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
  userSelect: "none" as React.CSSProperties["userSelect"],
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
  enlarged?: boolean;
  onRightClick?: () => void;
  disableHover?: boolean;
}> = ({ card, onTap, enlarged, onRightClick, disableHover }) => {
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
        position: "absolute",
        left: card.x,
        top: card.y,
        transform: `${card.tapped ? "rotate(90deg)" : ""} ${
          enlarged ? "scale(2.5)" : ""
        }`, // Enlarges the card when `enlarged` is true
        transformOrigin: "center center",
        transition: "transform 0.3s ease, opacity 0.3s ease",
        zIndex: enlarged ? 1000 : "auto", // Bring enlarged card to the front
        width: isMobile() ? "80px" : "100px",
        height: isMobile() ? "112px" : "140px",
      }}
      className={`${
        disableHover ? "" : "hover:scale-125"
      } transition-transform duration-200 ${
        enlarged ? "pointer-events-auto" : ""
      }`}
      title={card.name}
      onClick={(e) => {
        e.stopPropagation();
        if (onTap) onTap();
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // Prevent the default browser context menu
        e.stopPropagation(); // Stop the event from propagating further
        if (onRightClick) onRightClick(); // Call the right-click handler
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
      className="relative flex flex-wrap p-2 md:p-6 border-2 border-dashed border-gray-500 rounded-lg bg-gray-700/50 
                h-full w-full overflow-y-auto touch-none"
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
  const [enlargedCardId, setEnlargedCardId] = useState<string | null>(null);

  // Shuffle the deck on component load
  useEffect(() => {
    const shuffledDeck = shuffleDeck(initialDeck);
    setPlayerDeck(shuffledDeck);
  }, [initialDeck]);

  // Add effect to close enlarged card when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (enlargedCardId && !(e.target as Element).closest(".draggable-card")) {
        setEnlargedCardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enlargedCardId]);

  const handleCardRightClick = (cardId: string | undefined) => {
    if (!cardId) return;

    // Toggle the enlarged state of the card
    setEnlargedCardId((currentId) => (currentId === cardId ? null : cardId));
  };

  const drawCardFromDeck = () => {
    if (playerDeck.length > 0) {
      const cardWithId = {
        ...playerDeck[0],
        id: Math.random().toString(36).substr(2, 9),
        x: playerHand.length * 80,
        y: 0,
      };
      setPlayerHand((prevHand) => [...prevHand, cardWithId]);
      setPlayerDeck((prevDeck) => prevDeck.slice(1));
    }
  };

  const handleCardDropToPlayArea = (
    card: CardData,
    position: { x: number; y: number }
  ) => {
    if (!card.id) return;

    setPlayArea((prevPlayArea) => {
      const existingCardIndex = prevPlayArea.findIndex((c) => c.id === card.id);

      if (existingCardIndex !== -1) {
        // Update the position of the card in the play area
        const updatedCards = [...prevPlayArea];
        updatedCards[existingCardIndex] = {
          ...updatedCards[existingCardIndex],
          x: position.x,
          y: position.y,
        };
        return updatedCards;
      } else {
        // Remove the card from the hand and add it to the play area
        setPlayerHand((prevHand) =>
          prevHand
            .filter((c) => c.id !== card.id) // Remove the card from the hand
            .map((c, i) => ({
              ...c,
              x: i * 80, // Recalculate x positions for remaining cards
            }))
        );
        return [...prevPlayArea, { ...card, x: position.x, y: position.y }];
      }
    });
  };

  const handleCardDropToHand = (card: CardData, targetIndex?: number) => {
    setPlayerHand((prevHand) => {
      // Remove the card from its current position in the hand
      const updatedHand = prevHand.filter((c) => c.id !== card.id);

      // Insert the card at the target index or at the end if no index is provided
      if (targetIndex !== undefined) {
        updatedHand.splice(targetIndex, 0, card);
      } else {
        updatedHand.push(card);
      }

      // Recalculate x positions for all cards in the hand
      return updatedHand.map((c, i) => ({
        ...c,
        x: i * 80,
      }));
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

  // Reset match to initial state
  const resetMatch = () => {
    const shuffledDeck = shuffleDeck(initialDeck);
    setPlayerDeck(shuffledDeck);
    setPlayerHand([]);
    setPlayArea([]);
    setEnlargedCardId(null);
  };

  return (
    <DndProvider backend={isMobile() ? TouchBackend : HTML5Backend}>
      <div className="flex flex-col h-screen w-screen bg-gray-800 text-white relative">
        {/* Reset Match Button */}
        <button
          onClick={resetMatch}
          className="absolute top-2 right-4 bg-red-400 hover:bg-red-500 text-white text-sm px-4 rounded shadow-md transition z-50"
          title="Reset Match"
        >
          Reset Match
        </button>

        {/* Play Area */}
        <div className="flex-1 p-2 mb-3 md:p-4 relative">
          <h2 className="text-sm md:text-lg mb-1 md:mb-2 text-[#7DF9FF]">
            Zona de Juego
          </h2>
          <DropZone onDrop={handleCardDropToPlayArea}>
            {playArea.map((card) => (
              <DraggableCard
                key={card.id}
                card={card}
                onTap={() => toggleCardTap(card.id)}
                onRightClick={() => handleCardRightClick(card.id)}
                enlarged={card.id === enlargedCardId}
                disableHover={true} // Disable hover effect in the play area
              />
            ))}
          </DropZone>

          {/* Deck */}
          <div
            className="absolute bottom-1 left-4 md:bottom-1 md:left-9 w-20 h-24 md:w-24 md:h-32 bg-gray-700 rounded-lg shadow-lg flex justify-center items-center 
              cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            onClick={drawCardFromDeck}
          >
            <img
              src="/images/pox.webp" // Replace with the correct path
              className="absolute w-full h-full object-cover opacity-50"
              alt="Deck of cards"
            />
            <p className="text-white text-center text-sm md:text-base relative z-10 font-bold drop-shadow">
              Deck ({playerDeck.length})
            </p>
          </div>
        </div>

        {/* Hand Area */}
        <div className="flex flex-col md:flex-row items-end p-2 md:p-4 gap-2 md:gap-4">
          {/* Hand */}
          <div className="flex-1 w-full">
            <DropZone
              onDrop={(card: CardData, position) => {
                const targetIndex = Math.floor(position.x / 80); // Calculate the target index based on the drop position
                handleCardDropToHand(card, targetIndex);
              }}
            >
              <div className="relative w-full h-32 md:h-36 bg-gray-700 rounded-lg shadow-lg overflow-x-auto px-1">
                <div
                  className="flex flex-nowrap gap-2"
                  style={{
                    minWidth: `${Math.max(playerHand.length * 80, 100)}px`, // Ensure the container's width grows with the number of cards
                  }}
                >
                  {playerHand.map((card, index) => (
                    <DraggableCard
                      key={card.id}
                      card={card}
                      onRightClick={() => handleCardRightClick(card.id)} // Right-click toggles enlargement
                      enlarged={card.id === enlargedCardId} // Enlarge the card if its ID matches `enlargedCardId`
                    />
                  ))}
                </div>
              </div>
            </DropZone>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
