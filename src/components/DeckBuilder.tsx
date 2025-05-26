"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Card } from "@/components/CardList";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const ScrollArea = dynamic(
  () =>
    import("@/components/ui/scroll-area").then((mod) => ({
      default: mod.ScrollArea,
      ScrollBar: mod.ScrollBar,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
) as any;

interface Deck {
  id: string;
  name: string;
  cards: { [cardName: string]: { card: Card; count: number } };
  sideboard?: { [cardName: string]: { card: Card; count: number } };
}

interface DeckBuilderProps {
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  selectedDeckId: string | null;
  setSelectedDeckId: React.Dispatch<React.SetStateAction<string | null>>;
  removeCardFromDeck: (cardName: string) => void;
  addCardToDeck: (card: Card) => void;
  handleDeleteDeck: (deckId: string) => void;
  handleRenameDeck: (deckId: string, newName: string) => void;
  removeCardFromSideboard: (cardName: string) => void;
  addCardToSideboard: (card: Card) => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = React.memo(
  ({
    decks,
    setDecks,
    selectedDeckId,
    setSelectedDeckId,
    removeCardFromDeck,
    addCardToDeck,
    handleDeleteDeck,
    handleRenameDeck,
    removeCardFromSideboard,
    addCardToSideboard,
  }) => {
    const [sampleHand, setSampleHand] = useState<Card[]>([]);
    const [newDeckName, setNewDeckName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [touchedCard, setTouchedCard] = useState<{
      card: Card;
      name: string;
    } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
    const [tempDeckName, setTempDeckName] = useState("");

    const router = useRouter();

    // Memoize selected deck to prevent unnecessary recalculations
    const selectedDeck = useMemo(
      () => decks.find((deck) => deck.id === selectedDeckId),
      [decks, selectedDeckId]
    );

    // Memoize total cards calculation
    const totalCards = useMemo(
      () =>
        selectedDeck
          ? Object.values(selectedDeck.cards).reduce(
              (acc, { count }) => acc + count,
              0
            )
          : 0,
      [selectedDeck]
    );

    // Memoize card background color function
    const getCardBackgroundColor = useCallback(
      (colors: string[] | undefined) => {
        if (!colors || colors.length === 0) return "bg-gray-800"; // Colorless cards

        if (colors.length === 1) {
          switch (colors[0]) {
            case "W":
              return "bg-white";
            case "U":
              return "bg-blue-600";
            case "B":
              return "bg-gray-900";
            case "R":
              return "bg-red-600";
            case "G":
              return "bg-green-600";
            default:
              return "bg-gray-800";
          }
        }

        // Multicolor cards
        return "bg-gradient-to-r from-yellow-600 via-purple-600 to-yellow-600";
      },
      []
    );

    // Function to get primary type of a card
    const getPrimaryType = useCallback((typeLine: string | undefined) => {
      if (!typeLine) return "Other";
      
      const types = ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Land"];
      for (const type of types) {
        if (typeLine.includes(type)) return type;
      }
      return "Other";
    }, []);

    // Function to get type order for sorting
    const getTypeOrder = useCallback((type: string) => {
      const order: { [key: string]: number } = {
        "Creature": 1,
        "Instant": 2,
        "Sorcery": 3,
        "Artifact": 4,
        "Enchantment": 5,
        "Planeswalker": 6,
        "Land": 7,
        "Other": 8
      };
      return order[type] || 9;
    }, []);

    // Memoize mana symbols function
    const getManaSymbols = useCallback((manaCost: string) => {
      if (!manaCost) return null;

      const symbols = manaCost.replace(/[{}]/g, "").split("");
      return (
        <div className="flex gap-1">
          {symbols.map((symbol, idx) => {
            const bgColor =
              symbol === "W"
                ? "bg-white"
                : symbol === "U"
                ? "bg-blue-500"
                : symbol === "B"
                ? "bg-gray-900"
                : symbol === "R"
                ? "bg-red-500"
                : symbol === "G"
                ? "bg-green-500"
                : symbol === "C"
                ? "bg-gray-400"
                : "bg-gray-600";

            const textColor =
              symbol === "B" || !isNaN(Number(symbol))
                ? "text-white"
                : "text-black";

            return (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${bgColor} ${textColor} border border-black/20 shadow-lg`}
              >
                {symbol}
              </div>
            );
          })}
        </div>
      );
    }, []);

    // Add effect to handle touch events outside cards
    useEffect(() => {
      const handleTouchOutside = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        // Check if the touch is outside any card row
        if (!target.closest(".card-row")) {
          setTouchedCard(null);
        }
      };

      document.addEventListener("touchstart", handleTouchOutside);
      return () => {
        document.removeEventListener("touchstart", handleTouchOutside);
      };
    }, []);

    // Memoize card row component
    const CardRow = useCallback(
      ({
        name,
        card,
        count,
        onRemove,
        onAdd,
        isSideboard = false,
      }: {
        name: string;
        card: Card;
        count: number;
        onRemove: () => void;
        onAdd: () => void;
        isSideboard?: boolean;
      }) => {
        const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

        const handleTouchStart = useCallback(
          (e: React.TouchEvent) => {
            e.stopPropagation();
            touchTimerRef.current = setTimeout(() => {
              setTouchedCard({ card, name });
            }, 300); // 300ms hold to show preview
          },
          [card, name]
        );

        const handleTouchEnd = useCallback(() => {
          if (touchTimerRef.current) {
            clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
          }
        }, []);

        return (
          // ===== CARD ROW CONTAINER =====
          <div className="card-row">
            {/* ===== MAIN CARD ROW ELEMENT =====
              Contains the card art background and all interactive elements */}
            <div
              className="text-sm flex justify-between rounded-sm items-center border-2 border-gray-400 hover:border-blue-500 transition-colors cursor-pointer overflow-hidden h-12 relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {/* ===== CARD ART BACKGROUND ZONE =====
                Creates a full background effect with the card art as the main focus */}
              <div className="absolute inset-0 w-full h-full overflow-hidden group-hover:border-blue-500 transition-all duration-300">
                {/* ===== CARD IMAGE =====
                  The actual card image with positioning and loading optimization */}
                <img
                  src={card.image_uris?.normal || "/default-card.jpg"}
                  alt={name}
                  className="w-full h-full object-cover opacity-40"
                  style={{ objectPosition: "center 20%" }}
                  loading="lazy"
                />
                {/* ===== GRADIENT OVERLAY =====
                  Adds a very subtle gradient for minimal text interference */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
              </div>

              {/* ===== CONTENT ZONE =====
                Contains all the interactive elements and card information */}
              <div className="relative z-10 flex justify-between items-center w-full p-2">
                {/* ===== LEFT SIDE CONTENT =====
                  Contains mana cost, color indicators, and card name */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {/* ===== MANA COST DISPLAY ===== */}
                    {card.mana_cost && getManaSymbols(card.mana_cost)}
                    {/* ===== COLOR INDICATORS ===== */}
                    {card.colors && card.colors.length > 0 && (
                      <div className="flex gap-1">
                        {card.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className={`w-5 h-5 rounded-full ${
                              color === "W"
                                ? "bg-white"
                                : color === "U"
                                ? "bg-blue-500"
                                : color === "B"
                                ? "bg-gray-900"
                                : color === "R"
                                ? "bg-red-500"
                                : "bg-green-500"
                            } border border-black/20 shadow-lg`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ===== CARD NAME ===== */}
                  <span className="font-medium text-white drop-shadow-lg">
                    {name}
                  </span>
                </div>

                {/* ===== RIGHT SIDE CONTROLS =====
                  Contains the quantity controls (+ and - buttons) */}
                <div className="flex items-center gap-2">
                  {/* ===== REMOVE BUTTON ===== */}
                  <Button
                    size="sm"
                    onClick={onRemove}
                    className="bg-red-500/80 hover:bg-red-600 w-6 h-6 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    -
                  </Button>
                  {/* ===== CARD COUNT ===== */}
                  <span className="w-8 text-center text-white text-2xl font-light tracking-wider drop-shadow-lg">
                    {count}
                  </span>
                  {/* ===== ADD BUTTON ===== */}
                  <Button
                    size="sm"
                    onClick={onAdd}
                    disabled={
                      count >= 4 &&
                      !card.type_line?.toLowerCase().includes("basic land")
                    }
                    className="bg-green-600/80 hover:bg-green-700 w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* ===== CARD PREVIEW MODAL =====
              Shows the full card image when touched */}
            {touchedCard?.name === name && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-64 h-96 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                <img
                  src={card.image_uris?.normal || "/default-card.jpg"}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        );
      },
      [getCardBackgroundColor, getManaSymbols, touchedCard]
    );

    const handleStartEditing = useCallback(
      (deckId: string, currentName: string) => {
        setEditingDeckId(deckId);
        setTempDeckName(currentName);
      },
      []
    );

    const handleSaveRename = useCallback(
      (deckId: string) => {
        if (tempDeckName.trim()) {
          handleRenameDeck(deckId, tempDeckName.trim());
        }
        setEditingDeckId(null);
      },
      [tempDeckName, handleRenameDeck]
    );

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (decks && decks.length > 0) {
        const formattedDecks = decks.map((deck) => ({
          name: deck.name,
          cards: Object.values(deck.cards).flatMap(({ card, count }) =>
            Array(count).fill(card)
          ),
        }));
        localStorage.setItem("savedDecks", JSON.stringify(formattedDecks));
      }
    }, [decks]);

    const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      setIsDragging(true);
      setStartX(clientX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    }, []);

    const duringDrag = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const x = clientX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
      },
      [isDragging, startX, scrollLeft]
    );

    const endDrag = useCallback(() => {
      setIsDragging(false);
    }, []);

    const createNewDeck = useCallback(() => {
      if (newDeckName.trim()) {
        const newDeck: Deck = {
          id: crypto.randomUUID(),
          name: newDeckName,
          cards: {},
        };
        setDecks((prev) => [...prev, newDeck]);
        setSelectedDeckId(newDeck.id);
        setNewDeckName("");
      }
    }, [newDeckName, setDecks, setSelectedDeckId]);

    const generateSampleHand = useCallback(() => {
      if (!selectedDeck) return;

      const cardPool: Card[] = [];
      Object.values(selectedDeck.cards).forEach(({ card, count }) => {
        for (let i = 0; i < count; i++) cardPool.push(card);
      });

      if (cardPool.length < 7) {
        alert("El mazo necesita al menos 7 cartas");
        return;
      }

      const shuffled = [...cardPool].sort(() => Math.random() - 0.5);
      setSampleHand(shuffled.slice(0, 7));
    }, [selectedDeck]);

    const handleChallenge = useCallback(() => {
      if (!selectedDeck) return;
      localStorage.setItem("selectedDeck", JSON.stringify(selectedDeck));
      router.push("/game");
    }, [selectedDeck, router]);

    if (!mounted) return null;

    return (
      <div className="flex flex-col h-full rounded-sm text-gray-100">
        <div className="p-4 border-b border-gray-700">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Constructor de Mazos</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tus Mazos</h3>
              {mounted && (
                <ScrollArea className="h-40 mb-4">
                  {decks.map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => setSelectedDeckId(deck.id)}
                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors group ${
                        selectedDeckId === deck.id
                          ? "bg-sky-800 hover:bg-sky-700"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          {editingDeckId === deck.id ? (
                            <input
                              type="text"
                              value={tempDeckName}
                              onChange={(e) => setTempDeckName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleSaveRename(deck.id);
                                if (e.key === "Escape") setEditingDeckId(null);
                              }}
                              onBlur={() => {
                                if (tempDeckName.trim() !== deck.name) {
                                  handleSaveRename(deck.id);
                                } else {
                                  setEditingDeckId(null);
                                }
                              }}
                              autoFocus
                              className="bg-gray-700 text-white focus:outline-none w-full px-2 py-1 rounded"
                            />
                          ) : (
                            <span>{deck.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {Object.values(deck.cards).reduce(
                              (acc, { count }) => acc + count,
                              0
                            )}{" "}
                            cartas
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:bg-blue-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditing(deck.id, deck.name);
                              }}
                              aria-label="Renombrar mazo"
                              title="Renombrar mazo"
                            >
                              ✏️
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:bg-red-500/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDeck(deck.id);
                              }}
                              aria-label="Eliminar mazo"
                              title="Eliminar mazo"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Nuevo Mazo</h3>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Nombre del mazo"
                  className="bg-zinc-800 rounded-lg p-3 flex-grow"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createNewDeck()}
                />
                <Button
                  onClick={createNewDeck}
                  className="bg-sky-600 hover:bg-sky-700 text-white h-auto"
                >
                  Crear
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {selectedDeck ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedDeck.name}</h2>
                  <p className="text-gray-400">
                    {totalCards} cartas en el mazo
                  </p>
                </div>
                <Button
                  onClick={generateSampleHand}
                  disabled={totalCards === 0}
                  className="bg-purple-700 hover:bg-purple-500 text-white"
                >
                  Generar Mano de Prueba
                </Button>
              </div>

              <Button
                onClick={handleChallenge}
                className="bg-green-600 hover:bg-green-700 text-white w-full mb-6"
              >
                Test in EzquizoMod
              </Button>

              {sampleHand.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Mano de Prueba</h3>
                  <div
                    ref={scrollContainerRef}
                    className={`w-full max-h-40 overflow-x-auto cursor-grab ${
                      isDragging ? "cursor-grabbing" : ""
                    }`}
                    onMouseDown={startDrag}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    onTouchStart={startDrag}
                    onTouchMove={duringDrag}
                    onTouchEnd={endDrag}
                  >
                    <div className="flex gap-2 pb-4 w-full">
                      {sampleHand.map((card, index) => (
                        <div
                          key={index}
                          className="relative group flex-shrink-0 select-none"
                        >
                          <div className="w-24 h-36 overflow-hidden group-hover:border-blue-500 transition-all duration-300">
                            <img
                              src={
                                card.image_uris?.normal || "/default-card.jpg"
                              }
                              alt={card.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              draggable="false"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-1">
                {Object.entries(selectedDeck.cards)
                  .sort(([, a], [, b]) => {
                    const typeA = getPrimaryType(a.card.type_line);
                    const typeB = getPrimaryType(b.card.type_line);
                    const typeOrderA = getTypeOrder(typeA);
                    const typeOrderB = getTypeOrder(typeB);
                    
                    if (typeOrderA !== typeOrderB) {
                      return typeOrderA - typeOrderB;
                    }
                    
                    // If same type, sort by name
                    return a.card.name.localeCompare(b.card.name);
                  })
                  .map(([name, { card, count }]) => (
                    <CardRow
                      key={name}
                      name={name}
                      card={card}
                      count={count}
                      onRemove={() => removeCardFromDeck(name)}
                      onAdd={() => addCardToDeck(card)}
                    />
                  ))}
              </div>

              {selectedDeck.sideboard &&
                Object.keys(selectedDeck.sideboard).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Sideboard</h3>
                    <div className="grid gap-1">
                      {Object.entries(selectedDeck.sideboard)
                        .sort(([, a], [, b]) => {
                          const typeA = getPrimaryType(a.card.type_line);
                          const typeB = getPrimaryType(b.card.type_line);
                          const typeOrderA = getTypeOrder(typeA);
                          const typeOrderB = getTypeOrder(typeB);
                          
                          if (typeOrderA !== typeOrderB) {
                            return typeOrderA - typeOrderB;
                          }
                          
                          // If same type, sort by name
                          return a.card.name.localeCompare(b.card.name);
                        })
                        .map(([name, { card, count }]) => (
                          <CardRow
                            key={name}
                            name={name}
                            card={card}
                            count={count}
                            onRemove={() => removeCardFromSideboard(name)}
                            onAdd={() => addCardToSideboard(card)}
                            isSideboard
                          />
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xl">
              ⬅ Selecciona o crea un mazo para comenzar
            </div>
          )}
        </div>
      </div>
    );
  }
);

DeckBuilder.displayName = "DeckBuilder";

export default DeckBuilder;
