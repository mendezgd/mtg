# Funcionalidad de Importación de Mazos

## 🎯 Descripción

La funcionalidad de importación de mazos permite a los usuarios importar mazos desde sitios web externos como mtgdecks.net, TappedOut, y otros formatos similares directamente al Constructor de Mazos.

## ✨ Características

### 🔧 Funcionalidades Principales

- **Importación desde múltiples fuentes**: Compatible con mtgdecks.net, TappedOut, y cualquier formato que siga el patrón "cantidad + nombre"
- **Validación automática**: Solo importa cartas legales en el formato Premodern
- **Búsqueda inteligente**: Utiliza la API de Scryfall para encontrar cartas por nombre
- **Manejo de errores**: Ignora cartas no encontradas o ilegales sin interrumpir el proceso
- **Interfaz intuitiva**: Modal con campos claros y feedback visual

### 🎨 Interfaz de Usuario

#### Ubicación
- **Sección**: "Crear Nuevo Mazo" en el Constructor de Mazos
- **Botón**: "📥 Importar desde mtgdecks.net" (color púrpura)
- **Acceso**: Solo visible cuando no hay mazo seleccionado

#### Modal de Importación
- **Campo de nombre**: Para asignar un nombre al mazo importado
- **Área de texto**: Para pegar el contenido del mazo
- **Indicadores visuales**: Loading, mensajes de éxito/error
- **Información**: Guía de uso y limitaciones

## 📋 Formato de Entrada

### Formato Esperado
```
4 Lightning Bolt
2 Counterspell
1 Black Lotus
3 Dark Ritual
2 Duress

// Sideboard
2 Disenchant
1 Circle of Protection: Red
3 Pyroblast
```

### Reglas de Parsing
- **Patrón**: `cantidad + espacio + nombre de carta`
- **Cantidad**: Número entero positivo
- **Nombre**: Texto después del espacio hasta el final de la línea
- **Líneas vacías**: Se ignoran automáticamente
- **Duplicados**: Se suman las cantidades automáticamente
- **Sideboard**: Las cartas después de una línea en blanco se importan como sideboard

## 🔍 Proceso de Importación

### 1. Validación de Entrada
- Verifica que el nombre del mazo no esté vacío
- Verifica que el texto del mazo contenga contenido
- Valida el formato de cada línea

### 2. Búsqueda de Cartas
- Utiliza la API de Scryfall con búsqueda fuzzy
- URL: `https://api.scryfall.com/cards/named?fuzzy={cardName}`
- Maneja errores de red y cartas no encontradas

### 3. Filtrado de Legalidad
- Verifica `cardData.legalities?.premodern === "legal"` o `"restricted"`
- Ignora cartas ilegales en Premodern
- Registra advertencias en el log

### 4. Creación del Mazo
- Genera un nuevo mazo con ID único
- Asigna el nombre proporcionado
- Agrega las cartas válidas encontradas al mazo principal
- Agrega las cartas del sideboard (si existen)
- Selecciona automáticamente el mazo importado

## 🛠️ Implementación Técnica

### Componente Principal
```typescript
// DeckBuilder.tsx
const importDeck = useCallback(async (deckText: string, deckName: string) => {
  // Lógica de importación
}, [setDecks, setSelectedDeckId]);
```

### Estados del Componente
```typescript
const [showImportModal, setShowImportModal] = useState(false);
const [importText, setImportText] = useState("");
const [importDeckName, setImportDeckName] = useState("");
const [importing, setImporting] = useState(false);
const [importMessage, setImportMessage] = useState("");
```

### API de Scryfall
- **Endpoint**: `https://api.scryfall.com/cards/named?fuzzy={cardName}`
- **Método**: GET
- **Respuesta**: Datos completos de la carta incluyendo legalidades

## 📊 Manejo de Errores

### Tipos de Errores
1. **Cartas no encontradas**: Se ignoran y se registra en el log
2. **Cartas ilegales**: Se ignoran y se registra advertencia
3. **Errores de red**: Se manejan graciosamente
4. **Formato inválido**: Se muestran mensajes de error al usuario

### Logging
```typescript
logger.warn(`Card ${cardName} is not legal in Premodern`);
logger.warn(`Could not find card: ${cardName}`);
logger.error(`Error importing card ${cardName}:`, error);
logger.info("Imported deck:", newDeck.name, "with", mainDeckUnique, "main deck cards and", sideboardUnique, "sideboard cards");
```

## 🎯 Casos de Uso

### Escenario 1: Importación Exitosa
1. Usuario copia mazo de mtgdecks.net
2. Pega en el modal de importación
3. Asigna nombre al mazo
4. Sistema importa cartas válidas del mazo principal
5. Sistema detecta y importa cartas del sideboard (si existen)
6. Mazo se crea y selecciona automáticamente

### Escenario 2: Cartas Ilegales
1. Usuario importa mazo con cartas post-Premodern
2. Sistema filtra automáticamente las cartas ilegales
3. Solo se importan las cartas válidas
4. Se muestra mensaje de éxito con número de cartas importadas

### Escenario 3: Errores de Red
1. Problemas de conectividad con Scryfall
2. Sistema maneja errores graciosamente
3. Continúa con las cartas que sí se pudieron importar
4. Informa al usuario sobre el resultado

## 🔧 Personalización

### Colores y Estilos
- **Botón principal**: `bg-purple-600 hover:bg-purple-700`
- **Modal**: `bg-gray-900 border-gray-700`
- **Mensajes de éxito**: `bg-green-900/20 border-green-600 text-green-300`
- **Mensajes de error**: `bg-red-900/20 border-red-600 text-red-300`

### Configuración
- **Tiempo de timeout**: Configurable en la función fetch
- **User-Agent**: `MTG-Premodern/1.0`
- **Formato de respuesta**: JSON

## 📈 Métricas y Monitoreo

### Logs Importantes
- Número de cartas importadas exitosamente
- Cartas ignoradas por ilegalidad
- Cartas no encontradas
- Errores de red o API

### Feedback al Usuario
- Mensajes de estado durante la importación
- Contador de cartas importadas
- Información sobre cartas ignoradas

## 🚀 Futuras Mejoras

### Funcionalidades Potenciales
1. ✅ **Importación de sideboard**: Separar main deck y sideboard (IMPLEMENTADO)
2. **Múltiples formatos**: Soporte para más formatos de entrada
3. **Validación avanzada**: Verificar tamaño del mazo (60 cartas)
4. **Importación por URL**: Importar directamente desde URLs de mtgdecks.net
5. **Historial de importaciones**: Guardar mazos importados recientemente

### Optimizaciones Técnicas
1. **Caché de cartas**: Evitar búsquedas repetidas
2. **Importación en lote**: Procesar múltiples cartas simultáneamente
3. **Validación offline**: Base de datos local de cartas Premodern
4. **Progreso visual**: Barra de progreso durante importación

## 🔗 Enlaces Útiles

- **Scryfall API**: https://scryfall.com/docs/api
- **Formato Premodern**: https://premodernmagic.com/
- **mtgdecks.net**: https://mtgdecks.net/
- **TappedOut**: https://tappedout.net/

---

*Documentación actualizada: Diciembre 2024*
