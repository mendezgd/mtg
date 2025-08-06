"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { DeckCard, Deck } from "@/types/card";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import SafeImage from "@/components/ui/safe-image";

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

interface DeckBuilderProps {
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  selectedDeckId: string | null;
  setSelectedDeckId: React.Dispatch<React.SetStateAction<string | null>>;
  removeCardFromDeck: (cardName: string) => void;
  addCardToDeck: (card: DeckCard) => void;
  handleDeleteDeck: (deckId: string) => void;
  handleRenameDeck: (deckId: string, newName: string) => void;
  removeCardFromSideboard: (cardName: string) => void;
  addCardToSideboard: (card: DeckCard) => void;
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
    const [sampleHand, setSampleHand] = useState<DeckCard[]>([]);
    const [newDeckName, setNewDeckName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [touchedCard, setTouchedCard] = useState<{
      card: DeckCard;
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
        if (!colors || colors.length === 0)
          return "bg-gray-800 border-gray-700"; // Colorless cards

        if (colors.length === 1) {
          switch (colors[0]) {
            case "W":
              return "bg-gray-800 border-gray-700 text-gray-200"; // White cards with dark background
            case "U":
              return "bg-gray-800 border-gray-700 text-gray-200";
            case "B":
              return "bg-gray-900 border-gray-800 text-gray-100";
            case "R":
              return "bg-gray-800 border-gray-700 text-gray-200";
            case "G":
              return "bg-gray-800 border-gray-700 text-gray-200";
            default:
              return "bg-gray-800 border-gray-700";
          }
        }

        // Multicolor cards
        return "bg-gray-800 border-gray-700 text-gray-200";
      },
      []
    );

    // Function to get card text color based on background
    const getCardTextColor = useCallback((colors: string[] | undefined) => {
      if (!colors || colors.length === 0) return "text-gray-300";

      if (colors.length === 1) {
        switch (colors[0]) {
          case "W":
            return "text-gray-200";
          case "U":
            return "text-gray-200";
          case "B":
            return "text-gray-100";
          case "R":
            return "text-gray-200";
          case "G":
            return "text-gray-200";
          default:
            return "text-gray-300";
        }
      }

      return "text-gray-200";
    }, []);

    // Function to get card border color
    const getCardBorderColor = useCallback((colors: string[] | undefined) => {
      if (!colors || colors.length === 0) return "border-gray-700";

      if (colors.length === 1) {
        switch (colors[0]) {
          case "W":
            return "border-gray-600";
          case "U":
            return "border-gray-600";
          case "B":
            return "border-gray-800";
          case "R":
            return "border-gray-600";
          case "G":
            return "border-gray-600";
          default:
            return "border-gray-700";
        }
      }

      return "border-gray-600";
    }, []);

    // Function to get primary type of a card
    const getPrimaryType = useCallback((typeLine: string | undefined) => {
      if (!typeLine) return "Other";

      const types = [
        "Creature",
        "Instant",
        "Sorcery",
        "Enchantment",
        "Artifact",
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
      const order = {
        Land: 1,
        Creature: 2,
        Instant: 3,
        Sorcery: 4,
        Enchantment: 5,
        Artifact: 6,
        Planeswalker: 7,
        Other: 8,
      };
      return order[type as keyof typeof order] || 8;
    }, []);

    // Function to get mana symbols
    const getManaSymbols = useCallback((manaCost: string | undefined) => {
      if (!manaCost) return [];

      const symbols = manaCost.match(/\{[^}]+\}/g) || [];
      return symbols.map((symbol) => symbol.slice(1, -1));
    }, []);

    // Validate card function
    const validateCard = useCallback(
      (card: any, name: string): DeckCard | null => {
        if (!card || !card.name) return null;

        return {
          id: card.id || generateUUID(),
          name: card.name,
          image_uris: card.image_uris,
          type_line: card.type_line,
          oracle_text: card.oracle_text,
          mana_cost: card.mana_cost,
          colors: card.colors || [],
          legalities: card.legalities || { premodern: "legal" },
        };
      },
      []
    );

    // Cleanup invalid cards function
    const cleanupInvalidCards = useCallback(
      (deck: Deck) => {
        const validCards: { [key: string]: { card: DeckCard; count: number } } =
          {};

        Object.entries(deck.cards).forEach(([name, entry]) => {
          const validCard = validateCard(entry.card, name);
          if (validCard) {
            validCards[name] = { card: validCard, count: entry.count };
          }
        });

        if (Object.keys(validCards).length !== Object.keys(deck.cards).length) {
          setDecks((prev) =>
            prev.map((d) =>
              d.id === deck.id ? { ...d, cards: validCards } : d
            )
          );
        }
      },
      [validateCard, setDecks]
    );

