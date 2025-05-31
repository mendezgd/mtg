"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
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
          enlarged ? "scale(2.5)" : isHovered ? "scale(1.1)" : ""
        }`,
        transformOrigin: "center center",
        transition: "transform 0.2s ease, opacity 0.2s ease",
        zIndex: enlarged ? 400 : isHovered ? 200 : "auto",
        width: isMobile() ? "80px" : "100px",
        height: isMobile() ? "112px" : "140px",
        touchAction: "none",
      }}
      className={`${
        disableHover ? "" : "hover:scale-110"
      } transition-transform duration-200 ${
        enlarged ? "pointer-events-auto" : ""
      }`}
      title={card.name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (onTap) onTap();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRightClick) onRightClick();
      }}
    >
      {card.image_uris?.normal ? (
        <img
          src={card.image_uris.normal}
          alt={card.name}
          className="w-full h-full object-cover rounded"
          draggable="false"
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
  className?: string;
}> = ({ onDrop, children, className }) => {
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
      className={`relative flex flex-wrap p-2 md:p-6 border-2 border-dashed border-gray-500 rounded-lg bg-gray-700/50 
                h-full w-full overflow-y-auto touch-none ${className || ""}`}
    >
      {children}
    </div>
  );
};

const DeckListModal: React.FC<{
  deck: CardData[];
  onClose: () => void;
  onCardSelect: (card: CardData) => void;
}> = ({ deck, onClose, onCardSelect }) => {
  const groupedDeck = deck.reduce(
    (acc, card) => {
      const key = card.name;
      if (!acc[key]) {
        acc[key] = { card, count: 1 };
      } else {
        acc[key].count++;
      }
      return acc;
    },
    {} as Record<string, { card: CardData; count: number }>
  );

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-start z-50">
      <div className="bg-gray-800 p-2 rounded-r-lg h-[80vh] w-32 overflow-hidden flex flex-col mt-2">
        <div className="flex justify-between mb-2">
          <h2 className="text-sm font-bold text-white">Deck</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          <div className="flex flex-col gap-2">
            {Object.entries(groupedDeck).map(([name, { card, count }]) => (
              <div
                key={name}
                className="relative w-24 h-24 mx-auto cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onCardSelect(card)}
              >
                <DraggableCard
                  card={card}
                  onTap={() => onCardSelect(card)}
                  disableHover={true}
                />
                <div className="absolute top-1 right-1 bg-black/75 text-white px-1.5 py-0.5 rounded-full text-xs">
                  x{count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewTopCardsModal: React.FC<{
  deck: CardData[];
  onClose: () => void;
  onCardsSelected: (
    selectedCards: CardData[],
    remainingCards: CardData[],
    placement: "top" | "bottom" | "shuffle"
  ) => void;
  onCardToHand: (card: CardData) => void;
  onCardToPlay: (card: CardData) => void;
}> = ({ deck, onClose, onCardsSelected, onCardToHand, onCardToPlay }) => {
  const [numCards, setNumCards] = useState<number>(1);
  const [viewedCards, setViewedCards] = useState<CardData[]>([]);
  const [placement, setPlacement] = useState<"top" | "bottom" | "shuffle">(
    "top"
  );
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);

  const handleViewCards = () => {
    const cards = deck.slice(0, numCards);
    setViewedCards(cards);
    setSelectedCardIndices([]);
  };

  const handleConfirm = () => {
    if (selectedCardIndices.length > 0) {
      // Remove the selected cards from viewed cards
      const remainingViewedCards = viewedCards.filter(
        (_, index) => !selectedCardIndices.includes(index)
      );
      const remainingCards = deck.slice(numCards);
      onCardsSelected(remainingViewedCards, remainingCards, placement);
    } else {
      const remainingCards = deck.slice(numCards);
      onCardsSelected(viewedCards, remainingCards, placement);
    }
    onClose();
  };

  const handleCardSelect = (index: number) => {
    setSelectedCardIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectedCardsToHand = () => {
    selectedCardIndices.forEach((index) => {
      onCardToHand(viewedCards[index]);
    });
    handleConfirm();
  };

  const handleSelectedCardsToPlay = () => {
    selectedCardIndices.forEach((index) => {
      onCardToPlay(viewedCards[index]);
    });
    handleConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">View Cards from Top</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            ✕
          </button>
        </div>

        {viewedCards.length === 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-white">Number of cards to view:</label>
              <input
                type="number"
                min="1"
                max={deck.length}
                value={numCards}
                onChange={(e) =>
                  setNumCards(
                    Math.min(parseInt(e.target.value) || 1, deck.length)
                  )
                }
                className="bg-gray-700 text-white px-2 py-1 rounded w-20"
              />
              <button
                onClick={handleViewCards}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
              >
                View Cards
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {viewedCards.map((card, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer transition-transform ${
                    selectedCardIndices.includes(index)
                      ? "scale-105 ring-2 ring-blue-500"
                      : "hover:scale-105"
                  }`}
                  onClick={() => handleCardSelect(index)}
                >
                  <img
                    src={card.image_uris?.normal || card.image_uris?.small}
                    alt={card.name}
                    className="w-full rounded"
                  />
                  <div className="absolute top-1 right-1 bg-black/75 text-white px-2 py-1 rounded-full text-xs">
                    {index + 1}
                  </div>
                  {selectedCardIndices.includes(index) && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedCardIndices.length > 0 && (
              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={handleSelectedCardsToHand}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Put Selected in Hand ({selectedCardIndices.length})
                </button>
                <button
                  onClick={handleSelectedCardsToPlay}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Put Selected in Play ({selectedCardIndices.length})
                </button>
              </div>
            )}

            <div className="mt-4">
              <label className="text-white block mb-2">
                Place remaining cards:
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPlacement("top")}
                  className={`px-4 py-2 rounded ${
                    placement === "top"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  On Top (Reorder)
                </button>
                <button
                  onClick={() => setPlacement("bottom")}
                  className={`px-4 py-2 rounded ${
                    placement === "bottom"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  On Bottom
                </button>
                <button
                  onClick={() => setPlacement("shuffle")}
                  className={`px-4 py-2 rounded ${
                    placement === "shuffle"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Shuffle
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setViewedCards([]);
                  setSelectedCardIndices([]);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              {selectedCardIndices.length === 0 && (
                <button
                  onClick={handleConfirm}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        )}
      </div>
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
  const [showDeckList, setShowDeckList] = useState(false);
  const [showViewTopCards, setShowViewTopCards] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const handContainerRef = useRef<HTMLDivElement>(null);

  const scrollHand = (direction: "left" | "right") => {
    if (handContainerRef.current) {
      const scrollAmount = handContainerRef.current.clientWidth * 0.8;
      handContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

  const handleDeckClick = (e: React.MouseEvent) => {
    if (e.type === "contextmenu") {
      e.preventDefault();
      setShowViewTopCards(true);
    } else {
      drawCardFromDeck();
    }
  };

  const handleCardSelect = (card: CardData) => {
    // Remove the selected card from the deck
    const cardIndex = playerDeck.findIndex((c) => c.name === card.name);
    if (cardIndex !== -1) {
      const newDeck = [...playerDeck];
      newDeck.splice(cardIndex, 1);
      setPlayerDeck(newDeck);

      // Calculate visible area dimensions
      const playAreaElement = document.querySelector(".play-area");
      if (playAreaElement) {
        const rect = playAreaElement.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Add the card to play area with a unique ID and position
        const cardWithId = {
          ...card,
          id: Math.random().toString(36).substr(2, 9),
          x: centerX - 50, // Center the card horizontally (card width is 100px)
          y: centerY - 70, // Center the card vertically (card height is 140px)
        };
        setPlayArea((prev) => [...prev, cardWithId]);
      } else {
        // Fallback if play area element is not found
        const cardWithId = {
          ...card,
          id: Math.random().toString(36).substr(2, 9),
          x: 100,
          y: 100,
        };
        setPlayArea((prev) => [...prev, cardWithId]);
      }
    }
    setShowDeckList(false);
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
    if (!card.id) {
      // Card is coming from deck list
      const cardIndex = playerDeck.findIndex((c) => c.name === card.name);
      if (cardIndex !== -1) {
        const newDeck = [...playerDeck];
        newDeck.splice(cardIndex, 1);
        setPlayerDeck(newDeck);

        const cardWithId = {
          ...card,
          id: Math.random().toString(36).substr(2, 9),
          x: position.x,
          y: position.y,
        };
        setPlayArea((prev) => [...prev, cardWithId]);
      }
      return;
    }

    // Existing logic for cards from hand
    setPlayArea((prevPlayArea) => {
      const existingCardIndex = prevPlayArea.findIndex((c) => c.id === card.id);

      if (existingCardIndex !== -1) {
        const updatedCards = [...prevPlayArea];
        updatedCards[existingCardIndex] = {
          ...updatedCards[existingCardIndex],
          x: position.x,
          y: position.y,
        };
        return updatedCards;
      } else {
        setPlayerHand((prevHand) =>
          prevHand
            .filter((c) => c.id !== card.id)
            .map((c, i) => ({
              ...c,
              x: i * 80,
            }))
        );
        return [...prevPlayArea, { ...card, x: position.x, y: position.y }];
      }
    });
  };

  const handleCardDropToHand = (card: CardData, targetIndex?: number) => {
    // Remove the card from play area if it exists there
    setPlayArea((prevPlayArea) => prevPlayArea.filter((c) => c.id !== card.id));

    setPlayerHand((prevHand) => {
      // Remove the card from its current position in the hand if it exists
      const updatedHand = prevHand.filter((c) => c.id !== card.id);

      // If we're reordering within the hand
      if (targetIndex !== undefined) {
        const cardWithId = {
          ...card,
          id: card.id || Math.random().toString(36).substr(2, 9),
          x: targetIndex * 80,
          y: 0,
          tapped: false,
        };
        updatedHand.splice(targetIndex, 0, cardWithId);

        // Recalculate x positions for all cards after the insertion point
        return updatedHand.map((c, i) => ({
          ...c,
          x: i * 80,
        }));
      }

      // If we're adding from play area
      const cardWithId = {
        ...card,
        id: card.id || Math.random().toString(36).substr(2, 9),
        x: updatedHand.length * 80,
        y: 0,
        tapped: false,
      };

      return [...updatedHand, cardWithId];
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

  const handleCardsSelected = (
    selectedCards: CardData[],
    remainingCards: CardData[],
    placement: "top" | "bottom" | "shuffle"
  ) => {
    let newDeck: CardData[];
    if (placement === "shuffle") {
      // Combine remaining cards with unselected viewed cards
      newDeck = [...remainingCards, ...selectedCards];
      newDeck = shuffleDeck(newDeck);
    } else if (placement === "top") {
      // Put unselected viewed cards on top, then remaining cards
      newDeck = [...selectedCards, ...remainingCards];
    } else {
      // Put remaining cards first, then unselected viewed cards
      newDeck = [...remainingCards, ...selectedCards];
    }
    setPlayerDeck(newDeck);
  };

  const handleCardToHand = (card: CardData) => {
    // Remove only the specific card from the deck
    setPlayerDeck((prevDeck) => {
      const index = prevDeck.findIndex((c) => c === card);
      if (index !== -1) {
        return [...prevDeck.slice(0, index), ...prevDeck.slice(index + 1)];
      }
      return prevDeck;
    });

    const cardWithId = {
      ...card,
      id: Math.random().toString(36).substr(2, 9),
      x: playerHand.length * 80,
      y: 0,
    };
    setPlayerHand((prevHand) => [...prevHand, cardWithId]);
  };

  const handleCardToPlay = (card: CardData) => {
    // Remove only the specific card from the deck
    setPlayerDeck((prevDeck) => {
      const index = prevDeck.findIndex((c) => c === card);
      if (index !== -1) {
        return [...prevDeck.slice(0, index), ...prevDeck.slice(index + 1)];
      }
      return prevDeck;
    });

    const playAreaElement = document.querySelector(".play-area");
    if (playAreaElement) {
      const rect = playAreaElement.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const cardWithId = {
        ...card,
        id: Math.random().toString(36).substr(2, 9),
        x: centerX - 50,
        y: centerY - 70,
      };
      setPlayArea((prev) => [...prev, cardWithId]);
    }
  };

  return (
    <DndProvider
      backend={isMobile() ? TouchBackend : HTML5Backend}
      options={{
        enableMouseEvents: true,
        enableTouchEvents: true,
        enableKeyboardEvents: true,
        delayTouchStart: 0,
        delay: 0,
        touchSlop: 0,
        ignoreContextMenu: true,
      }}
    >
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
          <DropZone onDrop={handleCardDropToPlayArea} className="play-area">
            {playArea.map((card) => (
              <DraggableCard
                key={card.id}
                card={card}
                onTap={() => toggleCardTap(card.id)}
                onRightClick={() => handleCardRightClick(card.id)}
                enlarged={card.id === enlargedCardId}
                disableHover={true}
              />
            ))}
          </DropZone>

          {/* Deck */}
          <div
            className="absolute bottom-1 left-4 md:bottom-1 md:left-9 w-20 h-24 md:w-24 md:h-32 bg-gray-700 rounded-lg shadow-lg flex justify-center items-center 
              cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            onClick={handleDeckClick}
            onContextMenu={handleDeckClick}
          >
            <img
              src="/images/pox.webp"
              className="absolute w-full h-full object-cover opacity-50"
              alt="Deck of cards"
            />
            <p className="text-white text-center text-sm md:text-base relative z-10 font-bold drop-shadow">
              Deck ({playerDeck.length})
            </p>
          </div>
        </div>

        {/* Hand Area with better horizontal scrolling */}
        <div className="flex flex-col md:flex-row items-end p-2 md:p-4 gap-2 md:gap-4">
          <div className="flex-1 w-full">
            <DropZone
              onDrop={(card: CardData, position) => {
                const targetIndex = Math.floor(position.x / 10);
                handleCardDropToHand(card, targetIndex);
              }}
            >
              <div className="relative w-full h-28 md:h-32 bg-gray-700 rounded-lg shadow-lg">
                {/* Navigation buttons container */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between z-20 pointer-events-none">
                  {playerHand.length > 4 && (
                    <>
                      <button
                        onClick={() => {
                          if (handContainerRef.current) {
                            handContainerRef.current.scrollLeft -= 30;
                          }
                        }}
                        className="w-10 h-full bg-gradient-to-r from-gray-800/90 to-transparent 
                                 hover:from-gray-700 text-white flex items-center justify-start pl-2
                                 pointer-events-auto active:from-gray-900 transition-colors"
                      >
                        <span className="text-2xl">⟪</span>
                      </button>
                      <button
                        onClick={() => {
                          if (handContainerRef.current) {
                            handContainerRef.current.scrollLeft += 30;
                          }
                        }}
                        className="w-10 h-full bg-gradient-to-l from-gray-800/90 to-transparent 
                                 hover:from-gray-700 text-white flex items-center justify-end pr-2
                                 pointer-events-auto active:from-gray-900 transition-colors"
                      >
                        <span className="text-2xl">⟫</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Cards container */}
                <div
                  ref={handContainerRef}
                  className="h-full w-full overflow-x-auto scrollbar-hide"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <div
                    className="flex h-full items-center"
                    style={{
                      width: `${Math.max(playerHand.length * 10 + 100, 100)}px`,
                    }}
                  >
                    {playerHand.map((card, index) => (
                      <div
                        key={card.id}
                        className="flex-shrink-0"
                        style={{
                          transform: `translateX(${card.x}px)`,
                          marginLeft: index === 0 ? "0" : "-90px",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                          zIndex: index,
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <DraggableCard
                          card={card}
                          onRightClick={() => handleCardRightClick(card.id)}
                          enlarged={card.id === enlargedCardId}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DropZone>
          </div>
        </div>

        {/* Deck List Modal */}
        {showDeckList && (
          <DeckListModal
            deck={playerDeck}
            onClose={() => setShowDeckList(false)}
            onCardSelect={handleCardSelect}
          />
        )}

        {/* View Top Cards Modal */}
        {showViewTopCards && (
          <ViewTopCardsModal
            deck={playerDeck}
            onClose={() => setShowViewTopCards(false)}
            onCardsSelected={handleCardsSelected}
            onCardToHand={handleCardToHand}
            onCardToPlay={handleCardToPlay}
          />
        )}
      </div>
    </DndProvider>
  );
};
