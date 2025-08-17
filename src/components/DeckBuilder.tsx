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

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { generateUUID, getCardStyle, getPrimaryType, getTypeOrder, getManaSymbols } from "@/lib/utils";
import { ImageService } from "@/lib/image-utils";
import { logger } from "@/lib/logger";
import { useLongPress } from "@/hooks/use-long-press";
import { useIsMobile } from "@/hooks/use-mobile";

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
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState("");
    const [importDeckName, setImportDeckName] = useState("");
    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState("");
    const isMobile = useIsMobile();

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

        const cardStyle = getCardStyle(validCard.colors);

        // Configurar long press para preview (móvil y desktop)
        const longPressHandlers = useLongPress({
          onLongPress: () => setTouchedCard({ card: validCard, name }),
          onPress: () => {}, // No hacer nada en press corto
          ms: 600, // 600ms para long press
          preventDefault: false,
        });

        return (
          <div
            className={`text-sm flex justify-between rounded-md items-center p-2 border ${cardStyle.background} ${cardStyle.border} hover:shadow-sm transition-colors`}
            role="listitem"
            aria-label={`${name} - ${count} copias`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-xs text-gray-400 opacity-60 mr-1">
                👁️
              </div>
              <button
                className={`text-left flex-1 min-w-0 hover:opacity-80 transition-opacity ${cardStyle.text}`}
                aria-label={`Ver detalles de ${name} - mantén presionado para vista previa`}
                {...longPressHandlers}
              >
                    <div className="font-medium truncate">{name}</div>
                    <div className={`text-xs opacity-70 truncate ${cardStyle.text}`}>
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
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium min-w-[2rem] text-center ${cardStyle.text}`}
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
                <img
                  src={ImageService.processImageUrl(validCard.image_uris?.normal || "/images/default-card.svg")}
                  alt={`Vista previa de ${name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/default-card.svg";
                  }}
                />
                {/* Botón de cierre visible */}
                <button
                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors z-10"
                  onClick={() => setTouchedCard(null)}
                  aria-label="Cerrar vista previa"
                >
                  ×
                </button>
                {/* Overlay para cerrar al tocar fuera */}
                <div 
                  className="absolute inset-0 bg-transparent cursor-pointer"
                  onClick={() => setTouchedCard(null)}
                  aria-label="Cerrar vista previa"
                />
              </div>
            )}
          </div>
        );
      },
      [touchedCard, validateCard]
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
        logger.info("Created new deck:", newDeck.name);
      }
    }, [newDeckName, setDecks, setSelectedDeckId]);

        // Import deck from various sources
    const importDeck = useCallback(async (deckText: string, deckName: string) => {
      try {
        const lines = deckText.split('\n');
        const importedCards: { [key: string]: { card: DeckCard; count: number } } = {};
        const importedSideboard: { [key: string]: { card: DeckCard; count: number } } = {};
        
        let isSideboard = false;
        let mainDeckCount = 0;
        let sideboardCount = 0;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (!trimmedLine) {
            // If we encounter an empty line and we have main deck cards, switch to sideboard
            if (Object.keys(importedCards).length > 0) {
              isSideboard = true;
            }
            continue;
          }
          
          // Parse common deck formats
          const match = trimmedLine.match(/^(\d+)\s+(.+)$/);
          if (match) {
            const count = parseInt(match[1]);
            const cardName = match[2].trim();
            
            if (count > 0 && cardName) {
              try {
                // Search for the card using Scryfall API directly
                const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
                if (response.ok) {
                  const cardData = await response.json();
                 
                  if (cardData.legalities?.premodern === "legal" || cardData.legalities?.premodern === "restricted") {
                    const deckCard: DeckCard = {
                      id: cardData.id,
                      name: cardData.name,
                      image_uris: cardData.image_uris,
                      type_line: cardData.type_line,
                      oracle_text: cardData.oracle_text,
                      mana_cost: cardData.mana_cost,
                      colors: cardData.colors || [],
                      legalities: cardData.legalities || { premodern: "legal" },
                    };
                    
                    if (isSideboard) {
                      // Add to sideboard
                      if (importedSideboard[cardName]) {
                        importedSideboard[cardName].count += count;
                      } else {
                        importedSideboard[cardName] = { card: deckCard, count };
                      }
                      sideboardCount += count;
                    } else {
                      // Add to main deck
                      if (importedCards[cardName]) {
                        importedCards[cardName].count += count;
                      } else {
                        importedCards[cardName] = { card: deckCard, count };
                      }
                      mainDeckCount += count;
                    }
                  } else {
                    logger.warn(`Card ${cardName} is not legal in Premodern`);
                  }
                } else {
                  logger.warn(`Could not find card: ${cardName}`);
                }
              } catch (error) {
                logger.error(`Error importing card ${cardName}:`, error);
              }
            }
          }
        }
        
        if (Object.keys(importedCards).length > 0) {
          const newDeck: Deck = {
            id: generateUUID(),
            name: deckName || `Imported Deck ${Date.now()}`,
            cards: importedCards,
            sideboard: Object.keys(importedSideboard).length > 0 ? importedSideboard : undefined,
          };
          
          setDecks((prev) => [...prev, newDeck]);
          setSelectedDeckId(newDeck.id);
          
          const mainDeckUnique = Object.keys(importedCards).length;
          const sideboardUnique = Object.keys(importedSideboard).length;
          
          let message = `Mazo importado exitosamente con ${mainDeckUnique} cartas únicas (${mainDeckCount} total)`;
          if (sideboardUnique > 0) {
            message += ` y ${sideboardUnique} cartas únicas en sideboard (${sideboardCount} total)`;
          }
          
          logger.info("Imported deck:", newDeck.name, "with", mainDeckUnique, "main deck cards and", sideboardUnique, "sideboard cards");
          
          return { success: true, message };
        } else {
          return { success: false, message: "No se pudieron importar cartas válidas" };
        }
      } catch (error) {
        logger.error("Error importing deck:", error);
        return { success: false, message: "Error al importar el mazo" };
      }
    }, [setDecks, setSelectedDeckId]);

    // Handle import submission
    const handleImportSubmit = useCallback(async () => {
      if (!importText.trim() || !importDeckName.trim()) {
        setImportMessage("Por favor ingresa el texto del mazo y un nombre");
        return;
      }

      setImporting(true);
      setImportMessage("");

      const result = await importDeck(importText, importDeckName);
      
      setImporting(false);
      setImportMessage(result.message);
      
      if (result.success) {
        setShowImportModal(false);
        setImportText("");
        setImportDeckName("");
        setImportMessage("");
      }
    }, [importText, importDeckName, importDeck]);

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
      logger.info("Generated sample hand for deck:", selectedDeck.name);
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
      logger.info("Started game with decks:", selectedDeck.name, opponentDeck.name);
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
            <div className="flex gap-2 mb-3">
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
            
            {/* Import Deck Section */}
            <div className="border-t border-gray-700 pt-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-300">
                  Importar Mazo
                </h4>
                <Button
                  onClick={() => setShowImportModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  📥 Importar desde mtgdecks.net
                </Button>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Copia y pega el texto de tu mazo desde mtgdecks.net, TappedOut, o cualquier formato similar
              </p>
                             <div className="text-xs text-gray-500 bg-gray-800 p-2 rounded border border-gray-600">
                 <strong>Formato esperado:</strong><br />
                 4 Lightning Bolt<br />
                 2 Counterspell<br />
                 1 Black Lotus<br />
                 <br />
                 <em>// Sideboard</em><br />
                 2 Disenchant<br />
                 1 Circle of Protection: Red<br />
                 ...
               </div>
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
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {sampleHand.map((card, index) => (
                    <img
                      key={index}
                      src={ImageService.processImageUrl(card.image_uris?.normal || "/images/default-card.svg")}
                      alt={`Carta ${index + 1}: ${card.name}`}
                      className="w-16 h-24 object-cover rounded shadow-sm"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-card.svg";
                      }}
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
               <Button
                 onClick={() => setOpponentDeckId(selectedDeck.id)}
                 disabled={totalCards < 7}
                 className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                 title={totalCards < 7 ? "Se necesitan al menos 7 cartas para jugar" : "Jugar contra otro mazo"}
               >
                 Jugar VS
               </Button>
             </div>

                         {/* Instructions */}
             <div className="mb-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
               <p>💡 <strong>Consejo:</strong> Mantén presionada una carta para ver su vista previa. Toca fuera o el botón × para cerrar.</p>
             </div>
             
             {/* VS Mode Info */}
             <div className="mb-3 p-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs">
               <p>🎮 <strong>Modo VS:</strong> Usa el botón "Jugar VS" para enfrentar tu mazo contra otro de tus mazos en el juego.</p>
             </div>

            {/* Cards List */}
            <div className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="space-y-1 pb-4" role="list">
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
                  <div className="mb-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                    <p>💡 <strong>Consejo:</strong> Mantén presionada una carta para ver su vista previa. Toca fuera o el botón × para cerrar.</p>
                  </div>
                  <div className="space-y-1 pb-4" role="list">
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

         {/* VS Mode Selection Modal */}
         {opponentDeckId && selectedDeck && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
               <h3 className="text-lg font-semibold mb-4 text-gray-200">
                 Seleccionar Mazo Oponente
               </h3>
               <p className="text-sm text-gray-400 mb-4">
                 Tu mazo: <span className="text-purple-400 font-medium">{selectedDeck.name}</span>
               </p>
               
               <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                 {decks
                   .filter(deck => deck.id !== selectedDeck.id)
                   .map(deck => {
                     const deckCardCount = Object.values(deck.cards).reduce(
                       (acc, { count }) => acc + count, 0
                     );
                     return (
                       <button
                         key={deck.id}
                         onClick={() => {
                           const opponentDeck = deck;
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
                           logger.info("Started VS game with decks:", selectedDeck.name, opponentDeck.name);
                         }}
                         className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
                       >
                         <div className="font-medium text-gray-200">{deck.name}</div>
                         <div className="text-sm text-gray-400">{deckCardCount} cartas</div>
                       </button>
                     );
                   })}
               </div>

               {decks.filter(deck => deck.id !== selectedDeck.id).length === 0 && (
                 <div className="text-center py-4 text-gray-400">
                   <p>No hay otros mazos disponibles para jugar VS.</p>
                   <p className="text-sm mt-2">Crea otro mazo para poder jugar.</p>
                 </div>
               )}

               <div className="flex gap-2">
                 <Button
                   onClick={() => setOpponentDeckId(null)}
                   variant="outline"
                   className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                 >
                   Cancelar
                 </Button>
               </div>
             </div>
           </div>
         )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  Importar Mazo
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText("");
                    setImportDeckName("");
                    setImportMessage("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Mazo
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: Mono Red Burn"
                    value={importDeckName}
                    onChange={(e) => setImportDeckName(e.target.value)}
                    className="w-full bg-gray-800 border-gray-600 focus:border-gray-500 text-gray-200 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Texto del Mazo
                  </label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                                         placeholder="Pega aquí el texto de tu mazo desde mtgdecks.net, TappedOut, etc.

 Ejemplo:
 4 Lightning Bolt
 2 Counterspell
 1 Black Lotus

 // Sideboard
 2 Disenchant
 1 Circle of Protection: Red
 ..."
                    className="w-full h-48 p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 resize-none focus:border-gray-500 focus:outline-none"
                  />
                </div>

                {importMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    importMessage.includes("exitosamente") 
                      ? "bg-green-900/20 border border-green-600 text-green-300"
                      : "bg-red-900/20 border border-red-600 text-red-300"
                  }`}>
                    {importMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleImportSubmit}
                    disabled={importing || !importText.trim() || !importDeckName.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importando...
                      </>
                    ) : (
                      "Importar Mazo"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText("");
                      setImportDeckName("");
                      setImportMessage("");
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                </div>

                                 <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded border border-gray-600">
                   <strong>Información:</strong><br />
                   • Solo se importarán cartas legales en Premodern<br />
                   • El formato debe ser: cantidad + nombre de la carta<br />
                   • <strong>Sideboard:</strong> Las cartas después de una línea en blanco se importan como sideboard<br />
                   • Se ignorarán las cartas no encontradas o ilegales<br />
                   • Compatible con mtgdecks.net, TappedOut, y formatos similares
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default DeckBuilder;