    // CardRow component with stable references
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
        card: DeckCard;
        count: number;
        onRemove: (e?: React.MouseEvent) => void;
        onAdd: (e?: React.MouseEvent) => void;
        isSideboard?: boolean;
      }) => {
        const validCard = validateCard(card, name);
        if (!validCard) {
          return (
            <div className="text-sm flex justify-between rounded-lg items-center border-2 border-red-500 p-3 bg-red-900/20 hover:bg-red-900/30 transition-colors">
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
                onClick={onRemove}
                className="bg-red-500/80 hover:bg-red-600"
              >
                Remove
              </Button>
            </div>
          );
        }

        const bgColor = getCardBackgroundColor(validCard.colors);
        const textColor = getCardTextColor(validCard.colors);
        const borderColor = getCardBorderColor(validCard.colors);

        return (
          <div
            className={`text-sm flex justify-between rounded-md items-center p-2 border ${bgColor} ${borderColor} hover:shadow-sm transition-colors`}
            role="listitem"
            aria-label={`${name} - ${count} copias`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    className={`text-left flex-1 min-w-0 hover:opacity-80 transition-opacity ${textColor}`}
                    aria-label={`Ver detalles de ${name}`}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTouchedCard({ card: validCard, name });
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTouchedCard(null);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTouchedCard({ card: validCard, name });
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTouchedCard(null);
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTouchedCard(null);
                    }}
                  >
                    <div className="font-medium truncate">{name}</div>
                    <div className={`text-xs opacity-70 truncate ${textColor}`}>
                      {validCard.type_line}
                    </div>
                    {validCard.mana_cost && (
                      <div className="flex gap-1 mt-1">
                        {getManaSymbols(validCard.mana_cost).map(
                          (symbol, index) => (
                            <span
                              key={index}
                              className="text-xs font-mono bg-gray-700 px-1 rounded text-gray-300"
                              title={`Símbolo de maná: ${symbol}`}
                            >
                              {symbol}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-0" side="right">
                  <div className="space-y-3 p-4">
                    <SafeImage
                      src={validCard.image_uris?.normal || "/images/default-card.jpg"}
                      alt={`Imagen de ${name}`}
                      className="w-full rounded shadow-sm"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="font-semibold text-lg">{name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {validCard.type_line}
                      </p>
                      {validCard.oracle_text && (
                        <p className="text-sm leading-relaxed">
                          {validCard.oracle_text}
                        </p>
                      )}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium min-w-[2rem] text-center ${textColor}`}
              >
                {count}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={onRemove}
                  className="w-6 h-6 p-0 text-xs bg-red-600 hover:bg-red-700 text-white"
                  aria-label={`Remover una copia de ${name}`}
                >
                  -
                </Button>
                <Button
                  size="sm"
                  onClick={onAdd}
                  className="w-6 h-6 p-0 text-xs bg-green-600 hover:bg-green-700 text-white"
                  aria-label={`Agregar una copia de ${name}`}
                >
                  +
                </Button>
              </div>
            </div>

            {touchedCard?.name === name && (
              <div className="mobile-card-preview fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-64 h-88 rounded-lg overflow-hidden border border-gray-300 shadow-lg">
                <SafeImage
                  src={validCard.image_uris?.normal || "/images/default-card.jpg"}
                  alt={`Vista previa de ${name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        );
      },
      [
        getCardBackgroundColor,
        getCardTextColor,
        getCardBorderColor,
        getManaSymbols,
        touchedCard,
        validateCard,
      ]
    );

    // Update renderCardList to handle invalid cards with stable references
    const renderCardList = useCallback(
      (
        cards: { [key: string]: { card: DeckCard; count: number } },
        isSideboard = false
      ) => {
        const validCards = Object.entries(cards)
          .sort(([, a], [, b]) => {
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
          id: generateUUID(),
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

    // Update createNewDeck to ensure ID is set
    const createNewDeck = useCallback(() => {
      if (newDeckName.trim()) {
        const newDeck: Deck = {
          id: generateUUID(),
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

      const cardPool: DeckCard[] = [];
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
      if (!selectedDeck || !opponentDeckId) return;

      const opponentDeck = decks.find((deck) => deck.id === opponentDeckId);
      if (!opponentDeck) return;

      const playerDeckArray: DeckCard[] = [];
      const opponentDeckArray: DeckCard[] = [];

      Object.values(selectedDeck.cards).forEach(({ card, count }) => {
        for (let i = 0; i < count; i++) {
          playerDeckArray.push({ ...card, id: generateUUID() });
        }
      });

      Object.values(opponentDeck.cards).forEach(({ card, count }) => {
        for (let i = 0; i < count; i++) {
          opponentDeckArray.push({ ...card, id: generateUUID() });
        }
      });

      const initialPlayerHand = playerDeckArray
        .slice(0, 7)
        .map((card, index) => ({
          ...card,
          id: generateUUID(),
          x: index * 80,
        }));

      const initialOpponentHand = opponentDeckArray
        .slice(0, 7)
        .map((card, index) => ({
          ...card,
          id: generateUUID(),
          x: index * 80,
        }));

      const gameState = {
        players: [
          {
            deck: playerDeckArray,
            hand: initialPlayerHand,
            life: 20,
            mana: {},
          },
          {
            deck: opponentDeckArray,
            hand: initialOpponentHand,
            life: 20,
            mana: {},
          },
        ],
        currentTurn: 1,
        currentPhase: "untap",
        timestamp: Date.now(),
      };

      localStorage.setItem("gameState", JSON.stringify(gameState));
      router.push("/game");
    }, [selectedDeck, opponentDeckId, decks, router]);

    if (!mounted) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-center p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">
              Cargando constructor de mazos...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* Deck Selection */}
        <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Seleccionar Mazo
          </h3>
          <div className="flex flex-wrap gap-2">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setSelectedDeckId(deck.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedDeckId === deck.id
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                }`}
                aria-label={`Seleccionar mazo: ${deck.name}`}
              >
                {deck.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedDeckId(null)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDeckId === null
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
              }`}
              aria-label="Crear nuevo mazo"
            >
              Nuevo Mazo
            </button>
          </div>
        </div>

        {/* Create New Deck */}
        {selectedDeckId === null && (
          <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Crear Nuevo Mazo
            </h3>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Nombre del mazo"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createNewDeck()}
                className="flex-1 bg-gray-800 border-gray-600 focus:border-gray-500 text-gray-200 placeholder-gray-400"
              />
              <Button
                onClick={createNewDeck}
                disabled={!newDeckName.trim()}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Crear
              </Button>
            </div>
          </div>
        )}

        {/* Selected Deck */}
        {selectedDeck && (
          <div className="flex-1 flex flex-col">
            {/* Deck Header */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                {editingDeckId === selectedDeck.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempDeckName}
                      onChange={(e) => setTempDeckName(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSaveRename(selectedDeck.id)
                      }
                      className="w-32 bg-gray-800 border-gray-600 text-gray-200"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveRename(selectedDeck.id)}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingDeckId(null)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-200">
                      {selectedDeck.name}
                    </h2>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStartEditing(selectedDeck.id, selectedDeck.name)
                      }
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteDeck(selectedDeck.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-600">
                {totalCards} cartas
              </div>
            </div>

            {/* Sample Hand */}
            {sampleHand.length > 0 && (
              <div className="mb-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">
                  Mano de Ejemplo
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sampleHand.map((card, index) => (
                    <SafeImage
                      key={index}
                      src={card.image_uris?.normal || "/images/default-card.jpg"}
                      alt={`Carta ${index + 1}: ${card.name}`}
                      className="w-16 h-24 object-cover rounded shadow-sm"
                      loading="lazy"
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => setSampleHand([])}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Limpiar
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={generateSampleHand}
                disabled={totalCards < 7}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Generar Mano
              </Button>
              <Button
                onClick={() => setSampleHand([])}
                disabled={sampleHand.length === 0}
                className="bg-gray-600 hover:bg-gray-500 text-white"
              >
                Limpiar Mano
              </Button>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="space-y-1" role="list">
                  {renderCardList(selectedDeck.cards)}
                </div>
              </ScrollArea>
            </div>

            {/* Sideboard */}
            {selectedDeck.sideboard &&
              Object.keys(selectedDeck.sideboard).length > 0 && (
                <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-200">
                    Sideboard
                  </h3>
                  <div className="space-y-1" role="list">
                    {renderCardList(selectedDeck.sideboard, true)}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* No Deck Selected */}
        {!selectedDeck && selectedDeckId !== null && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6 bg-gray-900 border border-gray-700 rounded-lg">
              <p className="text-gray-400 mb-4">Mazo no encontrado</p>
              <Button
                onClick={() => setSelectedDeckId(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Crear Nuevo Mazo
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default DeckBuilder;
