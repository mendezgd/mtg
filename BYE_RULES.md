# 🎯 Reglas de Byes (Pase Libre) - Sistema de Torneos

## 📋 Reglas Implementadas

### ✅ Ronda 1 - Bye Aleatorio
- **Condición**: Solo si el número de jugadores es impar
- **Asignación**: Aleatoria entre todos los jugadores disponibles
- **Puntos**: 3 puntos (igual que una victoria)

### ✅ Rondas Posteriores - Bye al Último
- **Condición**: Solo si el número de jugadores es impar
- **Asignación**: Al jugador con menos puntos en la tabla
- **Restricción**: Solo si no ha recibido bye previamente
- **Puntos**: 3 puntos (igual que una victoria)

## 🎮 Sistema de Puntos

| Resultado | Puntos |
|-----------|--------|
| Victoria | 3 puntos |
| **Bye** | **3 puntos** |
| Empate | 1 punto |
| Derrota | 0 puntos |

## 🔧 Implementación Técnica

### Función `assignBye(roundNumber)`

```typescript
const assignBye = (roundNumber: number): string | null => {
  // Buscar jugadores que no han recibido bye en ninguna ronda anterior
  const availablePlayers = players.filter((p) => !p.hasBye);
  if (availablePlayers.length === 0) return null;

  if (roundNumber === 1) {
    // En la ronda 1: bye aleatorio si hay número impar de jugadores
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIndex].id;
  } else {
    // En rondas posteriores: bye al último en la tabla (menos puntos)
    const sortedPlayers = availablePlayers.sort((a, b) => {
      const pointsA = calculatePlayerPoints(a.id);
      const pointsB = calculatePlayerPoints(b.id);
      return pointsA - pointsB || a.seed - b.seed;
    });

    return sortedPlayers[0].id;
  }
};
```

### Función `calculatePlayerPoints(playerId)`

```typescript
const calculatePlayerPoints = (playerId: string): number => {
  const playerMatches = rounds
    .flatMap((r) => r.matches)
    .filter(
      (m) => (m.player1 === playerId || m.player2 === playerId) && m.completed
    );

  let totalPoints = 0;
  playerMatches.forEach((match) => {
    if (match.winner === playerId) {
      totalPoints += 3; // Victoria = 3 puntos (incluye bye)
    } else if (match.player1Wins === 1 && match.player2Wins === 1) {
      totalPoints += 1; // Empate = 1 punto
    }
    // Derrota = 0 puntos
  });

  return totalPoints;
};
```

## 📊 Ejemplo de Funcionamiento

### Escenario: 7 jugadores

**Ronda 1:**
- 6 jugadores emparejados (3 matches)
- 1 jugador recibe bye aleatorio
- Jugador con bye: +3 puntos

**Ronda 2:**
- 6 jugadores emparejados (3 matches)
- 1 jugador recibe bye (el de menos puntos que no haya tenido bye)
- Jugador con bye: +3 puntos

**Ronda 3:**
- 6 jugadores emparejados (3 matches)
- 1 jugador recibe bye (el de menos puntos que no haya tenido bye)
- Jugador con bye: +3 puntos

## ✅ Verificaciones Implementadas

### 1. Solo número impar de jugadores
```typescript
if (availablePlayers.length % 2 !== 0) {
  // Asignar bye solo si hay número impar
}
```

### 2. No repetir byes
```typescript
const availablePlayers = players.filter((p) => !p.hasBye);
```

### 3. Bye cuenta como victoria
```typescript
// En el match de bye:
{
  id: `match-${roundNumber}-bye`,
  player1: byePlayerId,
  player2: "", // Sin oponente
  completed: true,
  winner: byePlayerId, // Gana automáticamente
  games: {},
  player1Wins: 1,
  player2Wins: 0,
}
```

### 4. Puntos correctos para bye
```typescript
if (match.winner === playerId) {
  totalPoints += 3; // Victoria = 3 puntos (incluye bye)
}
```

## 🎯 Cumple con tus Especificaciones

- ✅ **Bye inicial aleatorio** - Solo en ronda 1, solo si número impar
- ✅ **Bye otorga 3 puntos** - Igual que una victoria
- ✅ **Bye después de ronda 1** - Al último en la tabla
- ✅ **No repetir byes** - Solo jugadores que no han recibido bye previamente
- ✅ **Sistema de puntos correcto** - Victoria/Empate/Derrota = 3/1/0 puntos

## 🔍 Casos de Prueba

### Caso 1: 5 jugadores
- Ronda 1: 4 emparejados + 1 bye aleatorio
- Ronda 2: 4 emparejados + 1 bye (el de menos puntos)
- Ronda 3: 4 emparejados + 1 bye (el de menos puntos)

### Caso 2: 6 jugadores
- No hay byes (número par)
- Todas las rondas: 6 jugadores emparejados

### Caso 3: 7 jugadores
- Ronda 1: 6 emparejados + 1 bye aleatorio
- Rondas 2+: 6 emparejados + 1 bye (último en tabla) 