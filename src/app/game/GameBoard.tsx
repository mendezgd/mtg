"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { generateUUID } from "@/lib/utils";
import { GameCard, DeckCardEntry, Deck } from "@/types/card";
import { ImageService } from "@/lib/image-utils";

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

const CARD_WIDTH = isMobile() ? 64 : 90;
const CARD_HEIGHT = isMobile() ? 90 : 126;
const HAND_STEP = isMobile() ? 68 : 72; // horizontal step between cards in hand

const cardStyle = {
  width: `${CARD_WIDTH}px`,
  height: `${CARD_HEIGHT}px`,
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
      }, 600);
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
  onPreview?: (card: CardData) => void;
}> = ({ card, onTap, enlarged, onRightClick, disableHover, onPreview }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { handleTouchStart, handleTouchEnd, handleTouchMove } = useTouchEvents(
    () => {
      if (onPreview) onPreview(card);
    }
  );
  const lastCardTapRef = useRef<number>(0);
  const suppressClickUntilRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef<boolean>(false);

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
    const now = Date.now();
    if (now < suppressClickUntilRef.current) return;
    // Desktop left-click: only tap/untap, never open preview
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
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
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
        if (onPreview) onPreview(card);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        suppressClickUntilRef.current = Date.now() + 350;
        if (onTap) onTap(); // solo rota la carta, no hace preview
      }}
      onTouchStart={(e) => {
        touchStartTimeRef.current = Date.now();
        const t = e.touches[0];
        touchStartPosRef.current = { x: t.clientX, y: t.clientY };
        touchMovedRef.current = false;
        handleTouchStart(e);
      }}
      onTouchEnd={(e) => {
        const elapsed = Date.now() - touchStartTimeRef.current;
        handleTouchEnd();
        // Si NO se movió y NO fue long-press, es un tap: debe rotar la carta
        if (!touchMovedRef.current && elapsed < 600) {
          if (onTap) onTap();
        }
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        const start = touchStartPosRef.current;
        if (start) {
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.hypot(dx, dy) > 12) {
            touchMovedRef.current = true;
          }
        }
        handleTouchMove();
      }}
    >
      <img
        src={ImageService.processImageUrl(
          card.image_uris?.normal || "/images/default-card.jpg"
        )}
        alt={card.name}
        className="w-full h-full object-cover rounded"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/default-card.jpg";
        }}
      />
    </div>
  );
};

type TargetZone = "play" | "hand" | "graveyard";

