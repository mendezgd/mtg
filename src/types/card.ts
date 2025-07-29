// Tipos base para cartas de Magic
export interface BaseCard {
  id?: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
    large?: string;
  };
  card_faces?: Array<{
    image_uris?: {
      small: string;
      normal: string;
      large: string;
    };
  }>;
  oracle_text?: string;
  mana_cost?: string;
  type_line?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity?: string[];
  set_name?: string;
  prints_search_uri?: string;
}

// Carta con legalidades para búsqueda
export interface SearchableCard extends BaseCard {
  legalities: {
    premodern: string;
  };
}

// Carta para el juego (con posición y estado)
export interface GameCard extends BaseCard {
  id: string;
  tapped?: boolean;
  x?: number;
  y?: number;
}

// Carta para el constructor de mazos
export interface DeckCard extends BaseCard {
  id: string;
  legalities?: {
    premodern: string;
  };
}

// Carta para listas simples
export interface ListCard extends BaseCard {
  id: string;
}

// Tipos para el constructor de mazos
export interface DeckCardEntry {
  card: DeckCard;
  count: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: { [cardName: string]: DeckCardEntry };
  sideboard?: { [cardName: string]: DeckCardEntry };
}

// Tipos para el juego
export interface PlayerState {
  deck: GameCard[];
  hand: GameCard[];
  life?: number;
  mana?: Record<string, number>;
}

export interface GameState {
  players: PlayerState[];
  currentTurn: number;
  currentPhase: string;
  timestamp: number;
}
