import { useState, useEffect } from 'react';

type Player = {
  id: string;
  name: string;
  wins: number; // Puede ser decimal para empates (0.5)
  losses: number;
  points: number; // Puntos totales (3 por victoria, 1 por empate, 0 por derrota)
  seed: number;
  opponents: string[]; // IDs de oponentes anteriores
  hasBye: boolean; // Si el jugador recibió un bye
};

type Match = {
  id: string;
  player1: string; // ID del jugador
  player2: string; // ID del jugador
  winner?: string; // ID del ganador
  completed: boolean;
  games: {
    game1?: string; // ID del ganador del game 1
    game2?: string; // ID del ganador del game 2
    game3?: string; // ID del ganador del game 3 (si es necesario)
  };
  player1Wins: number;
  player2Wins: number;
};

type Round = {
  number: number;
  matches: Match[];
  startTime?: number;
  timeLimit: number; // en minutos
  isActive: boolean;
};

const SwissTournamentManager = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roundTimer, setRoundTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Agregar nuevo jugador
  const addPlayer = () => {
    if (!newPlayerName) return;
    
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: newPlayerName,
      wins: 0,
      losses: 0,
      points: 0,
      seed: players.length + 1,
      opponents: [],
      hasBye: false,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  // Remover jugador
  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  // Resetear torneo
  const resetTournament = () => {
    setPlayers([]);
    setRounds([]);
    setCurrentRound(0);
    setNewPlayerName('');
    if (roundTimer) {
      clearInterval(roundTimer);
      setRoundTimer(null);
    }
    setTimeRemaining(0);
  };

  // Iniciar temporizador de ronda
  const startRoundTimer = (roundNumber: number) => {
    const round = rounds.find(r => r.number === roundNumber);
    if (!round) return;

    const startTime = Date.now();
    const timeLimitMs = round.timeLimit * 60 * 1000; // Convertir a milisegundos

    // Actualizar la ronda como activa
    setRounds(rounds.map(r => 
      r.number === roundNumber 
        ? { ...r, isActive: true, startTime }
        : r
    ));

    // Iniciar temporizador
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Tiempo agotado - aplicar empate 1-0 a matches incompletos
        handleTimeUp(roundNumber);
        clearInterval(timer);
        setRoundTimer(null);
      }
    }, 1000);

    setRoundTimer(timer);
  };

  // Manejar tiempo agotado
  const handleTimeUp = (roundNumber: number) => {
    const round = rounds.find(r => r.number === roundNumber);
    if (!round) return;

    // Aplicar empate 1-0 a matches incompletos
    const updatedRounds = rounds.map(r => {
      if (r.number === roundNumber) {
        return {
          ...r,
          isActive: false,
          matches: r.matches.map(match => {
            if (!match.completed) {
              // Aplicar empate 1-0 (gana el jugador con seed más bajo)
              const winner = match.player1 < match.player2 ? match.player1 : match.player2;
              const loser = match.player1 < match.player2 ? match.player2 : match.player1;
              
              return {
                ...match,
                completed: true,
                winner,
                player1Wins: winner === match.player1 ? 1 : 0,
                player2Wins: winner === match.player2 ? 1 : 0,
              };
            }
            return match;
          })
        };
      }
      return r;
    });

    setRounds(updatedRounds);

    // Actualizar jugadores
    const updatedPlayers = players.map(player => {
      const playerMatches = updatedRounds
        .flatMap(r => r.matches)
        .filter(m => (m.player1 === player.id || m.player2 === player.id) && m.completed);
      
      let totalWins = 0;
      let totalLosses = 0;
      
      playerMatches.forEach(match => {
        if (match.winner === player.id) {
          totalWins += 1;
        } else if (match.winner && match.winner !== player.id) {
          totalLosses += 1;
        } else if (match.player1Wins === 1 && match.player2Wins === 1) {
          // Empate 1-1
          totalWins += 0.5;
        }
      });
      
      return {
        ...player,
        wins: totalWins,
        losses: totalLosses,
        points: calculatePlayerPoints(player.id),
      };
    });

    setPlayers(updatedPlayers);
    alert(`¡Tiempo agotado en la Ronda ${roundNumber}! Se aplicó empate 1-0 a matches incompletos.`);
  };

  // Calcular puntos totales de un jugador
  const calculatePlayerPoints = (playerId: string): number => {
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    const playerMatches = rounds.flatMap(r => r.matches)
      .filter(m => (m.player1 === playerId || m.player2 === playerId) && m.completed);
    
    let totalPoints = 0;
    playerMatches.forEach(match => {
      if (match.winner === playerId) {
        totalPoints += 3; // Victoria = 3 puntos (incluye bye)
      } else if (match.player1Wins === 1 && match.player2Wins === 1) {
        totalPoints += 1; // Empate = 1 punto
      }
      // Derrota = 0 puntos
    });

    return totalPoints;
  };

  // Calcular puntos de oponentes (Opp) - total de puntos de oponentes (excluyendo bye)
  const calculateOpp = (playerId: string): number => {
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    return player.opponents.reduce((total, opponentId) => {
      const opponent = players.find(p => p.id === opponentId);
      if (!opponent) return total;
      
      // Calcular puntos del oponente EXCLUYENDO el bye
      const opponentMatches = rounds.flatMap(r => r.matches)
        .filter(m => (m.player1 === opponentId || m.player2 === opponentId) && m.completed && !m.id.includes('-bye'));
      
      let opponentPoints = 0;
      opponentMatches.forEach(match => {
        if (match.winner === opponentId) {
          opponentPoints += 3; // Victoria = 3 puntos
        } else if (match.player1Wins === 1 && match.player2Wins === 1) {
          opponentPoints += 1; // Empate = 1 punto
        }
        // Derrota = 0 puntos
      });
      
      return total + opponentPoints;
    }, 0);
  };

  // Calcular porcentaje de juegos ganados (GW%)
  const calculateGameWinPercentage = (playerId: string): number => {
    const player = players.find(p => p.id === playerId);
    if (!player) return 0;

    let totalGames = 0;
    let gamesWon = 0;

    // Contar todos los games de todos los matches del jugador
    rounds.flatMap(r => r.matches)
      .filter(m => (m.player1 === playerId || m.player2 === playerId) && m.completed && !m.id.includes('-bye'))
      .forEach(match => {
        if (match.player1 === playerId) {
          totalGames += match.player1Wins + match.player2Wins;
          gamesWon += match.player1Wins;
        } else {
          totalGames += match.player1Wins + match.player2Wins;
          gamesWon += match.player2Wins;
        }
      });

    return totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
  };

  // Asignar bye a un jugador
  const assignBye = (roundNumber: number): string | null => {
    // Buscar jugador que no ha recibido bye en ninguna ronda anterior y tiene menos puntos
    const availablePlayers = players.filter(p => !p.hasBye);
    if (availablePlayers.length === 0) return null;

    // Ordenar por puntos (menos puntos primero) y luego por seed
    const sortedPlayers = availablePlayers.sort((a, b) => {
      const pointsA = calculatePlayerPoints(a.id);
      const pointsB = calculatePlayerPoints(b.id);
      return pointsA - pointsB || a.seed - b.seed;
    });

    console.log(`Ronda ${roundNumber}: Asignando bye a jugador ${sortedPlayers[0].name} (ID: ${sortedPlayers[0].id})`);
    return sortedPlayers[0].id;
  };

  // Actualizar puntos de todos los jugadores
  const updateAllPlayerPoints = () => {
    const updatedPlayers = players.map(player => ({
      ...player,
      points: calculatePlayerPoints(player.id)
    }));
    setPlayers(updatedPlayers);
  };

  // Verificar si un jugador ya recibió bye en una ronda específica
  const hasPlayerReceivedByeInRound = (playerId: string, roundNumber: number): boolean => {
    const round = rounds.find(r => r.number === roundNumber);
    if (!round) return false;
    
    return round.matches.some(match => 
      match.id.includes('-bye') && match.player1 === playerId
    );
  };

  // Calcular número de rondas basado en cantidad de jugadores
  const calculateTotalRounds = (playerCount: number): number => {
    if (playerCount < 4) return 0;
    if (playerCount <= 8) return 3;
    if (playerCount <= 16) return 4;
    if (playerCount <= 32) return 5;
    if (playerCount <= 64) return 6;
    if (playerCount <= 128) return 7;
    return Math.ceil(Math.log2(playerCount));
  };

  // Iniciar torneo
  const startTournament = () => {
    if (players.length < 4) {
      alert('Número de jugadores debe ser mínimo 4');
      return;
    }

    const totalRounds = calculateTotalRounds(players.length);
    const sortedPlayers = [...players].sort((a, b) => a.seed - b.seed);
    const round1 = generateAcceleratedPairings(sortedPlayers, 1);
    
    setRounds([round1]);
    setCurrentRound(1);
    
    // Iniciar temporizador para la primera ronda
    setTimeout(() => startRoundTimer(1), 1000);
    
    alert(`Torneo iniciado con ${players.length} jugadores.\nTotal de rondas: ${totalRounds}\nFormato: Best of 3 (BO3)\nTiempo por ronda: 50 minutos`);
  };

  // Generar emparejamientos acelerados
  const generateAcceleratedPairings = (playerList: Player[], roundNumber: number): Round => {
    const matches: Match[] = [];
    const availablePlayers = [...playerList]; // Copia para no modificar la lista original
    
    console.log(`Generando emparejamientos acelerados para ronda ${roundNumber}. Jugadores:`, availablePlayers.map(p => `${p.name} (seed: ${p.seed})`));
    
    // Si hay número impar de jugadores, asignar bye
    if (availablePlayers.length % 2 !== 0) {
      const byePlayerId = assignBye(roundNumber);
      if (byePlayerId) {
        // Marcar al jugador como que recibió bye
        setPlayers(players.map(p => 
          p.id === byePlayerId ? { ...p, hasBye: true } : p
        ));
        
        // Crear match especial para bye
        matches.push({
          id: `match-${roundNumber}-bye`,
          player1: byePlayerId,
          player2: '', // Sin oponente
          completed: true,
          winner: byePlayerId,
          games: {},
          player1Wins: 1,
          player2Wins: 0,
        });
        
        // NO agregar oponente a la lista de oponentes para bye
        // El bye no cuenta para Opp
        
        // Remover el jugador con bye de la lista disponible para emparejamientos
        const byeIndex = availablePlayers.findIndex(p => p.id === byePlayerId);
        if (byeIndex !== -1) {
          availablePlayers.splice(byeIndex, 1);
          console.log(`Jugador con bye removido de emparejamientos: ${byePlayerId}`);
        }
        
        console.log(`Jugadores restantes para emparejamientos: ${availablePlayers.length}`);
      }
    }

    // Emparejamientos acelerados: dividir en dos mitades y emparejar #1 vs #(N/2+1), #2 vs #(N/2+2), etc.
    const half = Math.ceil(availablePlayers.length / 2);
    console.log(`Dividiendo ${availablePlayers.length} jugadores en mitades de ${half}`);

    for (let i = 0; i < half; i++) {
      const player1 = availablePlayers[i];
      const player2 = availablePlayers[i + half];
      
      if (player1 && player2) {
        console.log(`Emparejando acelerado: ${player1.name} (seed: ${player1.seed}) vs ${player2.name} (seed: ${player2.seed})`);
        
        matches.push({
          id: `match-${roundNumber}-${i}`,
          player1: player1.id,
          player2: player2.id,
          completed: false,
          games: {},
          player1Wins: 0,
          player2Wins: 0,
        });
      }
    }

    return {
      number: roundNumber,
      matches,
      timeLimit: 50, // 50 minutos por ronda
      isActive: false,
    };
  };

  // Generar siguiente ronda
  const generateNextRound = () => {
    // Verificar que todos los matches de la ronda actual estén completos
    const currentRoundMatches = rounds.find(r => r.number === currentRound)?.matches || [];
    const incompleteMatches = currentRoundMatches.filter(m => !m.completed);
    
    if (incompleteMatches.length > 0) {
      alert(`No se puede generar la siguiente ronda. Hay ${incompleteMatches.length} partidos sin completar.`);
      return;
    }

    const totalRounds = calculateTotalRounds(players.length);
    if (currentRound >= totalRounds) {
      alert(`El torneo ha terminado después de ${totalRounds} rondas.`);
      return;
    }

    const nextRoundNumber = currentRound + 1;
    
    // Ordenar jugadores por puntos (de mayor a menor), luego por seed como desempate
    const sortedPlayers = [...players]
      .sort((a, b) => {
        const pointsA = calculatePlayerPoints(a.id);
        const pointsB = calculatePlayerPoints(b.id);
        return pointsB - pointsA || a.seed - b.seed;
      });
    
    console.log(`Generando ronda ${nextRoundNumber}. Jugadores disponibles:`, sortedPlayers.map(p => `${p.name} (${calculatePlayerPoints(p.id)} pts, ${p.wins}W-${p.losses}L, bye: ${p.hasBye})`));

    // Sistema suizo estándar después de la ronda 1
    const newMatches: Match[] = [];
    const availablePlayers = [...sortedPlayers];
    
    // Si hay número impar de jugadores, asignar bye
    if (availablePlayers.length % 2 !== 0) {
      const byePlayerId = assignBye(nextRoundNumber);
      if (byePlayerId) {
        // Marcar al jugador como que recibió bye
        setPlayers(players.map(p => 
          p.id === byePlayerId ? { ...p, hasBye: true } : p
        ));
        
        // Crear match especial para bye
        newMatches.push({
          id: `match-${nextRoundNumber}-bye`,
          player1: byePlayerId,
          player2: '', // Sin oponente
          completed: true,
          winner: byePlayerId,
          games: {},
          player1Wins: 1,
          player2Wins: 0,
        });
        
        // NO agregar oponente a la lista de oponentes para bye
        // El bye no cuenta para Opp
        
        // Remover el jugador con bye de la lista disponible para emparejamientos
        const byeIndex = availablePlayers.findIndex(p => p.id === byePlayerId);
        if (byeIndex !== -1) {
          availablePlayers.splice(byeIndex, 1);
          console.log(`Jugador con bye removido de emparejamientos: ${byePlayerId}`);
        }
        
        console.log(`Jugadores restantes para emparejamientos: ${availablePlayers.length}`);
      }
    }
    
    // Algoritmo suizo mejorado: emparejar por puntos similares
    while (availablePlayers.length > 1) {
      const player1 = availablePlayers.shift()!;
      const player1Points = calculatePlayerPoints(player1.id);
      
      // Buscar oponente con puntos similares que no haya enfrentado
      let bestOpponentIndex = -1;
      let bestOpponentScore = -1;
      
      for (let i = 0; i < availablePlayers.length; i++) {
        const potentialOpponent = availablePlayers[i];
        const opponentPoints = calculatePlayerPoints(potentialOpponent.id);
        
        // Verificar que no se hayan enfrentado antes
        if (!player1.opponents.includes(potentialOpponent.id)) {
          // Calcular score de compatibilidad (más alto = mejor emparejamiento)
          const pointDifference = Math.abs(player1Points - opponentPoints);
          const score = 1000 - pointDifference; // Priorizar emparejamientos con diferencia mínima de puntos
          
          if (score > bestOpponentScore) {
            bestOpponentScore = score;
            bestOpponentIndex = i;
          }
        }
      }
      
      // Si no hay oponente válido, tomar el primero disponible
      const opponentIndex = bestOpponentIndex !== -1 ? bestOpponentIndex : 0;
      const opponent = availablePlayers.splice(opponentIndex, 1)[0];
      
      console.log(`Emparejando: ${player1.name} (${player1Points} pts) vs ${opponent.name} (${calculatePlayerPoints(opponent.id)} pts)`);
      
      newMatches.push({
        id: `match-${nextRoundNumber}-${newMatches.length}`,
        player1: player1.id,
        player2: opponent.id,
        completed: false,
        games: {},
        player1Wins: 0,
        player2Wins: 0,
      });
    }

    const newRound = { 
      number: nextRoundNumber, 
      matches: newMatches,
      timeLimit: 50,
      isActive: false,
    };
    setRounds([...rounds, newRound]);
    setCurrentRound(nextRoundNumber);
    
    // Iniciar temporizador para la nueva ronda
    setTimeout(() => startRoundTimer(nextRoundNumber), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">🏆 Torneo Suizo MTG</h1>
      
      {/* Estado del torneo */}
      {currentRound > 0 && (
        <div className="mb-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">📊 Estado del Torneo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium">👥 Jugadores:</span> {players.length}
            </div>
            <div>
              <span className="font-medium">🔄 Ronda actual:</span> {currentRound} / {calculateTotalRounds(players.length)}
            </div>
            <div>
              <span className="font-medium">✅ Partidos jugados:</span> {rounds.flatMap(r => r.matches).filter(m => m.completed).length}
            </div>
            <div>
              <span className="font-medium">🎯 Total partidos:</span> {rounds.flatMap(r => r.matches).length}
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <span className="font-medium">📋 Formato:</span> Best of 3 (BO3) - Primer jugador en ganar 2 games gana el match
          </div>
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <span className="font-medium">🏆 Criterios de Desempate:</span> 1. Puntos | 2. Opp% | 3. GW% | 4. Seed
          </div>
          {players.length % 2 !== 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <span className="font-medium">🆓 Sistema Bye:</span> Jugador con menos puntos recibe bye automático (3 pts, no Opp)
            </div>
          )}
        </div>
      )}
      
      {/* Entrada de jugadores */}
      <div className="mb-8 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">👥 Jugadores</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nombre del jugador"
            className="flex-1 p-2 border border-gray-300 rounded text-gray-800"
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
          />
          <button 
            onClick={addPlayer}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          >
            ➕ Agregar
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {players.map(player => (
            <div key={player.id} className="p-3 bg-gray-50 border border-gray-200 rounded shadow-sm flex justify-between items-center">
              <span className="text-gray-800"><span className="font-medium text-gray-900">#{player.seed}</span> {player.name}</span>
              <button
                onClick={() => removePlayer(player.id)}
                className="text-red-500 hover:text-red-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-4">
                  <button
          onClick={startTournament}
          disabled={players.length < 4}
          className={`px-4 py-2 rounded transition-colors ${
            players.length < 4
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
            🚀 Iniciar Torneo
          </button>
          
          <button
            onClick={resetTournament}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            🔄 Resetear
          </button>
        </div>
      </div>

      {/* Layout principal con standings y rondas */}
      {currentRound > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings parciales */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📈 Standings Parciales</h2>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => {
                    const pointsA = calculatePlayerPoints(a.id);
                    const pointsB = calculatePlayerPoints(b.id);
                    if (pointsB !== pointsA) return pointsB - pointsA;
                    
                    const oppA = calculateOpp(a.id);
                    const oppB = calculateOpp(b.id);
                    if (oppB !== oppA) return oppB - oppA;
                    
                    const gwA = calculateGameWinPercentage(a.id);
                    const gwB = calculateGameWinPercentage(b.id);
                    if (gwB !== gwA) return gwB - gwA;
                    
                    return a.seed - b.seed; // Seed como último desempate
                  })
                  .map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`p-3 rounded-lg border ${
                        index === 0 ? 'bg-yellow-50 border-yellow-300' :
                        index === 1 ? 'bg-gray-50 border-gray-300' :
                        index === 2 ? 'bg-orange-50 border-orange-300' :
                        'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-orange-600' :
                            'text-gray-500'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-800">#{player.seed} {player.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">
                            {player.wins % 1 === 0 ? player.wins : player.wins.toFixed(1)}W - {player.losses}L
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculatePlayerPoints(player.id)} pts | Opp: {calculateOpp(player.id)} | GW: {calculateGameWinPercentage(player.id).toFixed(1)}%
                          </div>
                          {player.hasBye && (
                            <div className="text-xs text-blue-600 font-medium">
                              🆓 Bye (3 pts, no Opp)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Rondas */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">🎮 Ronda {currentRound}</h2>
              
              {/* Temporizador de ronda */}
              {rounds.find(r => r.number === currentRound)?.isActive && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">⏱️ Tiempo restante:</div>
                  <div className={`px-3 py-1 rounded-lg font-mono font-bold text-lg ${
                    timeRemaining <= 300000 ? 'bg-red-100 text-red-800' : // 5 minutos o menos
                    timeRemaining <= 600000 ? 'bg-yellow-100 text-yellow-800' : // 10 minutos o menos
                    'bg-green-100 text-green-800'
                  }`}>
                    {Math.floor(timeRemaining / 60000)}:{(Math.floor(timeRemaining / 1000) % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}
            </div>
            
            {rounds.map(round => (
              <div key={round.number} className="mb-6">
                <h3 className="font-medium mb-3 text-lg text-gray-700">Ronda {round.number}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {round.matches.map(match => {
                    const player1 = players.find(p => p.id === match.player1);
                    const player2 = players.find(p => p.id === match.player2);
                    
                    return (
                      <div 
                        key={match.id} 
                        className={`p-4 rounded-lg border shadow-sm ${
                          match.completed 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-800">⚔️ Partido {match.id.split('-')[2]}</span>
                          {match.completed && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full font-medium">
                              ✅ Finalizado
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {/* Score del match */}
                          <div className="text-center p-2 bg-gray-100 rounded border">
                            <span className="text-sm font-medium text-gray-700">
                              {match.player1Wins} - {match.player2Wins}
                            </span>
                            {match.completed && (
                              <div className="text-xs text-gray-500 mt-1">
                                {match.winner === match.player1 ? player1?.name : player2?.name} gana el match
                              </div>
                            )}
                          </div>

                          {/* Contadores de games */}
                          <div className="space-y-3">
                            <div className="text-center text-sm font-medium text-gray-700 mb-3">
                              Contadores de Games
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Player 1 Counter */}
                              <div className="p-3 bg-white rounded border">
                                <div className="text-center mb-2">
                                  <span className="text-gray-800 font-medium">#{player1?.seed} {player1?.name}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (match.player1Wins > 0) {
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, player1Wins: m.player1Wins - 1 }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={match.completed || match.player1Wins === 0}
                                    className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="text-2xl font-bold text-gray-800 min-w-[2rem] text-center">
                                    {match.player1Wins}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (match.player1Wins < 2 && !match.completed) {
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, player1Wins: m.player1Wins + 1 }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={match.completed || match.player1Wins >= 2}
                                    className="w-8 h-8 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Player 2 Counter */}
                              <div className="p-3 bg-white rounded border">
                                <div className="text-center mb-2">
                                  <span className="text-gray-800 font-medium">#{player2?.seed} {player2?.name}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (match.player2Wins > 0) {
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, player2Wins: m.player2Wins - 1 }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={match.completed || match.player2Wins === 0}
                                    className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="text-2xl font-bold text-gray-800 min-w-[2rem] text-center">
                                    {match.player2Wins}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (match.player2Wins < 2 && !match.completed) {
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, player2Wins: m.player2Wins + 1 }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={match.completed || match.player2Wins >= 2}
                                    className="w-8 h-8 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Botones de confirmación */}
                            {!match.completed && (match.player1Wins > 0 || match.player2Wins > 0) && (
                                                              <div className="text-center space-y-2">
                                  <button
                                    onClick={() => {
                                      // Verificar si hay un ganador (alguien llegó a 2)
                                      if (match.player1Wins === 2 || match.player2Wins === 2) {
                                        const winner = match.player1Wins === 2 ? match.player1 : match.player2;
                                        const loser = match.player1Wins === 2 ? match.player2 : match.player1;
                                        
                                        // Actualizar jugadores
                                        const updatedPlayers = players.map(player => {
                                          if (player.id === winner) {
                                            return { 
                                              ...player, 
                                              wins: player.wins + 1,
                                              points: calculatePlayerPoints(player.id) + 3,
                                              opponents: [...player.opponents, loser]
                                            };
                                          } else if (player.id === loser) {
                                            return { 
                                              ...player, 
                                              losses: player.losses + 1,
                                              points: calculatePlayerPoints(player.id),
                                              opponents: [...player.opponents, winner]
                                            };
                                          }
                                          return player;
                                        });
                                        setPlayers(updatedPlayers);
                                        
                                        // Marcar match como completado
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, completed: true, winner }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                      } else if (match.player1Wins === 1 && match.player2Wins === 1) {
                                        // Empate 1-1
                                        // Actualizar jugadores (ambos reciben 1 punto por empate)
                                        const updatedPlayers = players.map(player => {
                                          if (player.id === match.player1 || player.id === match.player2) {
                                            return { 
                                              ...player, 
                                              wins: player.wins + 0.5,
                                              points: calculatePlayerPoints(player.id) + 1,
                                              opponents: [...player.opponents, player.id === match.player1 ? match.player2 : match.player1]
                                            };
                                          }
                                          return player;
                                        });
                                        setPlayers(updatedPlayers);
                                        
                                        // Marcar match como completado (sin winner)
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, completed: true, winner: undefined }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                        
                                        alert(`Empate confirmado: 1 - 1\nAmbos jugadores reciben 1 punto.`);
                                      } else if (match.player1Wins === 1 || match.player2Wins === 1) {
                                        // Resultado parcial 1-0
                                        alert(`Score confirmado: ${match.player1Wins} - ${match.player2Wins}\nContinúa el match hasta que alguien llegue a 2 games o se declare empate 1-1.`);
                                      } else {
                                        alert(`Score confirmado: ${match.player1Wins} - ${match.player2Wins}\nContinúa el match.`);
                                      }
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    ✅ Confirmar Resultado
                                  </button>
                                  
                                  {/* Botón para declarar empate 1-1 */}
                                  {!match.completed && match.player1Wins === 1 && match.player2Wins === 1 && (
                                    <button
                                      onClick={() => {
                                        // Declarar empate 1-1 manualmente
                                        const updatedPlayers = players.map(player => {
                                          if (player.id === match.player1 || player.id === match.player2) {
                                            return { 
                                              ...player, 
                                              wins: player.wins + 0.5,
                                              points: calculatePlayerPoints(player.id) + 1,
                                              opponents: [...player.opponents, player.id === match.player1 ? match.player2 : match.player1]
                                            };
                                          }
                                          return player;
                                        });
                                        setPlayers(updatedPlayers);
                                        
                                        // Marcar match como completado (sin winner)
                                        const updatedRounds = rounds.map(round => ({
                                          ...round,
                                          matches: round.matches.map(m => 
                                            m.id === match.id 
                                              ? { ...m, completed: true, winner: undefined }
                                              : m
                                          ),
                                        }));
                                        setRounds(updatedRounds);
                                        
                                        alert(`Empate declarado: 1 - 1\nAmbos jugadores reciben 1 punto.`);
                                      }}
                                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                                    >
                                      🤝 Declarar Empate 1-1
                                    </button>
                                  )}
                                  
                                  <div className="text-xs text-gray-500 mt-1">
                                    Confirma el score actual o finaliza el match si hay ganador
                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={generateNextRound}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🔄 Siguiente Ronda
              </button>
              
              {currentRound > 0 && !rounds.find(r => r.number === currentRound)?.isActive && (
                <button
                  onClick={() => startRoundTimer(currentRound)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  ⏱️ Iniciar Temporizador
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clasificación final */}
      {players.some(p => p.wins > 0 || p.losses > 0) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🏅 Clasificación Final</h2>
          <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">#</th>
                  <th className="py-3 px-4 text-left font-medium">Jugador</th>
                  <th className="py-3 px-4 text-center font-medium">Victorias</th>
                  <th className="py-3 px-4 text-center font-medium">Derrotas</th>
                  <th className="py-3 px-4 text-center font-medium">Puntos</th>
                  <th className="py-3 px-4 text-center font-medium">Opp</th>
                  <th className="py-3 px-4 text-center font-medium">GW%</th>
                  <th className="py-3 px-4 text-center font-medium">Bye</th>
                </tr>
              </thead>
              <tbody>
                {[...players]
                  .sort((a, b) => {
                    const pointsA = calculatePlayerPoints(a.id);
                    const pointsB = calculatePlayerPoints(b.id);
                    if (pointsB !== pointsA) return pointsB - pointsA;
                    
                    const oppA = calculateOpp(a.id);
                    const oppB = calculateOpp(b.id);
                    if (oppB !== oppA) return oppB - oppA;
                    
                    const gwA = calculateGameWinPercentage(a.id);
                    const gwB = calculateGameWinPercentage(b.id);
                    if (gwB !== gwA) return gwB - gwA;
                    
                    return a.seed - b.seed; // Seed como último desempate
                  })
                  .map((player, index) => {
                    const totalGames = player.wins + player.losses;
                    const winPercentage = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : '0.0';
                    const gameWinPercentage = calculateGameWinPercentage(player.id);
                    
                    return (
                      <tr 
                        key={player.id} 
                        className={`${
                          index === 0 ? 'bg-yellow-50' :
                          index === 1 ? 'bg-gray-50' :
                          index === 2 ? 'bg-orange-50' :
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <td className="py-3 px-4 font-bold text-gray-800">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          #{player.seed} {player.name}
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                          {player.wins % 1 === 0 ? player.wins : player.wins.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center text-red-600 font-medium">{player.losses}</td>
                        <td className="py-3 px-4 text-center text-purple-600 font-bold">
                          {calculatePlayerPoints(player.id)}
                        </td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">{calculateOpp(player.id)}</td>
                        <td className="py-3 px-4 text-center text-indigo-600 font-medium">
                          {gameWinPercentage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 font-medium">
                          {player.hasBye ? '🆓 Bye' : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwissTournamentManager; 