const DropZone: React.FC<{
  onDrop: (
    card: CardData,
    position: { x: number; y: number },
    targetZone: TargetZone,
    targetOwner?: "player" | "opponent"
  ) => void;
  children?: React.ReactNode;
  className?: string;
  isHand?: boolean;
  isOpponent?: boolean;
  zoneType?: TargetZone;
  owner?: "player" | "opponent";
}> = ({ onDrop, children, className, isHand, isOpponent, zoneType, owner }) => {
  const dropZoneRef = React.useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop(() => ({
    accept: ItemType.CARD,
    drop: (item: CardData, monitor) => {
      const sourceOffset = monitor.getSourceClientOffset();
      if (sourceOffset && dropZoneRef.current) {
        const rect = dropZoneRef.current.getBoundingClientRect();
        const x = sourceOffset.x - rect.left;
        const y = sourceOffset.y - rect.top;
        const adjustedX = isHand
          ? x + (dropZoneRef.current?.scrollLeft || 0)
          : x;
        onDrop(
          item,
          { x: adjustedX, y },
          zoneType ? zoneType : isHand ? "hand" : "play",
          zoneType
            ? owner
            : isHand
              ? isOpponent
                ? "opponent"
                : "player"
              : undefined
        );
        // After a hand drop, auto-scroll to the end so the appended card is visible
        if (isHand && dropZoneRef.current) {
          setTimeout(() => {
            if (dropZoneRef.current) {
              dropZoneRef.current.scrollLeft = dropZoneRef.current.scrollWidth;
            }
          }, 0);
        }
      }
    },
  }));

  return (
    <div
      ref={(node) => {
        drop(node);
        dropZoneRef.current = node;
      }}
      className={`relative p-2 md:p-6 border-2 border-gray-600 rounded-lg bg-gray-900/50 
                h-full w-full ${
                  isHand
                    ? "overflow-x-auto overflow-y-hidden touch-pan-x"
                    : "overflow-y-auto touch-none"
                } ${className || ""}`}
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

          <div className="flex gap-2">
            <button
              onClick={() => onViewCards(cardCount)}
              className="flex-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Ver Cartas
            </button>
            <button
              onClick={onClose}
              className="flex-1 p-3 bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              Cancelar
            </button>
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
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
                  <img
                    src={ImageService.processImageUrl(
                      card.image_uris?.normal || "/images/default-card.svg"
                    )}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/default-card.svg";
                    }}
                  />
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
                <img
                  src={ImageService.processImageUrl(
                    card.image_uris?.normal || "/images/default-card.svg"
                  )}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/default-card.svg";
                  }}
                />
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
  const [playerGraveyard, setPlayerGraveyard] = useState<CardData[]>([]);
  const [opponentGraveyard, setOpponentGraveyard] = useState<CardData[]>([]);
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
  const [showGraveyard, setShowGraveyard] = useState<{
    owner: "player" | "opponent";
    open: boolean;
  } | null>(null);
  const [deckTouchTimer, setDeckTouchTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const touchContextRef = useRef<{
    owner: "player" | "opponent";
    longPress: boolean;
  } | null>(null);
  const deckRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
    player: null,
    opponent: null,
  });
  const [lifeTotals, setLifeTotals] = useState<{
    player: number;
    opponent: number;
  }>({
    player: 20,
    opponent: 20,
  });
  const [lifeAnim, setLifeAnim] = useState<{
    player: boolean;
    opponent: boolean;
  }>({
    player: false,
    opponent: false,
  });
  const lastTapRef = useRef<{ player: number; opponent: number }>({
    player: 0,
    opponent: 0,
  });
  const deckClickSuppressUntil = useRef<{ player: number; opponent: number }>({
    player: 0,
    opponent: 0,
  });
  const [previewCard, setPreviewCard] = useState<CardData | null>(null);

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
        x: index * HAND_STEP,
      }));
      const player2Hand = player2Deck.slice(0, 7).map((card, index) => ({
        ...card,
        id: generateUUID(),
        x: index * HAND_STEP,
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
    targetZone: TargetZone,
    targetOwner?: "player" | "opponent"
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
    else if (targetZone === "hand") {
      // Always remove from play area first (unconditionally safeguard against duplicates)
      setPlayArea((prev) => prev.filter((c) => c.id !== card.id));

      const ownerIndex = targetOwner === "opponent" ? 1 : 0;

      setPlayers((prev) =>
        prev.map((player, idx) => {
          // Remove duplicates from every hand
          const cleaned = player.hand.filter((c) => c.id !== card.id);

          if (idx !== ownerIndex) {
            return { ...player, hand: cleaned };
          }

          // Always append at end of target owner's hand
          const newHand = [
            ...cleaned,
            { ...card, id: card.id || generateUUID() },
          ];

          return {
            ...player,
            hand: newHand.map((c, i) => ({ ...c, x: i * HAND_STEP, y: 0 })),
          };
        })
      );
    } else if (targetZone === "graveyard") {
      // Remove from hand and play area
      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          hand: player.hand.filter((c) => c.id !== card.id),
        }))
      );
      setPlayArea((prev) => prev.filter((c) => c.id !== card.id));

      // Add to appropriate graveyard
      if (targetOwner === "player") {
        setPlayerGraveyard((prev) => [...prev, { ...card }]);
      } else if (targetOwner === "opponent") {
        setOpponentGraveyard((prev) => [...prev, { ...card }]);
      }
    }
  };

  const handleDeckClick = (isOpponent: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.button === 2) {
      setDeckManagementIsOpponent(isOpponent);
      setShowDeckManagement(true);
    } else {
      const now = Date.now();
      const key = isOpponent ? "opponent" : "player";
      // Suppress click if recently handled by touch-end draw
      if (now < deckClickSuppressUntil.current[key]) {
        return;
      }
      const last = lastTapRef.current[key];
      // Si es desktop y doble click, no hacer nada
      if (!isMobile() && now - last < 300) {
        lastTapRef.current[key] = 0;
        return;
      }
      lastTapRef.current[key] = now;
      const playerIndex = isOpponent ? 1 : 0;
      if (players[playerIndex].deck.length > 0) {
        const [drawnCard, ...remainingDeck] = players[playerIndex].deck;
        setPlayers((prev) =>
          prev.map((player, index) => {
            if (index === playerIndex) {
              const handPositions = player.hand.map((c) => c.x);
              let insertPosition = 0;
              for (let i = 0; i < handPositions.length; i++) {
                if (handPositions[i] !== i * HAND_STEP) {
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
                x: insertPosition * HAND_STEP,
              });

              return {
                ...player,
                deck: remainingDeck,
                hand: newHand.map((c, i) => ({
                  ...c,
                  x: i * HAND_STEP,
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
    setPlayerGraveyard([]);
    setOpponentGraveyard([]);
    setEnlargedCardId(null);
    setGameStarted(false);
    setShowDeckOptions(false);
    setDeckOptionsIsOpponent(false);
    setLifeTotals({ player: 20, opponent: 20 });
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

    setPlayArea((prev) => {
      const newCards = cards.map((card) => ({
        ...card,
        x: Math.random() * 400,
        y: Math.random() * 200,
      }));
      return [...prev, ...newCards];
    });

    setShowCardSelection(false); // Cierra el modal de selección de cartas
    setShowDeckManagement(false); // Cierra el modal de manipulación de deck
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
              x: newHand.length * HAND_STEP,
            });
          });

          return {
            ...player,
            deck: player.deck.filter(
              (c) => !cards.some((selected) => selected.id === c.id)
            ),
            hand: newHand.map((c, i) => ({
              ...c,
              x: i * HAND_STEP,
            })),
          };
        }
        return player;
      })
    );
    setShowCardSelection(false);
    setShowDeckManagement(false); // <-- cierra el modal
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
    setShowCardSelection(false);
    setShowDeckManagement(false); // <-- cierra el modal
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
    setShowCardSelection(false);
    setShowDeckManagement(false); // <-- cierra el modal
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
    setShowCardSelection(false);
    setShowDeckManagement(false); // <-- cierra el modal
  };

  const handleDeckTouch = (isOpponent: boolean, e: React.TouchEvent) => {
    const element = deckRefs.current[isOpponent ? "opponent" : "player"];
    if (!element) return;

    // Start long-press timer (~600ms) to open management
    touchContextRef.current = {
      owner: isOpponent ? "opponent" : "player",
      longPress: false,
    };
    const timer = setTimeout(() => {
      touchContextRef.current = {
        owner: isOpponent ? "opponent" : "player",
        longPress: true,
      };
      setDeckManagementIsOpponent(isOpponent);
      setShowDeckManagement(true);
    }, 600);
    setDeckTouchTimer(timer);
  };

  const handleDeckTouchEnd = () => {
    if (deckTouchTimer) {
      clearTimeout(deckTouchTimer);
      setDeckTouchTimer(null);
      // If it wasn't a long press, treat as a tap: draw 1 card
      if (touchContextRef.current && !touchContextRef.current.longPress) {
        const isOpp = touchContextRef.current.owner === "opponent";
        const playerIndex = isOpp ? 1 : 0;
        if (players[playerIndex].deck.length > 0) {
          const [drawnCard, ...remainingDeck] = players[playerIndex].deck;
          setPlayers((prev) =>
            prev.map((player, index) => {
              if (index === playerIndex) {
                const newHand = [
                  ...player.hand,
                  { ...drawnCard, x: player.hand.length * HAND_STEP },
                ];
                return {
                  ...player,
                  deck: remainingDeck,
                  hand: newHand.map((c, i) => ({ ...c, x: i * HAND_STEP })),
                };
              }
              return player;
            })
          );
          // Suppress the next click event within 350ms to avoid double draw
          const key = isOpp ? "opponent" : "player";
          deckClickSuppressUntil.current[key] = Date.now() + 350;
        }
      }
    }
    touchContextRef.current = null;
  };

  const handleDeckTouchMove = () => {
    if (deckTouchTimer) {
      clearTimeout(deckTouchTimer);
      setDeckTouchTimer(null);
    }
    touchContextRef.current = null;
  };

  const changeLife = (owner: "player" | "opponent", delta: number) => {
    setLifeTotals((prev) => ({
      player: owner === "player" ? prev.player + delta : prev.player,
      opponent: owner === "opponent" ? prev.opponent + delta : prev.opponent,
    }));
    setLifeAnim((prev) => ({ ...prev, [owner]: true }));
    setTimeout(() => {
      setLifeAnim((prev) => ({ ...prev, [owner]: false }));
    }, 250);
  };

  // no global double-click listener (desktop preview = right-click, mobile = long-press)

  const resolveDeckBackImage = (_owner: "player" | "opponent") => {
    return ImageService.processImageUrl("/images/backcard.webp");
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
        touchSlop: 10,
        ignoreContextMenu: true,
      }}
    >
      <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-gray-800 text-white relative">
        {!gameStarted ? (
          <PreGameModal decks={availableDecks} onStart={handleGameStart} />
        ) : (
          <>
            <button
              onClick={resetGame}
              className="absolute top-2 right-4 bg-red-700 hover:bg-red-500 text-white text-sm px-4 rounded shadow-md transition z-50"
              title="Reset Match"
            >
              Reset Match
            </button>

            {/* Opponent's vertical stack: life, deck, graveyard */}
            <div className="absolute top-36 left-4 z-20 flex flex-col items-center gap-1">
              {/* Opponent Life Counter (compact) */}
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-900/70 border border-gray-700 shadow-sm select-none transition-transform"
                style={{
                  transform: lifeAnim.opponent ? "scale(1.05)" : "scale(1)",
                }}
              >
                <button
                  className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 active:scale-95 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLife("opponent", -1);
                  }}
                  aria-label="Opponent life -1"
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-white text-sm font-semibold">
                  {lifeTotals.opponent}
                </span>
                <button
                  className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 active:scale-95 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLife("opponent", 1);
                  }}
                  aria-label="Opponent life +1"
                >
                  +
                </button>
              </div>

              {/* Opponent deck (wider/shorter) */}
              <div
                ref={(el) => {
                  deckRefs.current.opponent = el;
                }}
                className={`group relative ${isMobile() ? "w-[64px] h-[90px]" : "w-[90px] h-[126px]"} cursor-pointer rounded-lg overflow-hidden border border-gray-600 bg-gray-800`}
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
                <img
                  src={resolveDeckBackImage("opponent")}
                  alt="Deck back"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-gray-500/50 transition" />
                <span className="absolute bottom-1 right-1 text-white text-xs font-bold bg-black/60 px-1 py-0.5 rounded">
                  {players[1].deck.length}
                </span>
              </div>

              {/* Opponent Graveyard */}
              <DropZone
                onDrop={handleCardDropToPlayArea}
                className={`flex items-center justify-center ${isMobile() ? "w-12 h-18" : "w-16 h-24"}`}
                zoneType="graveyard"
                owner="opponent"
              >
                <div
                  className="w-full h-full bg-gray-700/70 rounded-lg border border-gray-600 flex items-center justify-center relative cursor-pointer hover:border-gray-500 transition"
                  onClick={() =>
                    setShowGraveyard({ owner: "opponent", open: true })
                  }
                >
                  <span className="text-xl">🪦</span>
                  <span className="absolute bottom-1 left-14 md:left-8 text-xs bg-black/60 px-1 rounded">
                    {opponentGraveyard.length}
                  </span>
                </div>
              </DropZone>
            </div>

            <div
              className={`${isMobile() ? "h-32" : "h-32"} bg-gray-900/50 border-b border-gray-700 relative`}
            >
              <DropZone
                onDrop={handleCardDropToPlayArea}
                className="flex items-center gap-2"
                isHand={true}
                isOpponent={true}
                zoneType="hand"
                owner="opponent"
              >
                <div className="relative min-w-full">
                  {players[1].hand.map((card) => (
                    <DraggableCard
                      key={card.id}
                      card={card}
                      onTap={() => handleCardTap(card)}
                      enlarged={enlargedCardId === card.id}
                      onPreview={(c) => setPreviewCard(c)}
                    />
                  ))}
                </div>
              </DropZone>
            </div>

            <div className="flex-1 relative">
              <DropZone onDrop={handleCardDropToPlayArea}>
                {playArea.map((card) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    onTap={() => handleCardTap(card)}
                    enlarged={enlargedCardId === card.id}
                    onPreview={(c) => setPreviewCard(c)}
                  />
                ))}
              </DropZone>
            </div>

            <div
              className={`${isMobile() ? "h-32" : "h-32"} bg-gray-900/50 border-t border-gray-700 relative`}
            >
              <DropZone
                onDrop={handleCardDropToPlayArea}
                className="flex items-center gap-2"
                isHand={true}
                isOpponent={false}
                zoneType="hand"
                owner="player"
              >
                <div className="relative min-w-full">
                  {players[0].hand.map((card) => (
                    <DraggableCard
                      key={card.id}
                      card={card}
                      onTap={() => handleCardTap(card)}
                      enlarged={enlargedCardId === card.id}
                      onPreview={(c) => setPreviewCard(c)}
                    />
                  ))}
                </div>
              </DropZone>
            </div>

            {/* Player's vertical stack: life, deck, graveyard */}
            <div className="absolute bottom-36 left-4 z-20 flex flex-col items-center gap-2">
              {/* Player Life Counter (compact) */}
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-900/70 border border-gray-700 shadow-sm select-none transition-transform"
                style={{
                  transform: lifeAnim.player ? "scale(1.05)" : "scale(1)",
                }}
              >
                <button
                  className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 active:scale-95 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLife("player", -1);
                  }}
                  aria-label="Player life -1"
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-white text-sm font-semibold">
                  {lifeTotals.player}
                </span>
                <button
                  className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 active:scale-95 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLife("player", 1);
                  }}
                  aria-label="Player life +1"
                >
                  +
                </button>
              </div>

              {/* Player deck (wider/shorter) */}
              <div
                ref={(el) => {
                  deckRefs.current.player = el;
                }}
                className={`group relative ${isMobile() ? "w-[64px] h-[90px]" : "w-[90px] h-[126px]"} cursor-pointer rounded-lg overflow-hidden border border-gray-600 bg-gray-800`}
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
                <img
                  src={resolveDeckBackImage("player")}
                  alt="Deck back"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-gray-500/50 transition" />
                <span className="absolute bottom-1 right-1 text-white text-xs font-bold bg-black/60 px-1 py-0.5 rounded">
                  {players[0].deck.length}
                </span>
              </div>

              {/* Player Graveyard */}
              <DropZone
                onDrop={handleCardDropToPlayArea}
                className={`flex items-center justify-center ${isMobile() ? "w-12 h-18" : "w-16 h-24"}`}
                zoneType="graveyard"
                owner="player"
              >
                <div
                  className="w-full h-full bg-gray-700/70 rounded-lg border border-gray-600 flex items-center justify-center relative cursor-pointer"
                  onClick={() =>
                    setShowGraveyard({ owner: "player", open: true })
                  }
                >
                  <span className="text-xl">🪦</span>
                  <span className="absolute bottom-1 left-14 md:left-8 text-xs bg-black/60 px-1 rounded">
                    {playerGraveyard.length}
                  </span>
                </div>
              </DropZone>
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

            {previewCard && (
              <div
                className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center"
                onClick={() => setPreviewCard(null)}
              >
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="absolute -top-3 -right-3 z-10 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center border border-gray-600 hover:bg-gray-700"
                    onClick={() => setPreviewCard(null)}
                    aria-label="Cerrar"
                  >
                    ❌
                  </button>
                  <img
                    src={ImageService.processImageUrl(
                      previewCard.image_uris?.large ||
                        previewCard.image_uris?.normal ||
                        "/images/default-card.svg"
                    )}
                    alt={previewCard.name}
                    className="w-[min(85vw,520px)] h-auto max-h-[80vh] object-contain rounded shadow-2xl"
                  />
                </div>
              </div>
            )}

            {showGraveyard?.open && (
              <CardSelectionModal
                onClose={() => setShowGraveyard(null)}
                cards={
                  showGraveyard.owner === "player"
                    ? playerGraveyard
                    : opponentGraveyard
                }
                onPutInPlay={(cards) => {
                  handlePutInPlay(cards);
                  if (showGraveyard.owner === "player") {
                    setPlayerGraveyard((prev) =>
                      prev.filter((c) => !cards.some((s) => s.id === c.id))
                    );
                  } else {
                    setOpponentGraveyard((prev) =>
                      prev.filter((c) => !cards.some((s) => s.id === c.id))
                    );
                  }
                }}
                onPutInHand={(cards) => {
                  setDeckManagementIsOpponent(
                    showGraveyard.owner === "opponent"
                  );
                  handlePutInHand(cards);
                  if (showGraveyard.owner === "player") {
                    setPlayerGraveyard((prev) =>
                      prev.filter((c) => !cards.some((s) => s.id === c.id))
                    );
                  } else {
                    setOpponentGraveyard((prev) =>
                      prev.filter((c) => !cards.some((s) => s.id === c.id))
                    );
                  }
                }}
                onShuffle={() => {
                  // no-op for graveyard modal
                }}
                onPutToBottom={() => {
                  // no-op for graveyard modal
                }}
                onArrange={() => {
                  // no-op for graveyard modal
                }}
              />
            )}
          </>
        )}
      </div>
    </DndProvider>
  );
};
