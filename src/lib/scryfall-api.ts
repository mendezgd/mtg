import axios from "axios";
import { SearchableCard } from "@/types/card";

const SCRYFALL_BASE_URL = "https://api.scryfall.com";

interface SearchOptions {
  term?: string;
  type?: string;
  color?: string;
  manaCost?: string;
  page?: number;
  perPage?: number;
}

interface SearchResponse {
  data: SearchableCard[];
  total_cards: number;
  has_more: boolean;
}

class ScryfallAPI {
  private static instance: ScryfallAPI;

  private constructor() {}

  static getInstance(): ScryfallAPI {
    if (!ScryfallAPI.instance) {
      ScryfallAPI.instance = new ScryfallAPI();
    }
    return ScryfallAPI.instance;
  }

  private buildSearchQuery(options: SearchOptions): string {
    const baseQuery = "format:premodern";
    const typeFilter = options.type ? ` type:${options.type}` : "";
    const colorFilter = options.color ? ` color:${options.color}` : "";
    const manaCostFilter = options.manaCost
      ? options.manaCost === "8+"
        ? " cmc>=8"
        : ` cmc:${options.manaCost}`
      : "";

    return options.term?.trim()
      ? `${baseQuery} (name:${options.term}* OR oracle:${options.term})${typeFilter}${colorFilter}${manaCostFilter}`
      : `${baseQuery}${typeFilter}${colorFilter}${manaCostFilter}`;
  }

  async searchCards(options: SearchOptions = {}): Promise<SearchResponse> {
    const query = this.buildSearchQuery(options);
    const url = `${SCRYFALL_BASE_URL}/cards/search`;
    
    const params = new URLSearchParams({
      q: query,
      page: (options.page || 1).toString(),
      unique: "prints",
      per_page: (options.perPage || 25).toString(),
    });

    try {
      const response = await axios.get(`${url}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: [], total_cards: 0, has_more: false };
      }
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async getCardByName(name: string): Promise<SearchableCard | null> {
    try {
      const response = await axios.get(
        `${SCRYFALL_BASE_URL}/cards/search?q=!"${encodeURIComponent(name)}"&unique=prints`
      );
      
      if (response.data.data?.length > 0) {
        return response.data.data.find((card: SearchableCard) => 
          card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal
        ) || response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching card by name:", error);
      return null;
    }
  }

  async getCardByExactName(name: string): Promise<SearchableCard | null> {
    try {
      const response = await axios.get(
        `${SCRYFALL_BASE_URL}/cards/named?exact=${encodeURIComponent(name)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching card by exact name:", error);
      return null;
    }
  }

  filterLegalCards(cards: SearchableCard[]): SearchableCard[] {
    return cards.filter(
      (card) =>
        card.legalities?.premodern === "legal" &&
        (card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal)
    );
  }
}

export const scryfallAPI = ScryfallAPI.getInstance(); 