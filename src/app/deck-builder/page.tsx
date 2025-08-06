"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CardSearch from "@/components/CardSearch";
import dynamic from "next/dynamic";
import { SearchableCard, DeckCard, Deck } from "@/types/card";
import SafeImage from "@/components/ui/safe-image";
import { Input } from "@/components/ui/input";
import { useDeckManagement } from "@/hooks/use-deck-management";
import { useMobileSwipe } from "@/hooks/use-mobile-swipe";
import { generateUUID } from "@/lib/utils";
import { Search, Eye, Library } from "lucide-react";
import { CardPrice } from "@/components/ui/card-price";

const DeckBuilder = dynamic(() => import("@/components/DeckBuilder"), {
  ssr: false,
  loading: () => (
    <div className="text-gray-400">Cargando constructor de mazos...</div>
  ),
});

const DeckBuilderPage: React.FC = () => {
  const [previewedCard, setPreviewedCard] = useState<SearchableCard | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<
    "search" | "preview" | "deck"
  >("search");

  const deckManagement = useDeckManagement();

  // Load decks from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCardPreview = useCallback((card: SearchableCard) => {
    console.log(
      "Setting previewed card:",
      card.name,
      "with image:",
      card.image_uris?.normal
    );
    setPreviewedCard(card);
  }, []);

  const addCardToDeck = useCallback(
    (card: SearchableCard) => {
      // Convert SearchableCard to DeckCard
      const deckCard: DeckCard = {
        ...card,
        id: card.id || card.name, // Use name as fallback ID
      };
      deckManagement.addCardToDeck(deckCard);
    },
    [deckManagement]
  );

  const addCardToSideboard = useCallback(
    (card: SearchableCard) => {
      // Convert SearchableCard to DeckCard
      const deckCard: DeckCard = {
        ...card,
        id: card.id || card.name, // Use name as fallback ID
      };
      deckManagement.addCardToSideboard(deckCard);
    },
    [deckManagement]
  );

  const handleTabChange = useCallback((tab: typeof activeMobileTab) => {
    setActiveMobileTab(tab);
    // Add smooth scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Mobile swipe navigation
  const handleSwipeLeft = useCallback(() => {
    const tabOrder = ["search", "preview", "deck"] as const;
    const currentIndex = tabOrder.indexOf(activeMobileTab);
    const nextIndex = (currentIndex + 1) % tabOrder.length;
    handleTabChange(tabOrder[nextIndex]);
  }, [activeMobileTab, handleTabChange]);

  const handleSwipeRight = useCallback(() => {
    const tabOrder = ["search", "preview", "deck"] as const;
    const currentIndex = tabOrder.indexOf(activeMobileTab);
    const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    handleTabChange(tabOrder[prevIndex]);
  }, [activeMobileTab, handleTabChange]);

  // Enable swipe only on mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  useMobileSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    enabled: isMobile,
  });

  if (!isMounted) return null;

  const tabs = [
    { id: "search" as const, label: "Búsqueda", icon: Search },
    { id: "preview" as const, label: "Vista Previa", icon: Eye },
    { id: "deck" as const, label: "Mi Mazo", icon: Library },
  ];

  return (
    <div className="flex flex-col md:flex-row absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white overflow-hidden">
      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMobileTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
        {/* Swipe indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-60">
          ← Desliza →
        </div>
      </div>

      {/* Search Column */}
      <div
        className={`${
          activeMobileTab === "search" ? "block" : "hidden"
        } md:block w-full md:w-1/3 p-2 md:p-4 border-r border-gray-700 flex flex-col h-full`}
      >
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <SafeImage
            src="/images/pixelpox.webp"
            alt="Ícono de búsqueda"
            width={48}
            height={48}
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
        } md:block w-full md:w-1/4 p-2 md:p-4 border-r border-gray-700 overflow-auto h-full`}
      >
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Vista Previa
        </h2>
        {previewedCard ? (
          <div className="animate-fade-in">
            <div className="relative group">
              <SafeImage
                src={
                  previewedCard.image_uris?.normal || "/images/default-card.svg"
                }
                alt={previewedCard.name}
                className="w-full rounded-2xl mb-2 md:mb-4 object-cover card-hover shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <h3 className="font-bold text-md md:text-lg mb-2">
              {previewedCard.name}
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              {previewedCard.type_line}
            </p>

            {/* Precios de la carta */}
            <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Precios
              </h4>
              <CardPrice card={previewedCard} />
            </div>

            {previewedCard.oracle_text && (
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">
                  {previewedCard.oracle_text}
                </p>
              </div>
            )}
            <Button
              onClick={() => addCardToDeck(previewedCard)}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Agregar al Mazo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">👁️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Vista Previa
            </h3>
            <p className="text-gray-400 max-w-md">
              Selecciona una carta en la búsqueda para ver su vista previa
              detallada
            </p>
            {/* Test button */}
            <Button
              onClick={() => {
                const testCard: SearchableCard = {
                  id: "test",
                  name: "Lightning Bolt",
                  image_uris: {
                    small:
                      "https://cards.scryfall.io/small/front/0/a/0a6eaa6a-8b3f-4c1e-8a1b-1b1b1b1b1b1b.jpg",
                    normal:
                      "https://cards.scryfall.io/normal/front/0/a/0a6eaa6a-8b3f-4c1e-8a1b-1b1b1b1b1b1b.jpg",
                  },
                  type_line: "Instant",
                  oracle_text: "Lightning Bolt deals 3 damage to any target.",
                  mana_cost: "{R}",
                  colors: ["R"],
                  legalities: { premodern: "legal" },
                };
                console.log("Test button clicked, setting test card");
                setPreviewedCard(testCard);
              }}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Test: Set Lightning Bolt
            </Button>
            {/* Test button with known working image */}
            <Button
              onClick={() => {
                const testCard: SearchableCard = {
                  id: "test2",
                  name: "Test Card",
                  image_uris: {
                    small:
                      "https://cards.scryfall.io/small/front/0/6/06b0c53c-5b8c-4c1e-8a1b-1b1b1b1b1b1b.jpg",
                    normal:
                      "https://cards.scryfall.io/normal/front/0/6/06b0c53c-5b8c-4c1e-8a1b-1b1b1b1b1b1b.jpg",
                  },
                  type_line: "Test",
                  oracle_text: "This is a test card.",
                  mana_cost: "{1}",
                  colors: ["U"],
                  legalities: { premodern: "legal" },
                };
                console.log(
                  "Test button 2 clicked, setting test card with known image"
                );
                setPreviewedCard(testCard);
              }}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Test: Known Image URL
            </Button>
          </div>
        )}
      </div>

      {/* Deck Builder Column */}
      <div
        className={`${
          activeMobileTab === "deck" ? "block" : "hidden"
        } md:block w-full md:w-5/12 p-2 md:p-4 overflow-auto h-full`}
      >
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Library className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg md:text-xl font-bold">Mi Mazo</h2>
        </div>
        <DeckBuilder
          decks={deckManagement.decks}
          setDecks={deckManagement.setDecks}
          selectedDeckId={deckManagement.selectedDeckId}
          setSelectedDeckId={(id) => {
            if (typeof id === "function") {
              const currentId = deckManagement.selectedDeckId;
              const newId = id(currentId);
              deckManagement.selectDeck(newId);
            } else {
              deckManagement.selectDeck(id);
            }
          }}
          removeCardFromDeck={deckManagement.removeCardFromDeck}
          addCardToDeck={deckManagement.addCardToDeck}
          handleDeleteDeck={deckManagement.deleteDeck}
          handleRenameDeck={deckManagement.renameDeck}
          removeCardFromSideboard={deckManagement.removeCardFromSideboard}
          addCardToSideboard={deckManagement.addCardToSideboard}
        />
      </div>
    </div>
  );
};

export default DeckBuilderPage;
