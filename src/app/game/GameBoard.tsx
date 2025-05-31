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

interface DeckCard {
  card: CardData;
  count: number;
}

interface Deck {
  id: string;
  name: string;
  cards: { [key: string]: DeckCard };
}

interface PlayerState {
  deck: CardData[];
  hand: CardData[];
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
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.CARD,
    item: () => {
      // Ensure we have a unique ID for the card
      const cardWithId = {
        ...card,
        id: card.id || Math.random().toString(36).substr(2, 9),
      };
      return cardWithId;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      if (onRightClick) onRightClick();
    }, 500);
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTap) onTap();
  };

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
        transition: isDragging
          ? "none"
          : "transform 0.2s ease, opacity 0.2s ease",
        zIndex: enlarged ? 400 : isHovered ? 200 : isDragging ? 300 : "auto",
        width: isMobile() ? "80px" : "100px",
        height: isMobile() ? "112px" : "140px",
        touchAction: "none",
        cursor: "move",
        willChange: "transform, left, top",
      }}
      className={`${
        disableHover ? "" : "hover:scale-110"
      } transition-transform duration-200 ${
        enlarged ? "pointer-events-auto" : ""
      }`}
      title={card.name}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRightClick) onRightClick();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
  onDrop: (
    card: CardData,
    position: { x: number; y: number },
    targetZone: "play" | "hand"
  ) => void;
  children?: React.ReactNode;
  className?: string;
  isHand?: boolean;
  isOpponent?: boolean;
}> = ({ onDrop, children, className, isHand, isOpponent }) => {
  const dropZoneRef = React.useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop(() => ({
    accept: ItemType.CARD,
    drop: (item: CardData, monitor) => {
      const sourceOffset = monitor.getSourceClientOffset();
      if (sourceOffset && dropZoneRef.current) {
        const rect = dropZoneRef.current.getBoundingClientRect();
        const x = sourceOffset.x - rect.left;
        const y = sourceOffset.y - rect.top;
        onDrop(item, { x, y }, isHand ? "hand" : "play");
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

const DeckOptionsModal: React.FC<{
  onClose: () => void;
  onViewTopCards: () => void;
  isOpponent: boolean;
}> = ({ onClose, onViewTopCards, isOpponent }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg w-[90vw] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isOpponent ? "Oponente" : "Jugador"} - Opciones del Mazo
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            ✕
          </button>
        </div>
        <div className="space-y-2">
          <button
            onClick={onViewTopCards}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded text-left"
          >
            Ver Cartas Superiores
          </button>
        </div>
      </div>
    </div>
  );
};

const PreGameModal: React.FC<{
  decks: Deck[];
  onStart: (playerDeck: Deck, opponentDeck: Deck) => void;
}> = ({ decks, onStart }) => {
  const [selectedPlayerDeck, setSelectedPlayerDeck] = useState<Deck | null>(
    null
  );
  const [selectedOpponentDeck, setSelectedOpponentDeck] = useState<Deck | null>(
    null
  );

  const validDecks = decks.filter((deck) => deck && deck.id && deck.name);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[90vw] max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Selecciona los Mazos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Tu Mazo</h3>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {validDecks.map((deck, index) => (
                <button
                  key={`player-${deck.id || index}`}
                  onClick={() => setSelectedPlayerDeck(deck)}
                  className={`w-full p-3 rounded text-left transition-colors ${
                    selectedPlayerDeck?.id === deck.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {deck.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">
              Mazo del Oponente
            </h3>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {validDecks.map((deck, index) => (
                <button
                  key={`opponent-${deck.id || index}`}
                  onClick={() => setSelectedOpponentDeck(deck)}
                  className={`w-full p-3 rounded text-left transition-colors ${
                    selectedOpponentDeck?.id === deck.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {deck.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {validDecks.length === 0 && (
          <div className="text-center text-red-400 mt-4">
            No hay mazos disponibles. Por favor, crea un mazo primero.
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              if (selectedPlayerDeck && selectedOpponentDeck) {
                onStart(selectedPlayerDeck, selectedOpponentDeck);
              }
            }}
            disabled={
              !selectedPlayerDeck ||
              !selectedOpponentDeck ||
              validDecks.length === 0
            }
            className={`px-6 py-3 rounded text-white font-bold ${
              selectedPlayerDeck &&
              selectedOpponentDeck &&
              validDecks.length > 0
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameBoard: React.FC<{ initialDeck: CardData[] }> = ({
  initialDeck,
}) => {
  const [players, setPlayers] = useState<PlayerState[]>([
    { deck: [], hand: [] },
    { deck: [], hand: [] },
  ]);
  const [playArea, setPlayArea] = useState<CardData[]>([]);
  const [enlargedCardId, setEnlargedCardId] = useState<string | null>(null);
  const [showDeckOptions, setShowDeckOptions] = useState(false);
  const [deckOptionsIsOpponent, setDeckOptionsIsOpponent] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    try {
      const savedDecksStr = localStorage.getItem("savedDecks");
      if (savedDecksStr) {
        const parsedDecks = JSON.parse(savedDecksStr);
        if (Array.isArray(parsedDecks)) {
          const validDecks = parsedDecks.filter(
            (deck) =>
              deck &&
              typeof deck === "object" &&
              deck.id &&
              deck.name &&
              deck.cards
          );
          setAvailableDecks(validDecks);
        }
      }
    } catch (error) {
      console.error("Error loading saved decks:", error);
      setAvailableDecks([]);
    }
  }, []);

  useEffect(() => {
    if (initialDeck && initialDeck.length > 0) {
      const halfLength = Math.floor(initialDeck.length / 2);
      const player1Deck = shuffleDeck([...initialDeck.slice(0, halfLength)]);
      const player2Deck = shuffleDeck([...initialDeck.slice(halfLength)]);

      const player1Hand = player1Deck.slice(0, 7).map((card, index) => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9),
        x: index * 80,
      }));
      const player2Hand = player2Deck.slice(0, 7).map((card, index) => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9),
        x: index * 80,
      }));

      setPlayers([
        {
          deck: player1Deck.slice(7),
          hand: player1Hand,
        },
        {
          deck: player2Deck.slice(7),
          hand: player2Hand,
        },
      ]);
    }
  }, [initialDeck]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (enlargedCardId) {
        setEnlargedCardId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [enlargedCardId]);

  const handleGameStart = (playerDeck: Deck, opponentDeck: Deck) => {
    try {
      const playerDeckArray = Object.values(playerDeck.cards).flatMap(
        ({ card, count }) => Array(count).fill(card)
      ) as CardData[];
      const opponentDeckArray = Object.values(opponentDeck.cards).flatMap(
        ({ card, count }) => Array(count).fill(card)
      ) as CardData[];

      const shuffledPlayerDeck = shuffleDeck(playerDeckArray);
      const shuffledOpponentDeck = shuffleDeck(opponentDeckArray);

      // Initialize with empty hands and play area
      setPlayers([
        {
          deck: shuffledPlayerDeck,
          hand: [],
        },
        {
          deck: shuffledOpponentDeck,
          hand: [],
        },
      ]);
      setPlayArea([]);
      setEnlargedCardId(null);
      setGameStarted(true);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleCardTap = (card: CardData) => {
    setPlayArea((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, tapped: !c.tapped } : c))
    );
  };

  const handleCardDropToPlayArea = (
    card: CardData,
    position: { x: number; y: number },
    targetZone: "play" | "hand"
  ) => {
    // Moving from hand to play area
    if (targetZone === "play") {
      // Remove card from hand
      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          hand: player.hand.filter((c) => c.id !== card.id),
        }))
      );

      // Add to play area at exact drop position
      setPlayArea((prev) => {
        // If card is already in play area, update its position
        if (prev.some((c) => c.id === card.id)) {
          return prev.map((c) =>
            c.id === card.id
              ? {
                  ...c,
                  x: position.x,
                  y: position.y,
                }
              : c
          );
        }
        // Add new card to play area
        return [
          ...prev,
          {
            ...card,
            id: card.id || Math.random().toString(36).substr(2, 9),
            x: position.x,
            y: position.y,
          },
        ];
      });
    }
    // Moving from play area to hand or rearranging within hand
    else {
      // If card is in play area, remove it
      if (playArea.some((c) => c.id === card.id)) {
        setPlayArea((prev) => prev.filter((c) => c.id !== card.id));
      }

      // Update hand positions
      setPlayers((prev) =>
        prev.map((player) => {
          // Find which player's hand contains this card
          const cardInHand = player.hand.some((c) => c.id === card.id);
          if (!cardInHand) return player;

          const targetIndex = Math.floor(position.x / 80);
          const currentIndex = player.hand.findIndex((c) => c.id === card.id);
          
          // If card is already in this hand, just reorder it
          if (currentIndex !== -1) {
            const newHand = [...player.hand];
            const [movedCard] = newHand.splice(currentIndex, 1);
            newHand.splice(targetIndex, 0, movedCard);
            
            return {
              ...player,
              hand: newHand.map((c, i) => ({
                ...c,
                x: i * 80,
              })),
            };
          }
          
          // If card is not in this hand, don't modify it
          return player;
        })
      );
    }
  };

  const handleDeckClick = (isOpponent: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.button === 2) {
      setDeckOptionsIsOpponent(isOpponent);
      setShowDeckOptions(true);
    } else {
      const playerIndex = isOpponent ? 1 : 0;
      if (players[playerIndex].deck.length > 0) {
        const [drawnCard, ...remainingDeck] = players[playerIndex].deck;
        setPlayers((prev) =>
          prev.map((player, index) => {
            if (index === playerIndex) {
              const handPositions = player.hand.map((c) => c.x);
              let insertPosition = 0;
              for (let i = 0; i < handPositions.length; i++) {
                if (handPositions[i] !== i * 80) {
                  insertPosition = i;
                  break;
                }
                if (i === handPositions.length - 1) {
                  insertPosition = handPositions.length;
                }
              }

              const newHand = [...player.hand];
              newHand.splice(insertPosition, 0, {
                ...drawnCard,
                id: Math.random().toString(36).substr(2, 9),
                x: insertPosition * 80,
              });

              return {
                ...player,
                deck: remainingDeck,
                hand: newHand.map((c, i) => ({
                  ...c,
                  x: i * 80,
                })),
              };
            }
            return player;
          })
        );
      }
    }
  };

  const resetGame = () => {
    // Reset all game state
    setPlayers([
      { deck: [], hand: [] },
      { deck: [], hand: [] },
    ]);
    setPlayArea([]);
    setEnlargedCardId(null);
    setGameStarted(false);
    setShowDeckOptions(false);
    setDeckOptionsIsOpponent(false);
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
        {!gameStarted ? (
          <PreGameModal decks={availableDecks} onStart={handleGameStart} />
        ) : (
          <>
            <button
              onClick={resetGame}
              className="absolute top-2 right-4 bg-red-400 hover:bg-red-500 text-white text-sm px-4 rounded shadow-md transition z-50"
              title="Reset Match"
            >
              Reset Match
            </button>

            <div className="absolute top-4 right-4 z-10">
              <div
                className="relative w-24 h-32 cursor-pointer"
                onClick={(e) => handleDeckClick(true, e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeckClick(true, e);
                }}
              >
                <div className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold">
                    {players[1].deck.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-32 bg-gray-900/50 border-b border-gray-700 relative">
              <DropZone
                onDrop={handleCardDropToPlayArea}
                className="flex items-center justify-center"
                isHand={true}
                isOpponent={true}
              >
                {players[1].hand.map((card) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    onTap={() => {
                      const now = Date.now();
                      if (now - lastClickTime < 300) {
                        setEnlargedCardId(card.id || null);
                      }
                      setLastClickTime(now);
                    }}
                    onRightClick={() => {
                      const now = Date.now();
                      if (now - lastClickTime < 300) {
                        setEnlargedCardId(card.id || null);
                      }
                      setLastClickTime(now);
                    }}
                    enlarged={enlargedCardId === card.id}
                  />
                ))}
              </DropZone>
            </div>

            <div className="flex-1 relative">
              <DropZone onDrop={handleCardDropToPlayArea}>
                {playArea.map((card) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    onTap={() => handleCardTap(card)}
                    onRightClick={() => {
                      const now = Date.now();
                      if (now - lastClickTime < 300) {
                        setEnlargedCardId(card.id || null);
                      }
                      setLastClickTime(now);
                    }}
                    enlarged={enlargedCardId === card.id}
                  />
                ))}
              </DropZone>
            </div>

            <div className="h-32 bg-gray-900/50 border-t border-gray-700 relative">
              <DropZone
                onDrop={handleCardDropToPlayArea}
                className="flex items-center justify-center"
                isHand={true}
                isOpponent={false}
              >
                {players[0].hand.map((card) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    onTap={() => {
                      const now = Date.now();
                      if (now - lastClickTime < 300) {
                        setEnlargedCardId(card.id || null);
                      }
                      setLastClickTime(now);
                    }}
                    onRightClick={() => {
                      const now = Date.now();
                      if (now - lastClickTime < 300) {
                        setEnlargedCardId(card.id || null);
                      }
                      setLastClickTime(now);
                    }}
                    enlarged={enlargedCardId === card.id}
                  />
                ))}
              </DropZone>
            </div>

            <div className="absolute bottom-4 right-4">
              <div
                className="relative w-24 h-32 cursor-pointer"
                onClick={(e) => handleDeckClick(false, e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeckClick(false, e);
                }}
              >
                <div className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold">
                    {players[0].deck.length}
                  </span>
                </div>
              </div>
            </div>

            {showDeckOptions && (
              <DeckOptionsModal
                onClose={() => setShowDeckOptions(false)}
                onViewTopCards={() => {
                  setShowDeckOptions(false);
                }}
                isOpponent={deckOptionsIsOpponent}
              />
            )}
          </>
        )}
      </div>
    </DndProvider>
  );
};
