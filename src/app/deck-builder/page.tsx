"use client";

import React, { useState, useCallback } from 'react';
import CardSearch from '@/components/CardSearch';
import DeckBuilder from '@/components/DeckBuilder';
import { Card } from '@/components/CardList';

interface CardData {
    name: string;
    image_uris?: {
        small: string;
        normal: string;
    };
    oracle_text?: string;
    mana_cost?: string;
    type_line?: string;
}

const DeckBuilderPage: React.FC = () => {
    const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
    const [previewedCard, setPreviewedCard] = useState<CardData | null>(null);
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
    const [decks, setDecks] = useState<any[]>([]); // Assuming Deck type is available

    const addCardToDeck = useCallback((card: CardData) => {
        if (!selectedDeckId) {
            alert('Please select a deck.');
            return;
        }

        setDecks(prevDecks => {
            return prevDecks.map(deck => {
                if (deck.id === selectedDeckId) {
                    const cardName = card.name;
                    let updatedCards = { ...deck.cards };

                    if (updatedCards[cardName]) {
                        if (updatedCards[cardName].count < 4) {
                            updatedCards[cardName] = { card: card, count: updatedCards[cardName].count + 1 };
                        } else {
                            alert('You can only have up to 4 copies of a card in your deck.');
                            return deck;
                        }
                    } else {
                        updatedCards[cardName] = { card: card, count: 1 };
                    }

                    return { ...deck, cards: updatedCards };
                }
                return deck;
            });
        });
    }, [selectedDeckId, setDecks]);

    const removeCardFromDeck = useCallback((cardName: string) => {
        if (!selectedDeckId) return;

        setDecks(prevDecks => {
            return prevDecks.map(deck => {
                if (deck.id === selectedDeckId) {
                    let updatedCards = { ...deck.cards };
                    if (updatedCards[cardName]) {
                        if (updatedCards[cardName].count > 1) {
                            updatedCards[cardName] = { card: updatedCards[cardName].card, count: updatedCards[cardName].count - 1 };
                        } else {
                            delete updatedCards[cardName];
                        }
                    }
                    return { ...deck, cards: updatedCards };
                }
                return deck;
            });
        });
    }, [selectedDeckId, setDecks]);

    const handleCardPreview = (card: CardData) => {
        setPreviewedCard(card);
        setCardCounts(prev => ({ ...prev, [card.name]: 0 }));
    };

    const incrementCount = (card: CardData) => {
        setCardCounts(prevCounts => {
            const currentCount = prevCounts[card.name] || 0;
            if (currentCount < 4) {
                return { ...prevCounts, [card.name]: currentCount + 1 };
            } else {
                alert("You can only have up to 4 copies of a card in your deck.");
                return prevCounts;
            }
        });
    };

    const decrementCount = (card: CardData) => {
        setCardCounts(prevCounts => {
            const currentCount = prevCounts[card.name] || 0;
            if (currentCount > 0) {
                return { ...prevCounts, [card.name]: currentCount - 1 };
            } else {
                return prevCounts;
            }
        });
    };

    const addCardToDeckWithCount = (card: CardData) => {
        const count = cardCounts[card.name] || 0;
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                addCardToDeck(card);
            }
            // Reset count after adding to deck
            setCardCounts(prevCounts => ({ ...prevCounts, [card.name]: 0 }));
        } else {
            alert("Please select at least one copy of the card to add.");
        }
    };

    return (
        <div className="flex h-screen w-screen bg-gray-800 text-white">
            {/* Card Search Column */}
            <div className="w-1/3 p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-4">Card Search</h2>
                <CardSearch addCardToDeck={addCardToDeck} onCardPreview={handleCardPreview} />
            </div>

            {/* Card Preview Column */}
            <div className="w-1/3 p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-4">Card Preview</h2>
                {previewedCard ? (
                    <div>
                        <p className="mb-2">{previewedCard.name}</p>
                        {previewedCard.image_uris && (
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
                        <div className="flex items-center justify-center mt-2">
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded-l"
                                onClick={() => decrementCount(previewedCard)}
                            >
                                -
                            </button>
                            <span className="bg-gray-700 text-white font-bold py-2 px-4">{cardCounts[previewedCard.name] || 0}</span>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded-r"
                                onClick={() => incrementCount(previewedCard)}
                            >
                                +
                            </button>
                        </div>
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
                            onClick={() => addCardToDeckWithCount(previewedCard)}
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
                <DeckBuilder decks={decks} setDecks={setDecks} selectedDeckId={selectedDeckId} setSelectedDeckId={setSelectedDeckId} removeCardFromDeck={removeCardFromDeck} addCardToDeck={function (card: Card): void {
                    throw new Error('Function not implemented.');
                }} />
            </div>
        </div>
    );
};

export default DeckBuilderPage;
