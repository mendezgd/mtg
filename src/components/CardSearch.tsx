"use client";

import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Card as CardType } from './CardList';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Icons } from '@/components/icons';

interface CardData {
    name: string;
    image_uris?: {
        small: string;
        normal: string;
        large: string;
    };
    oracle_text?: string;
    legalities: {
        premodern: string;
    };
    mana_cost?: string;
    type_line?: string;
}

interface CardSearchProps {
    addCardToDeck: (card: CardData) => void;
    onCardPreview: (card: CardData) => void;
}

const CardSearch: React.FC<CardSearchProps> = ({ addCardToDeck, onCardPreview }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(false);
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 9;
    const [totalPages, setTotalPages] = useState(1);
    const [allCardsLoaded, setAllCardsLoaded] = useState(false); // Track if all cards are loaded

    const searchResultsRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (page: number = 1) => {
        setLoading(true);
        try {
            let url = `https://api.scryfall.com/cards/search?q=format%3Apremodern`;
            if (searchTerm) {
                 const encodedSearchTerm = encodeURIComponent(searchTerm + ' type:' + searchTerm);
                url += `+(${encodedSearchTerm})`;
            }
            url += `&page=${page}`;
            console.log("URL:", url);

            const response = await axios.get(url);

            if (response.status === 200) {
                const allCards: CardData[] = response.data.data;
                setSearchResults(allCards);
                setTotalPages(Math.ceil(response.data.total_cards / cardsPerPage));
                setCurrentPage(page);
                setAllCardsLoaded(allCards.length < cardsPerPage);

                // Reset card counts on new search
                const newCardCounts: Record<string, number> = {};
                allCards.forEach((card: CardData) => {
                    newCardCounts[card.name] = 0;
                });
                setCardCounts(newCardCounts);
            } else {
                console.error("Request failed with status code", response.status);
                setSearchResults([]);
                setCardCounts({});
                setTotalPages(1);
                setCurrentPage(1);
                setAllCardsLoaded(true);
            }
        } catch (error: any) {
            console.error("Error fetching cards:", error);
            setSearchResults([]);
            setCardCounts({});
            setTotalPages(1);
            setCurrentPage(1);
            setAllCardsLoaded(true);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch(1);
        }
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

     const handlePageChange = (newPage: number) => {
        handleSearch(newPage);
    };

    return (
        <div>
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    placeholder="Search for cards..."
                    className="bg-gray-700 text-white rounded p-2 mr-2 flex-grow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleSearch(1)}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            {loading && <p>Loading results...</p>}
            <div className="grid grid-cols-3 gap-4" ref={searchResultsRef}>
                {searchResults.map((card) => (
                    <div key={card.name} className="bg-gray-600 p-2 rounded">
                        <button onClick={() => onCardPreview(card)} className="w-full">
                            {card.image_uris && (
                                <img
                                    src={card.image_uris.normal}
                                    alt={card.name}
                                    className="w-full h-auto"
                                />
                            )}
                            <p className="text-center">{card.name}</p>
                        </button>
                        <div className="flex items-center justify-center mt-2">
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded-l"
                                onClick={() => decrementCount(card)}
                            >
                                -
                            </button>
                            <span className="bg-gray-700 text-white font-bold py-2 px-4">{cardCounts[card.name] || 0}</span>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded-r"
                                onClick={() => incrementCount(card)}
                            >
                                +
                            </button>
                        </div>
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2 w-full"
                            onClick={() => addCardToDeckWithCount(card)}
                        >
                            Add to Deck
                        </button>
                    </div>
                ))}
                  {Array(Math.max(0, cardsPerPage - searchResults.length)).fill(null).map((_, index) => (
                            <div key={`empty-${index}`} className="bg-gray-800 p-2 rounded flex items-center justify-center text-gray-500">
                                &nbsp;
                            </div>
                        ))}
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationPrevious
                        href="#"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    />
                    {Array.from({ length: Math.min(15, totalPages) }, (_, i) => (
                        <PaginationItem key={i + 1}>
                            <PaginationLink
                                href="#"
                                isCurrent={currentPage === i + 1}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationNext
                        href="#"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages <= 15}
                    />
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default CardSearch;
