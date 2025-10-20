"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CardSearch from "@/components/CardSearch";
import dynamic from "next/dynamic";
import { SearchableCard, DeckCard, Deck } from "@/types/card";
import { ImageService } from "@/lib/image-utils";

import { Input } from "@/components/ui/input";
import { useDeckManagement } from "@/hooks/use-deck-management";
import { useMobileSwipe } from "@/hooks/use-mobile-swipe";
import { generateUUID } from "@/lib/utils";
import { Search, Eye, Library } from "lucide-react";
import { CardPrice } from "@/components/ui/card-price";
import { useLanguage } from "@/contexts/LanguageContext";
import { scryfallAPI } from "@/lib/scryfall-api";

const DeckBuilder = dynamic(() => import("@/components/DeckBuilder"), {
  ssr: false,
  loading: () => {
    const { t } = useLanguage();
    return <div className="text-gray-400">{t("deckBuilder.loading")}</div>;
  },
});

const DeckBuilderPage: React.FC = () => {
  const { t } = useLanguage();
  const [previewedCard, setPreviewedCard] = useState<SearchableCard | null>(
    null
  );
  const [cardRulings, setCardRulings] = useState<Array<{
    oracle_id: string;
    source: string;
    published_at: string;
    comment: string;
  }> | null>(null);
  const [rulingsLoading, setRulingsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<
    "search" | "preview" | "deck"
  >("search");

  const deckManagement = useDeckManagement();

  // Load decks from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCardPreview = useCallback(async (card: SearchableCard) => {
    setPreviewedCard(card);
    setCardRulings(null);
    
    // Fetch rulings if card has an ID
    if (card.id) {
      setRulingsLoading(true);
      try {
        const rulings = await scryfallAPI.getCardRulings(card.id);
        setCardRulings(rulings);
      } catch (error) {
        console.error("Error fetching rulings:", error);
        setCardRulings([]);
      } finally {
        setRulingsLoading(false);
      }
    }
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
    { id: "search" as const, label: t("deckBuilder.search"), icon: Search },
    { id: "preview" as const, label: t("deckBuilder.preview"), icon: Eye },
    { id: "deck" as const, label: t("deckBuilder.myDeck"), icon: Library },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white overflow-hidden">
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
          {t("deckBuilder.swipeIndicator")}
        </div>
      </div>

      {/* Search Column */}
      <div
        className={`${
          activeMobileTab === "search" ? "block" : "hidden"
        } md:block w-full md:w-1/3 p-2 md:p-4 border-r border-gray-700 flex flex-col h-full overflow-hidden`}
      >
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <Search className="w-8 h-6 md:w-10 md:h-8 text-purple-400" />
          <h2 className="text-lg md:text-xl font-bold">
            {t("deckBuilder.search")}
          </h2>
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
          {t("deckBuilder.preview")}
        </h2>
        {previewedCard ? (
          <div className="animate-fade-in">
            <div className="relative group">
              <img
                src={ImageService.processImageUrl(
                  previewedCard.image_uris?.normal || "/images/default-card.svg"
                )}
                alt={previewedCard.name}
                className="w-full rounded-2xl mb-2 md:mb-4 object-cover card-hover shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/default-card.svg";
                }}
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
                {t("deckBuilder.price")}
              </h4>
              <CardPrice card={previewedCard} />
            </div>

            {/* Rulings de la carta */}
            {rulingsLoading ? (
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  {t("deckBuilder.rulings")}
                </h4>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Loading rulings...</span>
                </div>
              </div>
            ) : cardRulings && cardRulings.length > 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  {t("deckBuilder.rulings")}
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cardRulings.map((ruling, index) => (
                    <div key={index} className="text-xs text-gray-400 border-l-2 border-purple-500 pl-2">
                      <p className="leading-relaxed">{ruling.comment}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {ruling.source} • {new Date(ruling.published_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : cardRulings && cardRulings.length === 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  {t("deckBuilder.rulings")}
                </h4>
                <p className="text-xs text-gray-500">No rulings available for this card.</p>
              </div>
            ) : null}

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
              {t("deckBuilder.addToDeck")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">👁️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              {t("deckBuilder.preview")}
            </h3>
            <p className="text-gray-400 max-w-md">
              {t("deckBuilder.previewDescription")}
            </p>
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
          <h2 className="text-lg md:text-xl font-bold">
            {t("deckBuilder.myDeck")}
          </h2>
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
