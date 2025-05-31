export interface CardData {
  id?: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
  };
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity?: string[];
  tapped?: boolean;
  x?: number;
  y?: number;
}
