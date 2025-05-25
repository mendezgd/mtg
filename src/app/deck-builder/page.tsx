"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CardSearch from "@/components/CardSearch";
import dynamic from "next/dynamic";
import { Card } from "@/components/CardList";
import Image from "next/image";
import { Input } from "@/components/ui/input";

interface Deck {
  id: string;
  name: string;
  cards: Record<string, { card: Card; count: number }>;
  sideboard?: Record<string, { card: Card; count: number }>;
}

const DeckBuilder = dynamic(() => import("@/components/DeckBuilder"), {
  ssr: false,
  loading: () => (
    <div className="text-gray-400">Cargando constructor de mazos...</div>
  ),
});

const DeckBuilderPage: React.FC = () => {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [previewedCard, setPreviewedCard] = useState<Card | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [importText, setImportText] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState({
    valid: [] as Array<{ card: Card; count: number }>,
    invalid: [] as string[],
    sideboard: [] as Array<{ card: Card; count: number }>,
  });
  const [newDeckName, setNewDeckName] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState<
    "search" | "preview" | "deck" | "import"
  >("search");

  // Load decks from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedDecks = localStorage.getItem("decks");
    if (savedDecks) setDecks(JSON.parse(savedDecks));
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("decks", JSON.stringify(decks));
  }, [decks, isMounted]);

  const isBasicLand = useCallback(
    (card: Card) => card.type_line?.includes("Basic Land"),
    []
  );

  const updateDecks = useCallback(
    (updateFn: (deck: Deck) => Deck) => {
      setDecks((prevDecks) =>
        prevDecks.map((deck) =>
          deck.id === selectedDeckId ? updateFn(deck) : deck
        )
      );
    },
    [selectedDeckId]
  );

  const addCardToDeck = useCallback(
    (card: Card) => {
      if (!isMounted || !selectedDeckId)
        return alert("Por favor selecciona un mazo");

      updateDecks((deck) => {
        const currentCount = deck.cards[card.name]?.count || 0;
        const isLand = isBasicLand(card);

        if (!isLand && currentCount >= 4) {
          alert("Máximo 4 copias permitidas para cartas no básicas");
          return deck;
        }

        return {
          ...deck,
          cards: {
            ...deck.cards,
            [card.name]: {
              card,
              count: Math.min(currentCount + 1, isLand ? 1000 : 4),
            },
          },
        };
      });
    },
    [selectedDeckId, isMounted, isBasicLand, updateDecks]
  );

  const removeCardFromDeck = useCallback(
    (cardName: string) => {
      if (!isMounted || !selectedDeckId) return;

      updateDecks((deck) => {
        const currentCount = deck.cards[cardName]?.count || 0;

        if (currentCount <= 1) {
          const { [cardName]: _, ...newCards } = deck.cards;
          return { ...deck, cards: newCards };
        }

        return {
          ...deck,
          cards: {
            ...deck.cards,
            [cardName]: {
              ...deck.cards[cardName],
              count: currentCount - 1,
            },
          },
        };
      });
    },
    [selectedDeckId, isMounted, updateDecks]
  );

  const addCardToSideboard = useCallback(
    (card: Card) => {
      if (!isMounted || !selectedDeckId)
        return alert("Por favor selecciona un mazo");

      updateDecks((deck) => {
        const currentCount = deck.sideboard?.[card.name]?.count || 0;
        const isLand = isBasicLand(card);

        if (!isLand && currentCount >= 4) {
          alert("Máximo 4 copias permitidas para cartas no básicas");
          return deck;
        }

        return {
          ...deck,
          sideboard: {
            ...(deck.sideboard || {}),
            [card.name]: {
              card,
              count: Math.min(currentCount + 1, isLand ? 1000 : 4),
            },
          },
        };
      });
    },
    [selectedDeckId, isMounted, isBasicLand, updateDecks]
  );

  const removeCardFromSideboard = useCallback(
    (cardName: string) => {
      if (!isMounted || !selectedDeckId) return;

      updateDecks((deck) => {
        if (!deck.sideboard) return deck;

        const currentCount = deck.sideboard[cardName]?.count || 0;

        if (currentCount <= 1) {
          const { [cardName]: _, ...newSideboard } = deck.sideboard;
          return { ...deck, sideboard: newSideboard };
        }

        return {
          ...deck,
          sideboard: {
            ...deck.sideboard,
            [cardName]: {
              ...deck.sideboard[cardName],
              count: currentCount - 1,
            },
          },
        };
      });
    },
    [selectedDeckId, isMounted, updateDecks]
  );

  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      if (window.confirm("¿Estás seguro de eliminar este mazo?")) {
        setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
        if (selectedDeckId === deckId) setSelectedDeckId(null);
      }
    },
    [selectedDeckId]
  );

  const handleRenameDeck = useCallback((deckId: string, newName: string) => {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId ? { ...deck, name: newName } : deck
      )
    );
  }, []);

  const searchCardByName = useCallback(
    async (name: string): Promise<Card | null> => {
      try {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(
            name
          )}"&unique=prints`
        );
        const data = await response.json();

        if (data.data?.length > 0) {
          const cardData =
            data.data.find((c: any) => c.image_uris?.normal) || data.data[0];
          return {
            id: cardData.id,
            name: cardData.name,
            image_uris: {
              normal:
                cardData.image_uris?.normal ||
                cardData.card_faces?.[0]?.image_uris?.normal ||
                "/default-card.jpg",
            },
            type_line: cardData.type_line,
            oracle_text: cardData.oracle_text,
            mana_cost: cardData.mana_cost,
            colors: cardData.colors || [],
          } as Card;
        }
        return null;
      } catch (error) {
        console.error("Error buscando carta:", error);
        return null;
      }
    },
    []
  );

  const processImportedDeck = useCallback(
    async (text: string) => {
      const lines = text.split("\n");
      const cardMap: Record<string, number> = {};
      const sideboardMap: Record<string, number> = {};
      const invalidCards: string[] = [];
      let isSideboard = false;

      lines.forEach((line) => {
        if (line.trim() === "") {
          isSideboard = true;
          return;
        }

        const match =
          line.match(/^(\d+)x?\s*(.+)/) || line.match(/^(.+?)\s(\d+)$/);
        if (match) {
          const count = parseInt(match[1] || match[2], 10);
          const name = (match[2] || match[1]).trim();
          if (isSideboard) {
            sideboardMap[name] = (sideboardMap[name] || 0) + count;
          } else {
            cardMap[name] = (cardMap[name] || 0) + count;
          }
        } else {
          invalidCards.push(line.trim());
        }
      });

      const fetchCards = async (map: Record<string, number>) =>
        (
          await Promise.all(
            Object.entries(map).map(async ([name, count]) => {
              const card = await searchCardByName(name);
              return card ? { card, count } : null;
            })
          )
        ).filter(Boolean) as Array<{ card: Card; count: number }>;

      const validCards = await fetchCards(cardMap);
      const validSideboardCards = await fetchCards(sideboardMap);

      setImportResults({
        valid: validCards,
        invalid: invalidCards,
        sideboard: validSideboardCards,
      });
      setImportDialogOpen(true);
    },
    [searchCardByName]
  );

  const createDeckFromImport = useCallback(() => {
    if (!newDeckName.trim() || importResults.valid.length === 0) return;

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: newDeckName,
      cards: importResults.valid.reduce(
        (acc, { card, count }) => ({
          ...acc,
          [card.name]: {
            card,
            count: Math.min(count, isBasicLand(card) ? 1000 : 4),
          },
        }),
        {}
      ),
      sideboard: importResults.sideboard.reduce(
        (acc, { card, count }) => ({
          ...acc,
          [card.name]: {
            card,
            count: Math.min(count, isBasicLand(card) ? 1000 : 4),
          },
        }),
        {}
      ),
    };

    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
    setImportDialogOpen(false);
    setImportText("");
    setNewDeckName("");
  }, [importResults, newDeckName, isBasicLand]);

  const handleCardPreview = useCallback(
    (card: Card) => setPreviewedCard(card),
    []
  );

  if (!isMounted) return null;

  return (
    <div className="flex flex-col md:flex-row absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white overflow-hidden">
      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex border-b border-gray-700">
        {["search", "preview", "deck"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 ${
              activeMobileTab === tab ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveMobileTab(tab as typeof activeMobileTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Column */}
      <div
        className={`${
          activeMobileTab === "search" ? "block" : "hidden"
        } md:block w-full md:w-1/3 p-2 md:p-4 border-r border-gray-700 flex flex-col`}
      >
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Image
            src="/images/pixelpox.jpg"
            alt="Ícono de búsqueda"
            width={24}
            height={24}
            className="w-8 h-8 md:w-12 md:h-12 rounded-full"
          />
          <h2 className="text-lg md:text-xl font-bold">Buscador de Cartas</h2>
        </div>
        <CardSearch
          addCardToDeck={addCardToDeck}
          onCardPreview={handleCardPreview}
        />
      </div>

      {/* Preview Column */}
      <div
        className={`${
          activeMobileTab === "preview" ? "block" : "hidden"
        } md:block w-full md:w-1/4 p-2 md:p-4 border-r border-gray-700 overflow-auto`}
      >
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">
          Vista Previa
        </h2>
        {previewedCard ? (
          <div className="animate-fade-in">
            <img
              src={previewedCard.image_uris?.normal || "/default-card.jpg"}
              alt={previewedCard.name}
              className="w-full rounded-2xl mb-2 md:mb-4 object-cover"
            />
            <h3 className="font-bold text-md md:text-lg">
              {previewedCard.name}
            </h3>
            <p className="text-xs md:text-sm text-gray-300">
              {previewedCard.type_line}
            </p>
            <p className="mt-1 md:mt-2 text-sm md:text-base">
              {previewedCard.oracle_text}
            </p>
            <Button
              variant="outline"
              className="text-xs py-1 bg-green-500 hover:bg-green-700 text-white h-auto w-20 md:w-32 mt-2"
              onClick={() => previewedCard && addCardToDeck(previewedCard)}
            >
              {window.innerWidth <= 768 ? "Add" : "Add to Deck"}
            </Button>
          </div>
        ) : (
          <p className="text-gray-400 text-sm md:text-base">
            Selecciona una carta para previsualizar
          </p>
        )}
      </div>

      {/* Deck Column */}
      <div
        className={`${
          activeMobileTab === "deck" ? "block" : "hidden"
        } md:block w-full lg:w-auto md:w-auto p-2 md:p-4 overflow-auto`}
      >
        <div className="space-y-4">
          {/* Import Section */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2">Importar Mazo</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Ejemplo: 4 Forest\n2 Shock"
              className="w-full h-20 text-sm bg-gray-900 rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => processImportedDeck(importText)}
              className="w-full py-1 text-white bg-sky-600 hover:bg-sky-700"
            >
              Importar
            </Button>
            <Button
              asChild
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <a
                href="https://mtgdecks.net/premodern"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mirolear Mazos en mtgdecks.net
              </a>
            </Button>
          </div>

          {/* Deck Builder */}
          <h2 className="text-lg md:text-xl font-bold">Mi Mazo</h2>
          <DeckBuilder
            decks={decks}
            setDecks={setDecks}
            selectedDeckId={selectedDeckId}
            setSelectedDeckId={setSelectedDeckId}
            removeCardFromDeck={removeCardFromDeck}
            addCardToDeck={addCardToDeck}
            handleDeleteDeck={handleDeleteDeck}
            handleRenameDeck={handleRenameDeck}
            removeCardFromSideboard={removeCardFromSideboard}
            addCardToSideboard={addCardToSideboard}
          />
        </div>
      </div>

      {/* Import Dialog */}
      {importDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-4 md:p-6 rounded-lg max-w-md w-full mx-2">
            <h3 className="text-lg md:text-xl font-bold mb-4">
              Resultados de Importación
            </h3>
            <div className="mb-4">
              <p className="text-green-400">
                Cartas válidas: {importResults.valid.length}
              </p>
              <p className="text-red-400">
                Errores: {importResults.invalid.length}
              </p>
            </div>
            <Input
              type="text"
              placeholder="Nombre del nuevo mazo"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="w-full rounded-lg p-2 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setImportDialogOpen(false)}
                className="bg-gray-600 text-white hover:bg-gray-700 py-1 md:py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={createDeckFromImport}
                className="bg-sky-600 hover:bg-sky-700 py-1 md:py-2 text-white"
                disabled={!newDeckName.trim()}
              >
                Crear Mazo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBuilderPage;
