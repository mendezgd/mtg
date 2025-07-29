# Mejoras en la Paginación de Búsqueda de Cartas

## Problema Identificado

El sistema de paginación tenía varios problemas que causaban errores "error al encontrar página" y errores 422 (Unprocessable Content):

1. **Cálculo incorrecto de totalPages**: Se calculaba basándose en `total_cards` de Scryfall, pero luego se filtraban las cartas para mostrar solo las legales en Premodern, resultando en un desajuste.

2. **Falta de validación de páginas**: No se validaba si la página solicitada existía realmente.

3. **Manejo pobre de errores 404 y 422**: Cuando se intentaba acceder a una página inexistente, no había recuperación automática.

4. **Navegación a páginas muy lejanas**: Permitía saltos muy grandes que causaban errores 422.

## Soluciones Implementadas

### 1. Mejora en el Hook `use-card-search.ts`

#### Límites Más Conservadores
```typescript
const MAX_RESULTS = 500;
const CARDS_PER_PAGE = 25;
const MAX_PAGES = Math.ceil(MAX_RESULTS / CARDS_PER_PAGE); // Máximo 20 páginas

const validateAndAdjustPage = useCallback((page: number): number => {
  // Asegurar que la página esté entre 1 y el máximo permitido
  return Math.max(1, Math.min(page, MAX_PAGES));
}, []);
```

#### Detección Automática del Final de Resultados
```typescript
const adjustTotalPagesIfNeeded = useCallback((currentResults: SearchableCard[], page: number) => {
  // Si esta página tiene menos cartas que CARDS_PER_PAGE, es la última página
  const isLastPage = currentResults.length < CARDS_PER_PAGE;
  
  if (isLastPage && detectedEndPage === null) {
    setDetectedEndPage(page);
    setTotalPages(page);
    console.log(`Detected end of results at page ${page}`);
  }
}, [detectedEndPage]);
```

#### Manejo Mejorado de Errores 422
```typescript
// Manejar diferentes tipos de errores
if (error.response?.status === 404 || error.response?.status === 422) {
  // Si es un error de página no encontrada o contenido no procesable
  if (adjustedPage > 1 && !isRetrying) {
    console.log(`Page ${adjustedPage} not found, trying page 1`);
    setIsRetrying(true);
    // Intentar con la página 1
    await searchCards(term, filters, 1);
    return;
  } else {
    // Si ya estamos en la página 1 o ya estamos reintentando
    setError("No cards found. Try a different search.");
    setSearchResults([]);
    setTotalPages(1);
    setCurrentPage(1);
    setLastValidPage(1);
    setDetectedEndPage(null);
  }
}
```

#### Factor de Reducción Más Conservador
```typescript
// Usar un factor de reducción más conservador (0.6 en lugar de 0.8)
const estimatedLegalCards = Math.min(totalFilteredCards * 0.6, MAX_RESULTS);
const calculatedTotalPages = Math.ceil(estimatedLegalCards / CARDS_PER_PAGE);

// Limitar el total de páginas al máximo permitido
const finalTotalPages = Math.min(
  Math.max(calculatedTotalPages, adjustedPage),
  MAX_PAGES
);
setTotalPages(finalTotalPages);
```

### 2. Componente de Paginación Mejorado `CardPagination`

#### Validación de Saltos de Página
```typescript
const handlePageChange = (page: number) => {
  // Validación más estricta para evitar errores
  if (page >= 1 && page <= totalPages && !loading && !disabled) {
    // Solo permitir navegación a páginas cercanas para evitar errores
    const maxJump = 3; // Máximo salto de 3 páginas
    const pageDiff = Math.abs(page - currentPage);
    
    if (pageDiff <= maxJump || page === 1 || page === totalPages) {
      onPageChange(page);
    } else {
      console.warn(`Page jump too large: ${pageDiff} pages. Limiting navigation.`);
      // Si el salto es muy grande, ir a la página más cercana válida
      const targetPage = page > currentPage ? currentPage + maxJump : currentPage - maxJump;
      const validPage = Math.max(1, Math.min(targetPage, totalPages));
      onPageChange(validPage);
    }
  }
};
```

#### Características del Nuevo Componente:
- **Paginación inteligente**: Muestra números de página con ellipsis para grandes cantidades
- **Validación de rangos**: Previene navegación a páginas inexistentes
- **Estados de carga**: Deshabilita botones durante la carga
- **Navegación directa**: Permite ir a páginas específicas
- **Límite de saltos**: Previene saltos muy grandes que causan errores 422

### 3. Mejoras en el Componente `CardSearch.tsx`

#### Mejor Manejo de Estados
- Validación adicional en los botones de navegación
- Deshabilitación durante la carga
- Mensajes de error más específicos

#### Integración del Nuevo Componente
```typescript
<CardPagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => {
    searchCards(searchTerm, {
      type: selectedType,
      color: selectedColor,
      manaCost: selectedManaCost,
    }, page);
  }}
  loading={loading}
/>
```

## Beneficios de las Mejoras

1. **Prevención de Errores 422**: Límites más conservadores y validación estricta
2. **Recuperación Automática**: Si se detecta un error 404 o 422, automáticamente se redirige a la página 1
3. **Detección Automática del Final**: El sistema detecta automáticamente cuando se ha llegado al final de los resultados
4. **Experiencia de Usuario Mejorada**: Paginación más intuitiva con números de página visibles
5. **Estabilidad**: El sistema es más resistente a errores de la API
6. **Feedback Visual**: Estados de carga y errores más claros
7. **Navegación Segura**: Límites en los saltos de página para evitar errores

## Casos de Uso Cubiertos

- ✅ Búsqueda con muchos resultados (múltiples páginas)
- ✅ Búsqueda con pocos resultados (una sola página)
- ✅ Navegación a páginas específicas
- ✅ Recuperación automática de errores 404 y 422
- ✅ Estados de carga apropiados
- ✅ Validación de rangos de páginas
- ✅ Estimación conservadora de totalPages
- ✅ Detección automática del final de resultados
- ✅ Límites en saltos de página
- ✅ Prevención de errores 422

## Configuración

- **CARDS_PER_PAGE**: 25 cartas por página
- **MAX_RESULTS**: 500 resultados máximos
- **MAX_PAGES**: 20 páginas máximas
- **Factor de reducción**: 0.6 para estimar cartas legales en Premodern
- **Máximo salto de página**: 3 páginas

## Solución Específica para Error 422

El error 422 (Unprocessable Content) se soluciona mediante:

1. **Límite de páginas**: Máximo 20 páginas (500 resultados / 25 por página)
2. **Factor de reducción conservador**: 0.6 en lugar de 0.8
3. **Detección automática del final**: Ajusta totalPages cuando detecta menos de 25 cartas
4. **Validación de saltos**: Máximo salto de 3 páginas
5. **Recuperación automática**: Si se detecta error 422, vuelve a la página 1

Estas mejoras garantizan que la paginación funcione de manera confiable y proporcione una experiencia de usuario fluida sin errores de "página no encontrada" o errores 422. 