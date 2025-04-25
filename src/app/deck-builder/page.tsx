// components/DeckBuilderPage.tsx
"use client";

import React, { useState, useCallback } from "react";
import CardSearch from "@/components/CardSearch";
import DeckBuilder from "@/components/DeckBuilder";
import { Card } from "@/components/CardList";

const DeckBuilderPage: React.FC = () => {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [previewedCard, setPreviewedCard] = useState<Card | null>(null);
  // Eliminamos el estado de cardCounts
  const [decks, setDecks] = useState<any[]>([]);

  const isBasicLand = (card: Card) => {
    return card.type_line?.includes("Basic Land");
  };

  const addCardToDeck = useCallback(
    (card: Card) => {
      if (!selectedDeckId) {
        alert("Please select a deck.");
        return;
      }

      setDecks((prevDecks) => {
        return prevDecks.map((deck) => {
          if (deck.id === selectedDeckId) {
            const cardName = card.name;
            let updatedCards = { ...deck.cards };
            const isLand = isBasicLand(card);

            if (updatedCards[cardName]) {
              if (!isLand && updatedCards[cardName].count >= 4) {
                alert(
                  "You can only have up to 4 copies of a non-Basic Land card in your deck."
                );
                return deck;
              }
              updatedCards[cardName] = {
                card: card,
                count: updatedCards[cardName].count + 1,
              };
            } else {
              updatedCards[cardName] = { card: card, count: 1 };
            }

            return { ...deck, cards: updatedCards };
          }
          return deck;
        });
      });
    },
    [selectedDeckId, setDecks]
  );

  const removeCardFromDeck = useCallback(
    (cardName: string) => {
      if (!selectedDeckId) return;

      setDecks((prevDecks) => {
        return prevDecks.map((deck) => {
          if (deck.id === selectedDeckId) {
            let updatedCards = { ...deck.cards };
            if (updatedCards[cardName]) {
              if (updatedCards[cardName].count > 1) {
                updatedCards[cardName] = {
                  card: updatedCards[cardName].card,
                  count: updatedCards[cardName].count - 1,
                };
              } else {
                delete updatedCards[cardName];
              }
            }
            return { ...deck, cards: updatedCards };
          }
          return deck;
        });
      });
    },
    [selectedDeckId, setDecks]
  );

  const handleCardPreview = (card: Card) => {
    setPreviewedCard(card);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      {/* Card Search Column */}
      <div className="w-1/3 p-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Card Search</h2>
        <CardSearch
          addCardToDeck={addCardToDeck}
          onCardPreview={handleCardPreview}
        />
      </div>

      {/* Card Preview Column */}
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Card Preview</h2>
        {previewedCard ? (
          <div>
            <p className="mb-2">{previewedCard.name}</p>
            {previewedCard.image_uris?.normal && (
              <img
                src={previewedCard.image_uris.normal}
                alt={previewedCard.name}
                className="w-3/4 h-auto mx-auto"
              />
            )}
            {previewedCard.mana_cost && (
              <p className="mt-2">Cost: {previewedCard.mana_cost}</p>
            )}
            {previewedCard.type_line && (
              <p className="mt-2">Type: {previewedCard.type_line}</p>
            )}
            {previewedCard.oracle_text && (
              <p className="mt-4">{previewedCard.oracle_text}</p>
            )}
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
              onClick={() => addCardToDeck(previewedCard)}
            >
              Add to Deck
            </button>
          </div>
        ) : (
          <p>Click a card to see its preview.</p>
        )}
      </div>

      {/* Deck Builder Column */}
      <div className="w-1/3 p-4">
        <h2 className="text-xl font-bold mb-4">My Deck</h2>
        <DeckBuilder
          decks={decks}
          setDecks={setDecks}
          selectedDeckId={selectedDeckId}
          setSelectedDeckId={setSelectedDeckId}
          removeCardFromDeck={removeCardFromDeck}
          addCardToDeck={addCardToDeck}
        />
      </div>
    </div>
  );
};

export default DeckBuilderPage;
