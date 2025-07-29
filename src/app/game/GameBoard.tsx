"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { generateUUID } from "@/lib/utils";
import { GameCard, DeckCardEntry, Deck } from "@/types/card";

// Use GameCard instead of CardData
type CardData = GameCard;

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
  width: isMobile() ? "60px" : "100px",
  height: isMobile() ? "84px" : "140px",
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

const useTouchEvents = (onRightClick?: () => void) => {
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const timer = setTimeout(() => {
        if (onRightClick) onRightClick();
      }, 300);
      setTouchTimer(timer);
    },
    [onRightClick]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  }, [touchTimer]);

  const handleTouchMove = useCallback(() => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  }, [touchTimer]);

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
  };
};

const DraggableCard: React.FC<{
  card: CardData;
  onTap?: () => void;
  enlarged?: boolean;
  onRightClick?: () => void;
  disableHover?: boolean;
}> = ({ card, onTap, enlarged, onRightClick, disableHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { handleTouchStart, handleTouchEnd, handleTouchMove } =
    useTouchEvents(onRightClick);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.CARD,
    item: () => {
      const cardWithId = {
        ...card,
        id: card.id || generateUUID(),
      };
      return cardWithId;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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
      onTouchMove={handleTouchMove}
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

const DeckManagementModal: React.FC<{
  onClose: () => void;
  isOpponent: boolean;
  deckSize: number;
  onViewCards: (count: number) => void;
}> = ({ onClose, isOpponent, deckSize, onViewCards }) => {
  const [cardCount, setCardCount] = useState(5);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[90vw] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isOpponent ? "Oponente" : "Jugador"} - Ver Cartas
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-white">Número de cartas a ver:</label>
            <input
              type="number"
              min="1"
              max={deckSize}
              value={cardCount}
              onChange={(e) =>
                setCardCount(
                  Math.min(deckSize, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              className="w-20 px-2 py-1 bg-gray-700 text-white rounded"
            />
          </div>

          <button
            onClick={() => onViewCards(cardCount)}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Ver Cartas
          </button>
        </div>
      </div>
    </div>
  );
};

const CardSelectionModal: React.FC<{
  onClose: () => void;
  cards: CardData[];
  onPutInPlay: (cards: CardData[]) => void;
  onPutInHand: (cards: CardData[]) => void;
  onShuffle: () => void;
  onPutToBottom: (cards: CardData[]) => void;
  onArrange: (cards: CardData[]) => void;
}> = ({
  onClose,
  cards,
  onPutInPlay,
  onPutInHand,
  onShuffle,
  onPutToBottom,
  onArrange,
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [showActionModal, setShowActionModal] = useState(false);
  const [isArranging, setIsArranging] = useState(false);
  const [arrangedCards, setArrangedCards] = useState<CardData[]>(cards);
  const [draggedCard, setDraggedCard] = useState<CardData | null>(null);

  const toggleCardSelection = (cardId: string) => {
    if (isArranging) return;
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleAction = (
    action: "play" | "hand" | "shuffle" | "bottom" | "arrange"
  ) => {
    const selectedCardsList = cards.filter((card) =>
      selectedCards.has(card.id!)
    );

    switch (action) {
      case "play":
        onPutInPlay(selectedCardsList);
        break;
      case "hand":
        onPutInHand(selectedCardsList);
        break;
      case "shuffle":
        onShuffle();
        break;
      case "bottom":
        onPutToBottom(selectedCardsList);
        break;
      case "arrange":
        setIsArranging(true);
        setArrangedCards(selectedCardsList);
        break;
    }
    setShowActionModal(false);
  };

  const handleDragStart = (card: CardData) => {
    if (!isArranging) return;
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent, targetCard: CardData) => {
    e.preventDefault();
    if (!isArranging || !draggedCard || draggedCard.id === targetCard.id)
      return;

    const draggedIndex = arrangedCards.findIndex(
      (c) => c.id === draggedCard.id
    );
    const targetIndex = arrangedCards.findIndex((c) => c.id === targetCard.id);

    const newArrangedCards = [...arrangedCards];
    const [removed] = newArrangedCards.splice(draggedIndex, 1);
    newArrangedCards.splice(targetIndex, 0, removed);

    setArrangedCards(newArrangedCards);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleConfirmArrange = () => {
    onArrange(arrangedCards);
    setIsArranging(false);
    onClose();
  };

  const handleCancelArrange = () => {
    setIsArranging(false);
    setArrangedCards(cards);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[90vw] max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isArranging ? "Reordenar Cartas" : "Seleccionar Cartas"}
          </h2>
          <div className="flex gap-2">
            {!isArranging && (
              <button
                onClick={() => setShowActionModal(true)}
                disabled={selectedCards.size === 0}
                className={`px-3 py-1 rounded ${
                  selectedCards.size > 0
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-500 cursor-not-allowed"
                } text-white`}
              >
                Acciones ({selectedCards.size})
              </button>
            )}
            {isArranging && (
              <>
                <button
                  onClick={handleConfirmArrange}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  Confirmar Orden
                </button>
                <button
                  onClick={handleCancelArrange}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Cancelar
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(isArranging ? arrangedCards : cards).map((card) => (
              <div
                key={card.id}
                onClick={() => toggleCardSelection(card.id!)}
                draggable={isArranging}
                onDragStart={() => handleDragStart(card)}
                onDragOver={(e) => handleDragOver(e, card)}
                onDragEnd={handleDragEnd}
                className={`relative cursor-pointer transition-transform ${
                  selectedCards.has(card.id!) ? "scale-105" : ""
                } ${isArranging ? "cursor-move" : ""}`}
              >
                <div
                  className={`relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden ${
                    selectedCards.has(card.id!) ? "ring-2 ring-blue-500" : ""
                  } ${draggedCard?.id === card.id ? "opacity-50" : ""}`}
                >
                  {card.image_uris?.normal ? (
                    <img
                      src={card.image_uris.normal}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm bg-gray-700">
                      {card.name}
                    </div>
                  )}
                  {isArranging && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {arrangedCards.findIndex((c) => c.id === card.id) + 1}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showActionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-gray-800 p-6 rounded-lg w-[90vw] max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Acciones</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAction("play")}
                  className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Poner en Juego
                </button>
                <button
                  onClick={() => handleAction("hand")}
                  className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  Poner en Mano
                </button>
                <button
                  onClick={() => handleAction("shuffle")}
                  className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded"
                >
                  Barajar Mazo
                </button>
                <button
                  onClick={() => handleAction("bottom")}
                  className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                >
                  Poner al Fondo
                </button>
                <button
                  onClick={() => handleAction("arrange")}
                  className="w-full p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                >
                  Ordenar Cartas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewTopCardsModal: React.FC<{
  onClose: () => void;
  cards: CardData[];
  isOpponent: boolean;
  onPutInPlay: (card: CardData) => void;
  onPutInHand: (card: CardData) => void;
  onArrange: (cards: CardData[]) => void;
}> = ({ onClose, cards, isOpponent, onPutInPlay, onPutInHand, onArrange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [arrangedCards, setArrangedCards] = useState<CardData[]>(cards);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(arrangedCards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setArrangedCards(items);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[90vw] max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isOpponent ? "Oponente" : "Jugador"} - Cartas Superiores
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => onArrange(arrangedCards)}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Confirmar Orden
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {arrangedCards.map((card, index) => (
            <div key={card.id} className="relative group">
              <div className="relative w-full aspect-[2.5/3.5] bg-gray-700 rounded-lg overflow-hidden">
                {card.image_uris?.normal ? (
                  <img
                    src={card.image_uris.normal}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm">
                    {card.name}
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {index + 1}
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => onPutInPlay(card)}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                >
                  Jugar
                </button>
                <button
                  onClick={() => onPutInHand(card)}
                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                >
                  Mano
                </button>
              </div>
            </div>
          ))}
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
  const [showViewTopCards, setShowViewTopCards] = useState(false);
  const [topCards, setTopCards] = useState<CardData[]>([]);
  const [viewTopCardsIsOpponent, setViewTopCardsIsOpponent] = useState(false);
  const [showDeckManagement, setShowDeckManagement] = useState(false);
  const [deckManagementIsOpponent, setDeckManagementIsOpponent] =
    useState(false);
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [selectedCards, setSelectedCards] = useState<CardData[]>([]);
  const [deckTouchTimer, setDeckTouchTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const deckRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
    player: null,
    opponent: null,
  });

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
        id: generateUUID(),
        x: index * 80,
      }));
      const player2Hand = player2Deck.slice(0, 7).map((card, index) => ({
        ...card,
        id: generateUUID(),
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

      // Add unique IDs to all cards
      const addUniqueIds = (cards: CardData[]): CardData[] => {
        return cards.map((card) => ({
          ...card,
          id: `${card.name}-${generateUUID()}`,
        }));
      };

      const shuffledPlayerDeck = shuffleDeck(addUniqueIds(playerDeckArray));
      const shuffledOpponentDeck = shuffleDeck(addUniqueIds(opponentDeckArray));

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
            id: card.id || generateUUID(),
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
      setDeckManagementIsOpponent(isOpponent);
      setShowDeckManagement(true);
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

  const handleViewTopCards = (isOpponent: boolean) => {
    const playerIndex = isOpponent ? 1 : 0;
    const topFiveCards = players[playerIndex].deck.slice(0, 5);
    setTopCards(topFiveCards);
    setViewTopCardsIsOpponent(isOpponent);
    setShowViewTopCards(true);
    setShowDeckManagement(false);
  };

  const handleViewCards = (count: number) => {
    const playerIndex = deckManagementIsOpponent ? 1 : 0;
    const cards = players[playerIndex].deck.slice(0, count);
    setSelectedCards(cards);
    setShowCardSelection(true);
    setShowDeckManagement(false);
  };

  const handlePutInPlay = (cards: CardData[]) => {
    const playerIndex = deckManagementIsOpponent ? 1 : 0;
    // Remove cards from deck
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === playerIndex) {
          return {
            ...player,
            deck: player.deck.filter(
              (c) => !cards.some((selected) => selected.id === c.id)
            ),
          };
        }
        return player;
      })
    );

    // Add to play area
    setPlayArea((prev) => {
      const newCards = cards.map((card) => ({
        ...card,
        x: Math.random() * 400,
        y: Math.random() * 200,
      }));
      return [...prev, ...newCards];
    });
  };

  const handlePutInHand = (cards: CardData[]) => {
    const playerIndex = deckManagementIsOpponent ? 1 : 0;
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === playerIndex) {
          const newHand = [...player.hand];
          cards.forEach((card) => {
            newHand.push({
              ...card,
              x: newHand.length * 80,
            });
          });

          return {
            ...player,
            deck: player.deck.filter(
              (c) => !cards.some((selected) => selected.id === c.id)
            ),
            hand: newHand.map((c, i) => ({
              ...c,
              x: i * 80,
            })),
          };
        }
        return player;
      })
    );
  };

  const handleShuffle = () => {
    const playerIndex = deckManagementIsOpponent ? 1 : 0;
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === playerIndex) {
          return {
            ...player,
            deck: shuffleDeck([...player.deck]),
          };
        }
        return player;
      })
    );
  };

  const handleArrange = (cards: CardData[]) => {
    const playerIndex = deckManagementIsOpponent ? 1 : 0;
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === playerIndex) {
          // Get the remaining cards that weren't in the arranged set
          const remainingDeck = player.deck.filter(
            (c) => !cards.some((arranged) => arranged.id === c.id)
          );
          // Return the arranged cards followed by the remaining deck
          return {
            ...player,
            deck: [...cards, ...remainingDeck],
          };
        }
        return player;
      })
    );
  };

  const handlePutToBottom = (selectedCards: CardData[]) => {
    const playerIndex = deckManagementIsOpponent ? 1 : 0;
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index === playerIndex) {
          // Remove selected cards from their current positions
          const remainingDeck = player.deck.filter(
            (c) => !selectedCards.some((selected) => selected.id === c.id)
          );

          // Add selected cards to the bottom
          return {
            ...player,
            deck: [...remainingDeck, ...selectedCards],
          };
        }
        return player;
      })
    );
  };

  const handleDeckTouch = (isOpponent: boolean, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = deckRefs.current[isOpponent ? "opponent" : "player"];

    if (!element) return;

    // Start a timer for 3 seconds
    const timer = setTimeout(() => {
      setDeckManagementIsOpponent(isOpponent);
      setShowDeckManagement(true);
    }, 3000);

    setDeckTouchTimer(timer);
  };

  const handleDeckTouchEnd = () => {
    if (deckTouchTimer) {
      clearTimeout(deckTouchTimer);
      setDeckTouchTimer(null);
    }
  };

  const handleDeckTouchMove = () => {
    if (deckTouchTimer) {
      clearTimeout(deckTouchTimer);
      setDeckTouchTimer(null);
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

            {/* Opponent's deck - positioned at top left */}
            <div className="absolute top-44 left-4 z-10">
              <div
                ref={(el) => {
                  deckRefs.current.opponent = el;
                }}
                className={`relative ${isMobile() ? "w-16 h-24" : "w-24 h-32"} cursor-pointer`}
                onClick={(e) => handleDeckClick(true, e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeckClick(true, e);
                }}
                onTouchStart={(e) => handleDeckTouch(true, e)}
                onTouchEnd={handleDeckTouchEnd}
                onTouchMove={handleDeckTouchMove}
                style={{ touchAction: "none" }}
              >
                <div
                  className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage: "url('../assets/pox.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <span className="text-white font-bold bg-black/50 px-2 py-1 rounded">
                    {players[1].deck.length}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`${isMobile() ? "h-40" : "h-32"} bg-gray-900/50 border-b border-gray-700 relative`}
            >
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

            <div
              className={`${isMobile() ? "h-40" : "h-32"} bg-gray-900/50 border-t border-gray-700 relative`}
            >
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

            <div className="absolute bottom-44 left-4">
              <div
                ref={(el) => {
                  deckRefs.current.player = el;
                }}
                className={`relative ${isMobile() ? "w-16 h-24" : "w-24 h-32"} cursor-pointer`}
                onClick={(e) => handleDeckClick(false, e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDeckClick(false, e);
                }}
                onTouchStart={(e) => handleDeckTouch(false, e)}
                onTouchEnd={handleDeckTouchEnd}
                onTouchMove={handleDeckTouchMove}
                style={{ touchAction: "none" }}
              >
                <div
                  className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage: "url('../assets/pox.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <span className="text-white font-bold bg-black/50 px-2 py-1 rounded">
                    {players[0].deck.length}
                  </span>
                </div>
              </div>
            </div>

            {showDeckOptions && (
              <DeckOptionsModal
                onClose={() => setShowDeckOptions(false)}
                onViewTopCards={() => handleViewTopCards(deckOptionsIsOpponent)}
                isOpponent={deckOptionsIsOpponent}
              />
            )}

            {showDeckManagement && (
              <DeckManagementModal
                onClose={() => setShowDeckManagement(false)}
                isOpponent={deckManagementIsOpponent}
                deckSize={players[deckManagementIsOpponent ? 1 : 0].deck.length}
                onViewCards={handleViewCards}
              />
            )}

            {showViewTopCards && (
              <ViewTopCardsModal
                onClose={() => setShowViewTopCards(false)}
                cards={topCards}
                isOpponent={viewTopCardsIsOpponent}
                onPutInPlay={(card) => {
                  handlePutInPlay([card]);
                }}
                onPutInHand={(card) => {
                  handlePutInHand([card]);
                }}
                onArrange={handleArrange}
              />
            )}

            {showCardSelection && (
              <CardSelectionModal
                onClose={() => setShowCardSelection(false)}
                cards={selectedCards}
                onPutInPlay={handlePutInPlay}
                onPutInHand={handlePutInHand}
                onShuffle={handleShuffle}
                onPutToBottom={handlePutToBottom}
                onArrange={handleArrange}
              />
            )}
          </>
        )}
      </div>
    </DndProvider>
  );
};
