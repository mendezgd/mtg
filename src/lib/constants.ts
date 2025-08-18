// Constantes para la aplicación MTG

export const APP_CONFIG = {
  MAX_SEARCH_RESULTS: 500,
  CARDS_PER_PAGE: 25,
  MAX_COPIES_PER_CARD: 4,
  MAX_BASIC_LAND_COPIES: 1000,
  MIN_DECK_SIZE: 7,
  STARTING_LIFE: 20,
} as const;

export const CARD_TYPES = [
  { value: "", label: "All Types" },
  { value: "creature", label: "Creature" },
  { value: "instant", label: "Instant" },
  { value: "sorcery", label: "Sorcery" },
  { value: "artifact", label: "Artifact" },
  { value: "enchantment", label: "Enchantment" },
  { value: "land", label: "Land" },
];

export const COLORS = [
  { value: "", label: "All Colors" },
  { value: "W", label: "White" },
  { value: "U", label: "Blue" },
  { value: "B", label: "Black" },
  { value: "R", label: "Red" },
  { value: "G", label: "Green" },
  { value: "C", label: "Colorless" },
];

export const MANA_COSTS = [
  { value: "", label: "All Costs" },
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8+", label: "8+" },
];

export const STORAGE_KEYS = {
  SAVED_DECKS: "savedDecks",
  GAME_STATE: "gameState",
} as const;

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

export const GAME_PHASES = {
  UNTAP: "untap",
  UPKEEP: "upkeep",
  DRAW: "draw",
  MAIN1: "main1",
  COMBAT: "combat",
  MAIN2: "main2",
  END: "end",
} as const;
