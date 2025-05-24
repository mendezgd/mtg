// components/CardList.tsx
export interface Card {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
  };
  oracle_text?: string;
  mana_cost?: string;
  type_line?: string;
  set_name?: string;
  prints_search_uri?: string;
  legalities?: {
    premodern: string;
  };
  colors?: string[];
}

export interface CardType {
  id: string;
  name: string;
  image_uris?: {
    normal?: string;
  };
}
export interface CardListProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}
