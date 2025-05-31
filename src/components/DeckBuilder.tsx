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
    const [opponentDeckId, setOpponentDeckId] = useState<string | null>(null);

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

      const types = [
        "Creature",
        "Instant",
        "Sorcery",
        "Artifact",
        "Enchantment",
        "Planeswalker",
        "Land",
      ];
      for (const type of types) {
        if (typeLine.includes(type)) return type;
      }
      return "Other";
    }, []);

    // Function to get type order for sorting
    const getTypeOrder = useCallback((type: string) => {
      const order: { [key: string]: number } = {
        Creature: 1,
        Instant: 2,
        Sorcery: 3,
        Artifact: 4,
        Enchantment: 5,
        Planeswalker: 6,
        Land: 7,
        Other: 8,
      };
      return order[type] || 9;
    }, []);

    // Memoize mana symbols function
    const getManaSymbols = useCallback((manaCost: string) => {
      if (!manaCost) return null;

      // Extract mana symbols using regex to match {X} pattern and filter out empty ones
      const symbols =
        manaCost
          .match(/\{([^}]+)\}/g)
          ?.map((s) => s.slice(1, -1))
          .filter((s) => s.trim()) || [];

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

    // Add card validation function
    const validateCard = useCallback(
      (card: Card | undefined, name: string): Card | null => {
        // Check if name is just a number
        if (/^\d+$/.test(name)) {
          console.warn(
            `Invalid card name format: "${name}". Card names should not be just numbers.`
          );
          return null;
        }

        if (!card) {
          console.warn(
            `Card data missing for "${name}". This card may need to be re-added to the deck.`
          );
          return null;
        }

        // Ensure required card properties exist
        if (!card.name || !card.type_line) {
          console.warn(
            `Invalid card data for "${name}": missing required properties (name: ${!!card.name}, type_line: ${!!card.type_line})`
          );
          return null;
        }

        // Validate card name matches the key
        if (card.name !== name) {
          console.warn(
            `Card name mismatch: key is "${name}" but card.name is "${card.name}"`
          );
          return null;
        }

        return card;
      },
      []
    );

    // Add function to clean up invalid cards
    const cleanupInvalidCards = useCallback(
      (deck: Deck) => {
        const validCards: { [key: string]: { card: Card; count: number } } = {};
        const invalidCards: string[] = [];

        Object.entries(deck.cards).forEach(([name, { card, count }]) => {
          if (validateCard(card, name)) {
            validCards[name] = { card, count };
          } else {
            invalidCards.push(name);
          }
        });

        if (invalidCards.length > 0) {
          console.warn(
            `Found ${invalidCards.length} invalid cards in deck "${deck.name}":`,
            invalidCards
          );
          setDecks((prev) =>
            prev.map((d) =>
              d.id === deck.id ? { ...d, cards: validCards } : d
            )
          );
        }

        return validCards;
      },
      [validateCard, setDecks]
    );

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
        // Validate card data
        const validCard = validateCard(card, name);
        if (!validCard) {
          return (
            <div className="text-sm flex justify-between rounded-sm items-center border-2 border-red-500 p-2">
              <span className="text-red-400">
                Error: Invalid card data for {name}
              </span>
              <Button
                size="sm"
                onClick={onRemove}
                className="bg-red-500/80 hover:bg-red-600"
              >
                Remove
              </Button>
            </div>
          );
        }

        const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

        const handleTouchStart = useCallback(
          (e: React.TouchEvent) => {
            e.stopPropagation();
            touchTimerRef.current = setTimeout(() => {
              setTouchedCard({ card: validCard, name });
            }, 300);
          },
          [validCard, name]
        );

        const handleTouchEnd = useCallback(() => {
          if (touchTimerRef.current) {
            clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
          }
        }, []);

        return (
          <div className="card-row">
            <div
              className="text-sm flex justify-between rounded-sm items-center border-2 border-gray-400 hover:border-blue-500 transition-colors cursor-pointer overflow-hidden h-12 relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <div className="absolute inset-0 w-full h-full overflow-hidden group-hover:border-blue-500 transition-all duration-300">
                <img
                  src={validCard.image_uris?.normal || "/default-card.jpg"}
                  alt={name}
                  className="w-full h-full object-cover opacity-40"
                  style={{ objectPosition: "center 20%" }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
              </div>

              <div className="relative z-10 flex justify-between items-center w-full p-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {validCard.mana_cost && getManaSymbols(validCard.mana_cost)}
                  </div>
                  <span className="font-medium text-white drop-shadow-lg">
                    {name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={onRemove}
                    className="bg-red-500/80 hover:bg-red-600 w-6 h-6 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-white text-2xl font-light tracking-wider drop-shadow-lg">
                    {count}
                  </span>
                  <Button
                    size="sm"
                    onClick={onAdd}
                    disabled={
                      count >= 4 &&
                      !validCard.type_line?.toLowerCase().includes("basic land")
                    }
                    className="bg-green-600/80 hover:bg-green-700 w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {touchedCard?.name === name && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-64 h-88 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                <img
                  src={validCard.image_uris?.normal || "/default-card.jpg"}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        );
      },
      [getCardBackgroundColor, getManaSymbols, touchedCard, validateCard]
    );

    // Update useEffect to clean up invalid cards when loading
    useEffect(() => {
      if (decks && decks.length > 0) {
        const hasInvalidDecks = decks.some((deck) => !deck.id);
        if (hasInvalidDecks) {
          const validatedDecks = decks.map(validateDeck);
          setDecks(validatedDecks);
        }

        // Clean up invalid cards in all decks
        decks.forEach((deck) => {
          cleanupInvalidCards(deck);
        });
      }
    }, []); // Only run once on mount

    // Update renderCardList to handle invalid cards
    const renderCardList = useCallback(
      (
        cards: { [key: string]: { card: Card; count: number } },
        isSideboard = false
      ) => {
        const validCards = Object.entries(cards)
          .sort(([, a], [, b]) => {
            // Safety check for card properties
            if (!a?.card || !b?.card) return 0;

            const typeA = getPrimaryType(a.card.type_line);
            const typeB = getPrimaryType(b.card.type_line);
            const typeOrderA = getTypeOrder(typeA);
            const typeOrderB = getTypeOrder(typeB);

            if (typeOrderA !== typeOrderB) {
              return typeOrderA - typeOrderB;
            }

            return (a.card.name || "").localeCompare(b.card.name || "");
          })
          .map(([name, { card, count }]) => {
            const validCard = validateCard(card, name);
            if (!validCard) {
              return (
                <div
                  key={`invalid-${name}`}
                  className="text-sm flex justify-between rounded-sm items-center border-2 border-red-500 p-2 bg-red-900/20"
                >
                  <div className="flex flex-col">
                    <span className="text-red-400 font-medium">
                      Invalid Card: {name}
                    </span>
                    <span className="text-red-300 text-xs">
                      This card needs to be re-added to the deck
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      isSideboard
                        ? removeCardFromSideboard(name)
                        : removeCardFromDeck(name)
                    }
                    className="bg-red-500/80 hover:bg-red-600"
                  >
                    Remove
                  </Button>
                </div>
              );
            }

            return (
              <CardRow
                key={`${isSideboard ? "sideboard" : "main"}-${validCard.id || name}`}
                name={name}
                card={validCard}
                count={count}
                onRemove={() =>
                  isSideboard
                    ? removeCardFromSideboard(name)
                    : removeCardFromDeck(name)
                }
                onAdd={() =>
                  isSideboard
                    ? addCardToSideboard(validCard)
                    : addCardToDeck(validCard)
                }
                isSideboard={isSideboard}
              />
            );
          });

        return validCards;
      },
      [
        getPrimaryType,
        getTypeOrder,
        validateCard,
        CardRow,
        removeCardFromDeck,
        removeCardFromSideboard,
        addCardToDeck,
        addCardToSideboard,
      ]
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

    // Add validation for deck data
    const validateDeck = useCallback((deck: Deck) => {
      if (!deck.id) {
        return {
          ...deck,
          id: crypto.randomUUID(),
        };
      }
      return deck;
    }, []);

    // Separate effect for initial deck validation
    useEffect(() => {
      if (decks && decks.length > 0) {
        const hasInvalidDecks = decks.some((deck) => !deck.id);
        if (hasInvalidDecks) {
          const validatedDecks = decks.map(validateDeck);
          setDecks(validatedDecks);
        }
      }
    }, []); // Only run once on mount

    // Separate effect for saving to localStorage
    useEffect(() => {
      if (decks && decks.length > 0) {
        localStorage.setItem("savedDecks", JSON.stringify(decks));
      }
    }, [decks]);

    // Update createNewDeck to ensure ID is set
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
      const opponentDeck = opponentDeckId
        ? decks.find((d) => d.id === opponentDeckId)
        : selectedDeck;

      if (!opponentDeck) return;

      // Convert decks to arrays of cards
      const playerDeckArray = Object.values(selectedDeck.cards).flatMap(
        ({ card, count }) => Array(count).fill(card)
      );
      const opponentDeckArray = Object.values(opponentDeck.cards).flatMap(
        ({ card, count }) => Array(count).fill(card)
      );

      // Create initial hands
      const initialPlayerHand = playerDeckArray
        .slice(0, 7)
        .map((card, index) => ({
          ...card,
          id: Math.random().toString(36).substr(2, 9),
          x: index * 80,
        }));
      const initialOpponentHand = opponentDeckArray
        .slice(0, 7)
        .map((card, index) => ({
          ...card,
          id: Math.random().toString(36).substr(2, 9),
          x: index * 80,
        }));

      const gameState = {
        players: [
          {
            deck: playerDeckArray.slice(7),
            hand: initialPlayerHand,
            life: 20,
            mana: {},
          },
          {
            deck: opponentDeckArray.slice(7),
            hand: initialOpponentHand,
            life: 20,
            mana: {},
          },
        ],
        gameState: {
          currentTurn: 0,
          currentPhase: "untap",
        },
        timestamp: Date.now(),
      };
      localStorage.setItem("gameState", JSON.stringify(gameState));
      router.push("/game");
    }, [selectedDeck, opponentDeckId, decks, router]);

    const handleExportDeck = useCallback(() => {
      if (!selectedDeck) return;

      // Create main deck list
      const mainDeckList = Object.entries(selectedDeck.cards)
        .sort(([, a], [, b]) => {
          const typeA = getPrimaryType(a.card.type_line);
          const typeB = getPrimaryType(b.card.type_line);
          const typeOrderA = getTypeOrder(typeA);
          const typeOrderB = getTypeOrder(typeB);

          if (typeOrderA !== typeOrderB) {
            return typeOrderA - typeOrderB;
          }
          return a.card.name.localeCompare(b.card.name);
        })
        .map(([name, { count }]) => `${count} ${name}`)
        .join("\n");

      // Create sideboard list if it exists
      const sideboardList =
        selectedDeck.sideboard && Object.keys(selectedDeck.sideboard).length > 0
          ? "\n\nSideboard\n" +
            Object.entries(selectedDeck.sideboard)
              .sort(([, a], [, b]) => {
                const typeA = getPrimaryType(a.card.type_line);
                const typeB = getPrimaryType(b.card.type_line);
                const typeOrderA = getTypeOrder(typeA);
                const typeOrderB = getTypeOrder(typeB);

                if (typeOrderA !== typeOrderB) {
                  return typeOrderA - typeOrderB;
                }
                return a.card.name.localeCompare(b.card.name);
              })
              .map(([name, { count }]) => `${count} ${name}`)
              .join("\n")
          : "";

      // Combine both lists
      const fullDeckList = `${selectedDeck.name}\n\n${mainDeckList}${sideboardList}`;

      // Copy to clipboard
      navigator.clipboard
        .writeText(fullDeckList)
        .then(() => {
          // Optional: You could add a toast notification here to confirm the copy
          alert("Deck list copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy deck list:", err);
          alert("Failed to copy deck list to clipboard");
        });
    }, [selectedDeck, getPrimaryType, getTypeOrder]);

    if (!mounted) return null;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Deck Selection and Management */}
          <div className="w-full md:w-1/4">
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Mazos</h2>

              {/* New Deck Creation */}
              <div className="mb-4">
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Nuevo mazo..."
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded mb-2"
                />
                <button
                  onClick={createNewDeck}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Crear Mazo
                </button>
              </div>

              {/* Deck List */}
              <div className="space-y-2">
                {decks.map((deck, index) => {
                  // Ensure deck has an ID, use index as fallback
                  const deckId = deck.id || `deck-${index}`;
                  return (
                    <div
                      key={deckId}
                      className={`p-2 rounded cursor-pointer ${
                        selectedDeckId === deckId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                      onClick={() => setSelectedDeckId(deckId)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{deck.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDeck(deckId);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Deck Contents and Actions */}
          <div className="w-full md:w-3/4">
            {selectedDeck ? (
              <div className="space-y-6">
                {/* Deck Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedDeck.name}
                  </h2>
                  <div className="flex gap-4">
                    <button
                      onClick={generateSampleHand}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Generar Mano de Prueba
                    </button>
                    <button
                      onClick={handleChallenge}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Jugar Partida
                    </button>
                  </div>
                </div>

                {/* Deck Selection Section */}
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Player Deck Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        Tu Mazo
                      </h3>
                      <select
                        value={selectedDeckId || ""}
                        onChange={(e) =>
                          setSelectedDeckId(e.target.value || null)
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                      >
                        <option value="">Selecciona tu mazo</option>
                        {decks.map((deck, index) => {
                          const deckId = deck.id || `deck-${index}`;
                          return (
                            <option
                              key={`select-player-${deckId}`}
                              value={deckId}
                            >
                              {deck.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Opponent Deck Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        Mazo del Oponente
                      </h3>
                      <select
                        value={opponentDeckId || ""}
                        onChange={(e) =>
                          setOpponentDeckId(e.target.value || null)
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                      >
                        <option value="">Mismo mazo</option>
                        {decks.map((deck, index) => {
                          const deckId = deck.id || `deck-${index}`;
                          return (
                            <option
                              key={`select-opponent-${deckId}`}
                              value={deckId}
                            >
                              {deck.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleChallenge}
                    disabled={!selectedDeckId}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Iniciar Partida
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-auto">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {selectedDeck.name}
                        </h2>
                        <p className="text-gray-400">
                          {totalCards} cartas en el mazo
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      {renderCardList(selectedDeck.cards)}
                    </div>

                    {selectedDeck.sideboard &&
                      Object.keys(selectedDeck.sideboard).length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold mb-4">
                            Sideboard
                          </h3>
                          <div className="grid gap-1">
                            {renderCardList(selectedDeck.sideboard, true)}
                          </div>
                        </div>
                      )}

                    <div className="mt-6">
                      <Button
                        onClick={handleExportDeck}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        Copiar en portapapeles
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xl">
                ⬅ Selecciona o crea un mazo para comenzar
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

DeckBuilder.displayName = "DeckBuilder";

export default DeckBuilder;
