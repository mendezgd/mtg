"use client";

import React, { useState, useCallback } from 'react';
import { Card as CardType } from './CardList';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"

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

const DeckBuilder: React.FC<DeckBuilderProps> = ({ decks, setDecks, selectedDeckId, setSelectedDeckId, removeCardFromDeck, addCardToDeck }) => {
    const [newDeckName, setNewDeckName] = useState('');

    const handleDeckNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewDeckName(e.target.value);
    };

    const createNewDeck = () => {
        if (newDeckName.trim() !== '') {
            const newDeck: Deck = {
                id: Date.now().toString(),
                name: newDeckName,
                cards: {},
            };
            setDecks([...decks, newDeck]);
            setSelectedDeckId(newDeck.id); // Automatically select the new deck
            setNewDeckName('');
        } else {
            alert('Please enter a deck name.');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            createNewDeck();
        }
    };

    const selectDeck = (deckId: string) => {
        setSelectedDeckId(deckId);
    };

    const selectedDeck = decks.find(deck => deck.id === selectedDeckId);

    const incrementCardCount = (card: CardType) => {
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
    };

    const decrementCardCount = (cardName: string) => {
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
    };

    return (
        <div className="flex flex-col">
            {/* Deck List Column */}
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-2">My Decks</h3>
                <ul>
                    {decks.map(deck => (
                        <li
                            key={deck.id}
                            className={`p-2 rounded cursor-pointer ${selectedDeckId === deck.id ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
                            onClick={() => selectDeck(deck.id)}
                        >
                            {deck.name}
                        </li>
                    ))}
                </ul>

                {/* Deck Creation */}
                <div className="mt-4">
                    <h3 className="text-lg font-bold mb-2">Create New Deck</h3>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Enter deck name"
                            className="bg-gray-700 text-white rounded p-2 mb-2"
                            value={newDeckName}
                            onChange={handleDeckNameChange}
                            onKeyDown={handleKeyDown}
                        />
                        <Button onClick={createNewDeck}>Create Deck</Button>
                    </div>
                </div>
            </div>

            {/* Deck Display Column */}
            <div className="p-4">
                {selectedDeck && (
                     <div className="flex flex-col">
                        <h3 className="text-lg font-bold mb-2">{selectedDeck.name}</h3>
                          <ScrollArea className="rounded-md border p-1">
                            <div className="flex flex-col gap-2">
                                {Object.entries(selectedDeck.cards).map(([cardName, cardInfo]) => (
                                    <div key={cardName} className="bg-gray-700 p-2 rounded flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="mr-2">({cardInfo.count}x)</span>
                                            <p className="text-center">{cardName}</p>
                                        </div>
                                        <div>
                                            <Button size="sm" onClick={() => decrementCardCount(cardName)}>-</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </ScrollArea>
                    </div>
                )}
                {!selectedDeck && (
                    <p>Select a deck to view its contents.</p>
                )}
            </div>
        </div>
    );
};

export default DeckBuilder;
