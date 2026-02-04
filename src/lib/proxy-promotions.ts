/**
 * Promociones de venta de proxies de cartas MTG.
 * Los textos se obtienen por id desde i18n (proxies.promotions.<id>).
 */
export interface ProxyPromotion {
  id: string;
  /** Cantidad de cartas */
  cardsCount: number;
  /** Precio en pesos (ej. CLP) */
  price: number;
  /** Incluye envío gratis */
  freeShipping: boolean;
  /** Opcional: número de mazos (para mostrar "2 mazos") */
  decks?: number;
  /** Si es lote personalizado (100 cartas a elección) */
  custom?: boolean;
  /** Si es cubo (540 cartas) */
  cube?: boolean;
}

/**
 * Rutas de imágenes de ejemplo para el carousel de proxies.
 * Imágenes en /public/images/proxies/ del 1 al 18 (1.webp … 18.webp).
 */
export const PROXY_EXAMPLE_IMAGES: string[] = Array.from(
  { length: 18 },
  (_, i) => `/images/proxies/${i + 1}.webp`
);

export const PROXY_PROMOTIONS: ProxyPromotion[] = [
  {
    id: "deck-75",
    cardsCount: 75,
    price: 28000,
    freeShipping: false,
    decks: 1,
  },
  {
    id: "decks-2",
    cardsCount: 150,
    price: 55000,
    freeShipping: true,
    decks: 2,
  },
  {
    id: "decks-3",
    cardsCount: 225,
    price: 80000,
    freeShipping: true,
    decks: 3,
  },
  {
    id: "custom-100",
    cardsCount: 100,
    price: 40000,
    freeShipping: false,
    custom: true,
  },
  {
    id: "cube-540",
    cardsCount: 540,
    price: 165000,
    freeShipping: true,
    cube: true,
  },
];
