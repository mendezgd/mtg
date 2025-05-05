"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/CardList";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import dynamic from "next/dynamic";

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
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({
  decks,
  setDecks,
  selectedDeckId,
  setSelectedDeckId,
  removeCardFromDeck,
  addCardToDeck,
  handleDeleteDeck,
  handleRenameDeck,
}) => {
  const [sampleHand, setSampleHand] = useState<Card[]>([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [tempDeckName, setTempDeckName] = useState("");

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
      e.preventDefault();

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
    const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);
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
  }, [decks, selectedDeckId]);

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);
  const totalCards = selectedDeck
    ? Object.values(selectedDeck.cards).reduce(
        (acc, { count }) => acc + count,
        0
      )
    : 0;

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
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
                        ? "bg-blue-600 hover:bg-blue-700"
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
                              if (e.key === "Enter") handleSaveRename(deck.id);
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
              <input
                type="text"
                placeholder="Nombre del mazo"
                className="bg-gray-800 rounded-lg p-3 flex-grow focus:ring-2 focus:ring-blue-500"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNewDeck()}
              />
              <Button
                onClick={createNewDeck}
                className="bg-blue-600 hover:bg-blue-700"
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
                <p className="text-gray-400">{totalCards} cartas en el mazo</p>
              </div>
              <Button
                onClick={generateSampleHand}
                disabled={totalCards === 0}
                className="bg-purple-300 hover:bg-purple-400"
              >
                Generar Mano de Prueba
              </Button>
            </div>

            {sampleHand.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Mano de Prueba</h3>
                <div
                  ref={scrollContainerRef}
                  className={`w-full overflow-x-auto cursor-grab ${
                    isDragging ? "cursor-grabbing" : ""
                  }`}
                  onMouseDown={startDrag}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  onTouchStart={startDrag}
                  onTouchMove={duringDrag}
                  onTouchEnd={endDrag}
                >
                  <div className="flex gap-2 pb-4">
                    {sampleHand.map((card, index) => (
                      <div
                        key={index}
                        className="relative group flex-shrink-0 select-none"
                      >
                        <div className="w-32 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-300">
                          <img
                            src={card.image_uris?.normal || "/default-card.jpg"}
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
              {Object.entries(selectedDeck.cards).map(
                ([name, { card, count }]) => (
                  <HoverCard key={name}>
                    <HoverCardTrigger asChild>
                      <div className="text-sm flex justify-between items-center p-1 bg-gray-800 rounded-md border-2 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <span className="font-medium">{name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => removeCardFromDeck(name)}
                            className="bg-red-500 hover:bg-red-700 w-6 h-6 rounded-full"
                          >
                            -
                          </Button>
                          <span className="w-4 text-center">{count}</span>
                          <Button
                            size="sm"
                            onClick={() => addCardToDeck(card)}
                            disabled={count >= 4}
                            className="bg-green-600 hover:bg-green-900 w-6 h-6 rounded-full"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 border-0 p-0 bg-transparent shadow-none">
                      <div className="relative w-64 h-96 rounded-xl overflow-hidden border-2 border-gray-700">
                        <img
                          src={card.image_uris?.normal || "/default-card.jpg"}
                          alt={name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xl">
            ⬅ Selecciona o crea un mazo para comenzar
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckBuilder;
