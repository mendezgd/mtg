"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card as CardType } from "./CardList";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";

interface Deck {
  id: string;
  name: string;
  cards: { [cardName: string]: { card: CardType; count: number } };
}

interface DeckBuilderProps {
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  selectedDeckId: string | null;
  setSelectedDeckId: React.Dispatch<React.SetStateAction<string | null>>;
  removeCardFromDeck: (cardName: string) => void;
  addCardToDeck: (card: CardType) => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({
  decks,
  setDecks,
  selectedDeckId,
  setSelectedDeckId,
  removeCardFromDeck,
  addCardToDeck,
}) => {
  const [newDeckName, setNewDeckName] = useState("");
  const [sampleHand, setSampleHand] = useState<CardType[]>([]);

  // Drag scroll logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;

    setIsDragging(true);
    setStartX(clientX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const duringDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const handleDeckNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDeckName(e.target.value);
  };

  const createNewDeck = () => {
    if (newDeckName.trim()) {
      const newDeck: Deck = {
        id: Date.now().toString(),
        name: newDeckName,
        cards: {},
      };
      setDecks([...decks, newDeck]);
      setSelectedDeckId(newDeck.id);
      setNewDeckName("");
    }
  };

  const selectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setSampleHand([]);
  };

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);

  const incrementCardCount = (card: CardType) => {
    addCardToDeck(card);
  };

  const decrementCardCount = (cardName: string) => {
    removeCardFromDeck(cardName);
  };

  const generateSampleHand = useCallback(() => {
    if (!selectedDeck) return;

    const cardPool: CardType[] = [];
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

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <div className="p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Constructor de Mazos</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tus Mazos</h3>
            <ScrollArea className="h-40 mb-4">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => selectDeck(deck.id)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors
                    ${
                      selectedDeckId === deck.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-800 hover:bg-gray-700"
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span>{deck.name}</span>
                    <span className="text-sm text-gray-400">
                      {Object.values(deck.cards).reduce(
                        (acc, { count }) => acc + count,
                        0
                      )}{" "}
                      cartas
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Nuevo Mazo</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre del mazo"
                className="bg-gray-800 rounded-lg p-3 flex-grow focus:ring-2 focus:ring-blue-500"
                value={newDeckName}
                onChange={handleDeckNameChange}
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
                <p className="text-gray-400">
                  {Object.values(selectedDeck.cards).reduce(
                    (acc, { count }) => acc + count,
                    0
                  )}{" "}
                  cartas en el mazo
                </p>
              </div>
              <Button
                onClick={generateSampleHand}
                disabled={Object.keys(selectedDeck.cards).length === 0}
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
                  style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
                >
                  <div className="flex gap-2 pb-4" onMouseMove={duringDrag}>
                    {sampleHand.map((card, index) => (
                      <div
                        key={index}
                        className="relative group flex-shrink-0 select-none"
                      >
                        <div
                          className="w-32 rounded-xl overflow-hidden shadow-lg 
                               border-2 border-gray-700 group-hover:border-blue-500
                               transition-all duration-300"
                        >
                          <img
                            src={card.image_uris?.normal || "/default-card.jpg"}
                            alt={card.name}
                            className="w-full h-full object-cover 
                                     group-hover:scale-105 transition-transform duration-300"
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

            <div className="grid gap-4">
              {Object.entries(selectedDeck.cards).map(
                ([name, { card, count }]) => (
                  <HoverCard key={name}>
                    <HoverCardTrigger asChild>
                      <div className="text-sm flex justify-between items-center p-1 bg-gray-800 rounded-md border-2 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => decrementCardCount(name)}
                              className="bg-red-500 hover:bg-red-700 w-4 h-6"
                            >
                              -
                            </Button>
                            <span className="w-4 text-center">{count}</span>
                            <Button
                              size="sm"
                              onClick={() => incrementCardCount(card)}
                              disabled={count >= 4}
                              className="bg-green-600 hover:bg-green-900 w-4 h-6"
                            >
                              +
                            </Button>
                          </div>
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
