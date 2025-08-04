import { useState, useEffect } from "react";

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

type PlayoffFormat = "top4" | "top8" | "top16" | "none";

type PlayoffMatch = {
  id: string;
  player1: string;
  player2: string;
  winner?: string;
  completed: boolean;
  games: {
    game1?: string;
    game2?: string;
    game3?: string;
  };
  player1Wins: number;
  player2Wins: number;
  round: number; // Ronda del playoff (1 = semifinales, 2 = finales, etc.)
  matchNumber: number; // Número del match en la ronda
};

type Playoff = {
  format: PlayoffFormat;
  matches: PlayoffMatch[];
  isActive: boolean;
  currentRound: number;
  totalRounds: number;
};

// Componente para mostrar matches del playoff
const PlayoffMatchCard = ({
  match,
  players,
  onComplete,
}: {
  match: PlayoffMatch;
  players: Player[];
  onComplete: (matchId: string, winner: string) => void;
}) => {
  const player1 = players.find((p) => p.id === match.player1);
  const player2 = players.find((p) => p.id === match.player2);

  if (!player1 || !player2) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-indigo-800">
          Match #{match.matchNumber} - Ronda {match.round}
        </h4>
        {match.completed && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
            ✅ Completado
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className={`p-3 rounded-lg border-2 ${
            match.winner === player1.id
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="font-semibold text-gray-800">
            #{player1.seed} {player1.name}
          </div>
          <div className="text-sm text-gray-600">
            Victorias: {match.player1Wins}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border-2 ${
            match.winner === player2.id
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="font-semibold text-gray-800">
            #{player2.seed} {player2.name}
          </div>
          <div className="text-sm text-gray-600">
            Victorias: {match.player2Wins}
          </div>
        </div>
      </div>

      {!match.completed && (
        <div className="flex gap-2">
          <button
            onClick={() => onComplete(match.id, player1.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Ganador: {player1.name}
          </button>
          <button
            onClick={() => onComplete(match.id, player2.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Ganador: {player2.name}
          </button>
        </div>
      )}

      {match.completed && match.winner && (
        <div className="bg-green-100 border border-green-300 rounded p-3">
          <div className="font-semibold text-green-800 text-center">
            🏆 Ganador: {players.find((p) => p.id === match.winner)?.name}
          </div>
        </div>
      )}
    </div>
  );
};

const SwissTournamentManager = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [roundTimer, setRoundTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isManualPairing, setIsManualPairing] = useState(false);
  const [manualMatches, setManualMatches] = useState<Match[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("");
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("");
  const [manualRounds, setManualRounds] = useState<number>(0);
  const [isManualRoundsEnabled, setIsManualRoundsEnabled] = useState(false);
  const [playoff, setPlayoff] = useState<Playoff | null>(null);
  const [showPlayoffOptions, setShowPlayoffOptions] = useState(false);

  // Agregar nuevo jugador
  const addPlayer = () => {
    if (!newPlayerName) return;

    const newPlayer: Player = {
      id: `player-${players.length + 1}-${newPlayerName.toLowerCase().replace(/\s+/g, '-')}`,
      name: newPlayerName,
      wins: 0,
      losses: 0,
      points: 0,
      seed: players.length + 1,
      opponents: [],
      hasBye: false,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
  };

  // Remover jugador
  const removePlayer = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  // Resetear torneo
  const resetTournament = () => {
    setPlayers([]);
    setRounds([]);
    setCurrentRound(0);
    setNewPlayerName("");
    if (roundTimer) {
      clearInterval(roundTimer);
      setRoundTimer(null);
    }
    setTimeRemaining(0);
    setIsManualPairing(false);
    setManualMatches([]);
    setSelectedPlayer1("");
    setSelectedPlayer2("");
    setIsManualRoundsEnabled(false);
    setManualRounds(0);
    setPlayoff(null);
    setShowPlayoffOptions(false);
  };

  // Iniciar temporizador de ronda
  const startRoundTimer = (roundNumber: number) => {
    const round = rounds.find((r) => r.number === roundNumber);
    if (!round) return;

    const startTime = Date.now();
    const timeLimitMs = round.timeLimit * 60 * 1000; // Convertir a milisegundos

    // Actualizar la ronda como activa
    setRounds(
      rounds.map((r) =>
        r.number === roundNumber ? { ...r, isActive: true, startTime } : r
      )
    );

    // Iniciar temporizador
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Tiempo agotado - solo avisar, no realizar acciones automáticas
        handleTimeUp(roundNumber);
        clearInterval(timer);
        setRoundTimer(null);
      }
    }, 1000);

    setRoundTimer(timer);
  };

  // Manejar tiempo agotado - solo avisar
  const handleTimeUp = (roundNumber: number) => {
    const round = rounds.find((r) => r.number === roundNumber);
    if (!round) return;

    // Solo marcar la ronda como inactiva y avisar
    setRounds(
      rounds.map((r) =>
        r.number === roundNumber ? { ...r, isActive: false } : r
      )
    );

    // Mostrar notificación de tiempo agotado
    alert(`¡Tiempo agotado en la Ronda ${roundNumber}!`);
  };

  // Calcular puntos totales de un jugador
  const calculatePlayerPoints = (playerId: string): number => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return 0;

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

  // Calcular puntos de oponentes (Opp) - total de puntos de oponentes (excluyendo bye)
  const calculateOpp = (playerId: string): number => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return 0;

    return player.opponents.reduce((total, opponentId) => {
      const opponent = players.find((p) => p.id === opponentId);
      if (!opponent) return total;

      // Calcular puntos del oponente EXCLUYENDO el bye
      const opponentMatches = rounds
        .flatMap((r) => r.matches)
        .filter(
          (m) =>
            (m.player1 === opponentId || m.player2 === opponentId) &&
            m.completed &&
            !m.id.includes("-bye")
        );

      let opponentPoints = 0;
      opponentMatches.forEach((match) => {
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

  // Calcular puntos reales (excluyendo bye) para desempate
  const calculateRealPoints = (playerId: string): number => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return 0;

    // Contar solo matches reales (excluyendo bye)
    const realMatches = rounds
      .flatMap((r) => r.matches)
      .filter(
        (m) =>
          (m.player1 === playerId || m.player2 === playerId) &&
          m.completed &&
          !m.id.includes("-bye")
      );

    let realPoints = 0;
    realMatches.forEach((match) => {
      if (match.winner === playerId) {
        realPoints += 3; // Victoria = 3 puntos
      } else if (match.player1Wins === 1 && match.player2Wins === 1) {
        realPoints += 1; // Empate = 1 punto
      }
      // Derrota = 0 puntos
    });

    return realPoints;
  };

  // Calcular número de victorias reales (excluyendo bye)
  const calculateRealWins = (playerId: string): number => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return 0;

    // Contar solo victorias en matches reales (excluyendo bye)
    const realMatches = rounds
      .flatMap((r) => r.matches)
      .filter(
        (m) =>
          (m.player1 === playerId || m.player2 === playerId) &&
          m.completed &&
          !m.id.includes("-bye")
      );

    return realMatches.filter((match) => match.winner === playerId).length;
  };

  // Calcular porcentaje de juegos ganados (GW%)
  const calculateGameWinPercentage = (playerId: string): number => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return 0;

    let totalGames = 0;
    let gamesWon = 0;

    // Contar todos los games de todos los matches del jugador
    rounds
      .flatMap((r) => r.matches)
      .filter(
        (m) =>
          (m.player1 === playerId || m.player2 === playerId) &&
          m.completed &&
          !m.id.includes("-bye")
      )
      .forEach((match) => {
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
    // Buscar jugadores que no han recibido bye en ninguna ronda anterior
    const availablePlayers = players.filter((p) => !p.hasBye);
    if (availablePlayers.length === 0) return null;

    if (roundNumber === 1) {
      // En la ronda 1: bye determinístico basado en el seed más alto
      // Esto evita problemas de hidratación con Math.random()
      const sortedBySeed = availablePlayers.sort((a, b) => b.seed - a.seed);
      return sortedBySeed[0].id;
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

  // Actualizar puntos de todos los jugadores
  const updateAllPlayerPoints = () => {
    const updatedPlayers = players.map((player) => ({
      ...player,
      points: calculatePlayerPoints(player.id),
    }));
    setPlayers(updatedPlayers);
  };

  // Verificar si un jugador ya recibió bye en una ronda específica
  const hasPlayerReceivedByeInRound = (
    playerId: string,
    roundNumber: number
  ): boolean => {
    const round = rounds.find((r) => r.number === roundNumber);
    if (!round) return false;

    return round.matches.some(
      (match) => match.id.includes("-bye") && match.player1 === playerId
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

  // Obtener número de rondas actual (manual o automático)
  const getCurrentTotalRounds = (): number => {
    if (isManualRoundsEnabled && manualRounds > 0) {
      return manualRounds;
    }
    return calculateTotalRounds(players.length);
  };

  // Validar número de rondas manual
  const validateManualRounds = (rounds: number): boolean => {
    const minRounds = Math.ceil(Math.log2(players.length));
    const maxRounds = Math.min(10, players.length - 1);

    if (rounds < minRounds) {
      alert(
        `El número mínimo de rondas para ${players.length} jugadores es ${minRounds}`
      );
      return false;
    }

    if (rounds > maxRounds) {
      alert(
        `El número máximo de rondas para ${players.length} jugadores es ${maxRounds}`
      );
      return false;
    }

    return true;
  };

  // Iniciar torneo
  const startTournament = () => {
    if (players.length < 4) {
      alert("Número de jugadores debe ser mínimo 4");
      return;
    }

    // Validar número de rondas manual si está habilitado
    if (isManualRoundsEnabled && !validateManualRounds(manualRounds)) {
      return;
    }

    const totalRounds = getCurrentTotalRounds();
    const sortedPlayers = [...players].sort((a, b) => a.seed - b.seed);
    const round1 = generateAcceleratedPairings(sortedPlayers, 1);

    setRounds([round1]);
    setCurrentRound(1);

    // Iniciar temporizador para la primera ronda
    setTimeout(() => startRoundTimer(1), 1000);

    alert(
      `Torneo iniciado con ${players.length} jugadores.\nTotal de rondas: ${totalRounds}\nFormato: Best of 3 (BO3)\nTiempo por ronda: 50 minutos`
    );
  };

  // Generar emparejamientos acelerados
  const generateAcceleratedPairings = (
    playerList: Player[],
    roundNumber: number
  ): Round => {
    const matches: Match[] = [];
    const availablePlayers = [...playerList]; // Copia para no modificar la lista original

    // Si hay número impar de jugadores, asignar bye
    if (availablePlayers.length % 2 !== 0) {
      const byePlayerId = assignBye(roundNumber);
      if (byePlayerId) {
        // Marcar al jugador como que recibió bye
        setPlayers(
          players.map((p) =>
            p.id === byePlayerId ? { ...p, hasBye: true } : p
          )
        );

        // Crear match especial para bye
        matches.push({
          id: `match-${roundNumber}-bye`,
          player1: byePlayerId,
          player2: "", // Sin oponente
          completed: true,
          winner: byePlayerId,
          games: {},
          player1Wins: 1,
          player2Wins: 0,
        });

        // NO agregar oponente a la lista de oponentes para bye
        // El bye no cuenta para Opp

        // Remover el jugador con bye de la lista disponible para emparejamientos
        const byeIndex = availablePlayers.findIndex(
          (p) => p.id === byePlayerId
        );
        if (byeIndex !== -1) {
          availablePlayers.splice(byeIndex, 1);
        }
      }
    }

    // Emparejamientos acelerados: dividir en dos mitades y emparejar #1 vs #(N/2+1), #2 vs #(N/2+2), etc.
    const half = Math.ceil(availablePlayers.length / 2);

    for (let i = 0; i < half; i++) {
      const player1 = availablePlayers[i];
      const player2 = availablePlayers[i + half];

      if (player1 && player2) {
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
    const currentRoundMatches =
      rounds.find((r) => r.number === currentRound)?.matches || [];
    const incompleteMatches = currentRoundMatches.filter((m) => !m.completed);

    if (incompleteMatches.length > 0) {
      alert(
        `No se puede generar la siguiente ronda. Hay ${incompleteMatches.length} partidos sin completar.`
      );
      return;
    }

    const totalRounds = getCurrentTotalRounds();
    if (currentRound >= totalRounds) {
      alert(`El torneo ha terminado después de ${totalRounds} rondas.`);
      return;
    }

    const nextRoundNumber = currentRound + 1;

    // Ordenar jugadores por puntos (de mayor a menor), luego por seed como desempate
    const sortedPlayers = [...players].sort((a, b) => {
      const pointsA = calculatePlayerPoints(a.id);
      const pointsB = calculatePlayerPoints(b.id);
      return pointsB - pointsA || a.seed - b.seed;
    });

    // Sistema suizo estándar después de la ronda 1
    const newMatches: Match[] = [];
    const availablePlayers = [...sortedPlayers];

    // Si hay número impar de jugadores, asignar bye
    if (availablePlayers.length % 2 !== 0) {
      const byePlayerId = assignBye(nextRoundNumber);
      if (byePlayerId) {
        // Marcar al jugador como que recibió bye
        setPlayers(
          players.map((p) =>
            p.id === byePlayerId ? { ...p, hasBye: true } : p
          )
        );

        // Crear match especial para bye
        newMatches.push({
          id: `match-${nextRoundNumber}-bye`,
          player1: byePlayerId,
          player2: "", // Sin oponente
          completed: true,
          winner: byePlayerId,
          games: {},
          player1Wins: 1,
          player2Wins: 0,
        });

        // Remover el jugador con bye de la lista disponible para emparejamientos
        const byeIndex = availablePlayers.findIndex(
          (p) => p.id === byePlayerId
        );
        if (byeIndex !== -1) {
          availablePlayers.splice(byeIndex, 1);
        }
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

  // Funciones para emparejamientos manuales
  const startManualPairing = () => {
    if (players.length < 2) {
      alert("Necesitas al menos 2 jugadores para crear emparejamientos");
      return;
    }

    setIsManualPairing(true);
    setManualMatches([]);
    setSelectedPlayer1("");
    setSelectedPlayer2("");
  };

  const cancelManualPairing = () => {
    setIsManualPairing(false);
    setManualMatches([]);
    setSelectedPlayer1("");
    setSelectedPlayer2("");
  };

  const addManualMatch = () => {
    if (
      !selectedPlayer1 ||
      !selectedPlayer2 ||
      selectedPlayer1 === selectedPlayer2
    ) {
      alert("Selecciona dos jugadores diferentes para crear el emparejamiento");
      return;
    }

    // Verificar que los jugadores no estén ya emparejados
    const player1AlreadyPaired = manualMatches.some(
      (m) => m.player1 === selectedPlayer1 || m.player2 === selectedPlayer1
    );
    const player2AlreadyPaired = manualMatches.some(
      (m) => m.player1 === selectedPlayer2 || m.player2 === selectedPlayer2
    );

    if (player1AlreadyPaired || player2AlreadyPaired) {
      alert("Uno o ambos jugadores ya están emparejados en esta ronda");
      return;
    }

    const newMatch: Match = {
      id: `manual-match-${manualMatches.length}`,
      player1: selectedPlayer1,
      player2: selectedPlayer2,
      completed: false,
      games: {},
      player1Wins: 0,
      player2Wins: 0,
    };

    setManualMatches([...manualMatches, newMatch]);
    setSelectedPlayer1("");
    setSelectedPlayer2("");
  };

  const removeManualMatch = (matchId: string) => {
    setManualMatches(manualMatches.filter((m) => m.id !== matchId));
  };

  const createManualRound = () => {
    if (manualMatches.length === 0) {
      alert("Agrega al menos un emparejamiento antes de crear la ronda");
      return;
    }

    // Validar número de rondas manual si está habilitado
    if (isManualRoundsEnabled && !validateManualRounds(manualRounds)) {
      return;
    }

    // Verificar que todos los jugadores estén emparejados (excepto si hay número impar)
    const pairedPlayers = new Set();
    manualMatches.forEach((match) => {
      pairedPlayers.add(match.player1);
      pairedPlayers.add(match.player2);
    });

    const unpairedPlayers = players.filter((p) => !pairedPlayers.has(p.id));

    if (unpairedPlayers.length > 1) {
      alert(
        `Hay ${unpairedPlayers.length} jugadores sin emparejar: ${unpairedPlayers.map((p) => p.name).join(", ")}`
      );
      return;
    }

    // Si hay un jugador sin emparejar, asignarle bye
    if (unpairedPlayers.length === 1) {
      const byePlayer = unpairedPlayers[0];
      const byeMatch: Match = {
        id: `manual-match-bye`,
        player1: byePlayer.id,
        player2: "",
        completed: true,
        winner: byePlayer.id,
        games: {},
        player1Wins: 1,
        player2Wins: 0,
      };
      manualMatches.push(byeMatch);

      // Marcar al jugador como que recibió bye
      setPlayers(
        players.map((p) => (p.id === byePlayer.id ? { ...p, hasBye: true } : p))
      );
    }

    const nextRoundNumber = currentRound === 0 ? 1 : currentRound + 1;
    const newRound: Round = {
      number: nextRoundNumber,
      matches: manualMatches,
      timeLimit: 50,
      isActive: false,
    };

    if (currentRound === 0) {
      // Primera ronda
      setRounds([newRound]);
      setCurrentRound(1);
    } else {
      // Rondas posteriores
      setRounds([...rounds, newRound]);
      setCurrentRound(nextRoundNumber);
    }

    setIsManualPairing(false);
    setManualMatches([]);
    setSelectedPlayer1("");
    setSelectedPlayer2("");

    // Iniciar temporizador para la nueva ronda
    setTimeout(() => startRoundTimer(nextRoundNumber), 1000);

    alert(
      `Ronda ${nextRoundNumber} creada manualmente con ${manualMatches.length} emparejamientos`
    );
  };

  // Funciones para el sistema de playoffs
  const generatePlayoff = (format: PlayoffFormat) => {
    try {
      if (format === "none") {
        setPlayoff(null);
        setShowPlayoffOptions(false);
        return;
      }

      // Obtener los mejores jugadores según el formato
      const topPlayers = getTopPlayers(format);

      if (topPlayers.length < 2) {
        alert("No hay suficientes jugadores para generar el playoff");
        return;
      }

      // Calcular número de rondas del playoff
      const totalRounds = Math.log2(topPlayers.length);

      if (!isFinite(totalRounds) || totalRounds <= 0) {
        alert("Error al calcular el número de rondas del playoff");
        return;
      }

      // Generar emparejamientos del playoff
      const matches = generatePlayoffMatches(topPlayers, totalRounds);

      if (matches.length === 0) {
        alert("Error al generar los emparejamientos del playoff");
        return;
      }

      const newPlayoff: Playoff = {
        format,
        matches,
        isActive: true,
        currentRound: 1,
        totalRounds,
      };

      setPlayoff(newPlayoff);
      setShowPlayoffOptions(false);

      alert(
        `Playoff ${format.toUpperCase()} generado con ${topPlayers.length} jugadores y ${totalRounds} rondas`
      );
    } catch (error) {
      console.error("Error al generar playoff:", error);
      alert(
        "Error interno al generar el playoff. Por favor, intenta de nuevo."
      );
    }
  };

  const getTopPlayers = (format: PlayoffFormat): Player[] => {
    try {
      if (!players || players.length === 0) {
        return [];
      }

      const sortedPlayers = [...players].sort((a, b) => {
        const pointsA = calculatePlayerPoints(a.id);
        const pointsB = calculatePlayerPoints(b.id);
        if (pointsB !== pointsA) return pointsB - pointsA;

        const realWinsA = calculateRealWins(a.id);
        const realWinsB = calculateRealWins(b.id);
        if (realWinsB !== realWinsA) return realWinsB - realWinsA;

        const oppA = calculateOpp(a.id);
        const oppB = calculateOpp(b.id);
        if (oppB !== oppA) return oppB - oppA;

        const gwA = calculateGameWinPercentage(a.id);
        const gwB = calculateGameWinPercentage(b.id);
        if (gwB !== gwA) return gwB - gwA;

        return a.seed - b.seed;
      });

      switch (format) {
        case "top4":
          return sortedPlayers.slice(0, 4);
        case "top8":
          return sortedPlayers.slice(0, 8);
        case "top16":
          return sortedPlayers.slice(0, 16);
        default:
          return [];
      }
    } catch (error) {
      console.error("Error al obtener top players:", error);
      return [];
    }
  };

  const generatePlayoffMatches = (
    players: Player[],
    totalRounds: number
  ): PlayoffMatch[] => {
    const matches: PlayoffMatch[] = [];

    // Primera ronda: emparejamientos 1vs8, 2vs7, 3vs6, 4vs5 (para top8)
    const firstRoundMatches = Math.ceil(players.length / 2);

    for (let i = 0; i < firstRoundMatches; i++) {
      const player1 = players[i];
      const player2 = players[players.length - 1 - i];

      if (player1 && player2) {
        matches.push({
          id: `playoff-1-${i}`,
          player1: player1.id,
          player2: player2.id,
          completed: false,
          games: {},
          player1Wins: 0,
          player2Wins: 0,
          round: 1,
          matchNumber: i + 1,
        });
      }
    }

    return matches;
  };

  const advancePlayoffRound = () => {
    if (!playoff) return;

    // Verificar que todos los matches de la ronda actual estén completos
    const currentRoundMatches = playoff.matches.filter(
      (m) => m.round === playoff.currentRound
    );
    const incompleteMatches = currentRoundMatches.filter((m) => !m.completed);

    if (incompleteMatches.length > 0) {
      alert(
        `No se puede avanzar. Hay ${incompleteMatches.length} partidos sin completar en la ronda ${playoff.currentRound}.`
      );
      return;
    }

    if (playoff.currentRound >= playoff.totalRounds) {
      alert("El playoff ha terminado. ¡Tenemos un ganador!");
      return;
    }

    // Generar matches para la siguiente ronda
    const winners = currentRoundMatches
      .filter((m) => m.winner)
      .map((m) => players.find((p) => p.id === m.winner)!)
      .filter(Boolean);

    const nextRound = playoff.currentRound + 1;
    const newMatches: PlayoffMatch[] = [];

    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        newMatches.push({
          id: `playoff-${nextRound}-${i / 2}`,
          player1: winners[i].id,
          player2: winners[i + 1].id,
          completed: false,
          games: {},
          player1Wins: 0,
          player2Wins: 0,
          round: nextRound,
          matchNumber: Math.floor(i / 2) + 1,
        });
      }
    }

    setPlayoff({
      ...playoff,
      matches: [...playoff.matches, ...newMatches],
      currentRound: nextRound,
    });

    alert(`Avanzando a la ronda ${nextRound} del playoff`);
  };

  const completePlayoffMatch = (matchId: string, winner: string) => {
    if (!playoff) return;

    const updatedMatches = playoff.matches.map((match) =>
      match.id === matchId ? { ...match, completed: true, winner } : match
    );

    setPlayoff({
      ...playoff,
      matches: updatedMatches,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        🏆 Posada MTG Torneo
      </h1>

      {/* Estado del torneo */}
      {currentRound > 0 && (
        <div className="mb-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            📊 Estado del Torneo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium">👥 Jugadores:</span>{" "}
              {players.length}
            </div>
            <div>
              <span className="font-medium">🔄 Ronda actual:</span>{" "}
              {currentRound} / {getCurrentTotalRounds()}
            </div>
            <div>
              <span className="font-medium">✅ Partidos jugados:</span>{" "}
              {
                rounds.flatMap((r) => r.matches).filter((m) => m.completed)
                  .length
              }
            </div>
            <div>
              <span className="font-medium">🎯 Total partidos:</span>{" "}
              {rounds.flatMap((r) => r.matches).length}
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <span className="font-medium">📋 Formato:</span> Best of 3 (BO3) -
            Primer jugador en ganar 2 games gana el match
          </div>
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <span className="font-medium">🏆 Criterios de Desempate:</span> 1.
            Puntos | 2. Victorias Reales | 3. Opp% | 4. GW% | 5. Seed
          </div>
          {players.length % 2 !== 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <span className="font-medium">🆓 Sistema Bye:</span> Jugador con
              menos puntos recibe bye automático (3 pts, no Opp)
            </div>
          )}
        </div>
      )}

      {/* Entrada de jugadores */}
      <div className="mb-8 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          👥 Jugadores
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nombre del jugador"
            className="flex-1 p-2 border border-gray-300 rounded text-gray-800 text-sm sm:text-base"
            onKeyPress={(e) => e.key === "Enter" && addPlayer()}
          />
          <button
            onClick={addPlayer}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors text-sm sm:text-base"
          >
            ➕ Agregar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="p-3 bg-gray-50 border border-gray-200 rounded shadow-sm flex justify-between items-center"
            >
              <span className="text-gray-800 text-sm sm:text-base truncate">
                <span className="font-medium text-gray-900">
                  #{player.seed}
                </span>{" "}
                {player.name}
              </span>
              <button
                onClick={() => removePlayer(player.id)}
                className="text-red-500 hover:text-red-700 text-sm font-bold ml-2 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Configuración de rondas */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">
            ⚙️ Configuración de Rondas
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manualRounds"
                checked={isManualRoundsEnabled}
                onChange={(e) => {
                  setIsManualRoundsEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setManualRounds(0);
                  } else {
                    setManualRounds(calculateTotalRounds(players.length));
                  }
                }}
                className="w-4 h-4 text-blue-600"
              />
              <label
                htmlFor="manualRounds"
                className="text-sm font-medium text-gray-700"
              >
                Número de rondas manual
              </label>
            </div>

            {isManualRoundsEnabled && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Rondas:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={manualRounds}
                  onChange={(e) =>
                    setManualRounds(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 p-1 border border-gray-300 rounded text-gray-800 text-center"
                />
              </div>
            )}

            <div className="text-sm text-gray-600">
              {isManualRoundsEnabled
                ? `Manual: ${manualRounds} rondas`
                : `Automático: ${calculateTotalRounds(players.length)} rondas (${players.length} jugadores)`}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={startTournament}
            disabled={players.length < 4}
            className={`px-4 py-2 rounded transition-colors text-sm sm:text-base ${
              players.length < 4
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            🚀 Iniciar Torneo
          </button>

          {players.length >= 2 && (
            <button
              onClick={startManualPairing}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm sm:text-base"
            >
              ✋ Emparejamiento Manual
            </button>
          )}

          <button
            onClick={resetTournament}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors text-sm sm:text-base"
          >
            🔄 Resetear
          </button>
        </div>
      </div>

      {/* Layout principal con standings y rondas */}
      {currentRound > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Standings parciales */}
          <div className="xl:col-span-1">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📈 Standings Parciales
              </h2>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => {
                    const pointsA = calculatePlayerPoints(a.id);
                    const pointsB = calculatePlayerPoints(b.id);
                    if (pointsB !== pointsA) return pointsB - pointsA;

                    // Si tienen los mismos puntos totales, priorizar victorias reales sobre bye + victoria
                    const realWinsA = calculateRealWins(a.id);
                    const realWinsB = calculateRealWins(b.id);
                    if (realWinsB !== realWinsA) return realWinsB - realWinsA;

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
                        index === 0
                          ? "bg-yellow-50 border-yellow-300"
                          : index === 1
                            ? "bg-gray-50 border-gray-300"
                            : index === 2
                              ? "bg-orange-50 border-orange-300"
                              : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              index === 0
                                ? "text-yellow-600"
                                : index === 1
                                  ? "text-gray-600"
                                  : index === 2
                                    ? "text-orange-600"
                                    : "text-gray-500"
                            }`}
                          >
                            #{index + 1}
                          </span>
                          <span className="font-medium text-gray-800">
                            #{player.seed} {player.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">
                            {player.wins % 1 === 0
                              ? player.wins
                              : player.wins.toFixed(1)}
                            W - {player.losses}L
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculatePlayerPoints(player.id)} pts | Real:{" "}
                            {calculateRealWins(player.id)}W | Opp:{" "}
                            {calculateOpp(player.id)} | GW:{" "}
                            {calculateGameWinPercentage(player.id).toFixed(1)}%
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
          <div className="xl:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🎮 Ronda {currentRound}
              </h2>

              {/* Temporizador de ronda */}
              {rounds.find((r) => r.number === currentRound)?.isActive && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    ⏱️ Tiempo restante:
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg font-mono font-bold text-lg ${
                      timeRemaining <= 300000
                        ? "bg-red-100 text-red-800" // 5 minutos o menos
                        : timeRemaining <= 600000
                          ? "bg-yellow-100 text-yellow-800" // 10 minutos o menos
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {Math.floor(timeRemaining / 60000)}:
                    {(Math.floor(timeRemaining / 1000) % 60)
                      .toString()
                      .padStart(2, "0")}
                  </div>
                </div>
              )}
            </div>

            {rounds.map((round) => (
              <div key={round.number} className="mb-6">
                <h3 className="font-medium mb-3 text-lg text-gray-700">
                  Ronda {round.number}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {round.matches.map((match) => {
                    const player1 = players.find((p) => p.id === match.player1);
                    const player2 = players.find((p) => p.id === match.player2);

                    return (
                      <div
                        key={match.id}
                        className={`p-4 rounded-lg border shadow-sm ${
                          match.completed
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-800">
                            ⚔️ Partido {match.id.split("-")[2]}
                          </span>
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
                                {match.winner === match.player1
                                  ? player1?.name
                                  : player2?.name}{" "}
                                gana el match
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
                                  <span className="text-gray-800 font-medium">
                                    #{player1?.seed} {player1?.name}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                  <button
                                    onClick={() => {
                                      if (match.player1Wins > 0) {
                                        const updatedRounds = rounds.map(
                                          (round) => ({
                                            ...round,
                                            matches: round.matches.map((m) =>
                                              m.id === match.id
                                                ? {
                                                    ...m,
                                                    player1Wins:
                                                      m.player1Wins - 1,
                                                  }
                                                : m
                                            ),
                                          })
                                        );
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={
                                      match.completed || match.player1Wins === 0
                                    }
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm sm:text-base"
                                  >
                                    -
                                  </button>
                                  <span className="text-lg sm:text-2xl font-bold text-gray-800 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                                    {match.player1Wins}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (
                                        match.player1Wins < 2 &&
                                        !match.completed
                                      ) {
                                        const updatedRounds = rounds.map(
                                          (round) => ({
                                            ...round,
                                            matches: round.matches.map((m) =>
                                              m.id === match.id
                                                ? {
                                                    ...m,
                                                    player1Wins:
                                                      m.player1Wins + 1,
                                                  }
                                                : m
                                            ),
                                          })
                                        );
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={
                                      match.completed || match.player1Wins >= 2
                                    }
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm sm:text-base"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Player 2 Counter */}
                              <div className="p-3 bg-white rounded border">
                                <div className="text-center mb-2">
                                  <span className="text-gray-800 font-medium">
                                    #{player2?.seed} {player2?.name}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                  <button
                                    onClick={() => {
                                      if (match.player2Wins > 0) {
                                        const updatedRounds = rounds.map(
                                          (round) => ({
                                            ...round,
                                            matches: round.matches.map((m) =>
                                              m.id === match.id
                                                ? {
                                                    ...m,
                                                    player2Wins:
                                                      m.player2Wins - 1,
                                                  }
                                                : m
                                            ),
                                          })
                                        );
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={
                                      match.completed || match.player2Wins === 0
                                    }
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm sm:text-base"
                                  >
                                    -
                                  </button>
                                  <span className="text-lg sm:text-2xl font-bold text-gray-800 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                                    {match.player2Wins}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (
                                        match.player2Wins < 2 &&
                                        !match.completed
                                      ) {
                                        const updatedRounds = rounds.map(
                                          (round) => ({
                                            ...round,
                                            matches: round.matches.map((m) =>
                                              m.id === match.id
                                                ? {
                                                    ...m,
                                                    player2Wins:
                                                      m.player2Wins + 1,
                                                  }
                                                : m
                                            ),
                                          })
                                        );
                                        setRounds(updatedRounds);
                                      }
                                    }}
                                    disabled={
                                      match.completed || match.player2Wins >= 2
                                    }
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm sm:text-base"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Botones de confirmación */}
                            {!match.completed &&
                              (match.player1Wins > 0 ||
                                match.player2Wins > 0) && (
                                <div className="text-center space-y-2">
                                  <button
                                    onClick={() => {
                                      // Verificar si hay un ganador (alguien llegó a 2)
                                      if (
                                        match.player1Wins === 2 ||
                                        match.player2Wins === 2
                                      ) {
                                        const winner =
                                          match.player1Wins === 2
                                            ? match.player1
                                            : match.player2;
                                        const loser =
                                          match.player1Wins === 2
                                            ? match.player2
                                            : match.player1;

                                        // Actualizar jugadores
                                        const updatedPlayers = players.map(
                                          (player) => {
                                            if (player.id === winner) {
                                              return {
                                                ...player,
                                                wins: player.wins + 1,
                                                points:
                                                  calculatePlayerPoints(
                                                    player.id
                                                  ) + 3,
                                                opponents: [
                                                  ...player.opponents,
                                                  loser,
                                                ],
                                              };
                                            } else if (player.id === loser) {
                                              return {
                                                ...player,
                                                losses: player.losses + 1,
                                                points: calculatePlayerPoints(
                                                  player.id
                                                ),
                                                opponents: [
                                                  ...player.opponents,
                                                  winner,
                                                ],
                                              };
                                            }
                                            return player;
                                          }
                                        );
                                        setPlayers(updatedPlayers);

                                        // Marcar match como completado
                                        const updatedRounds = rounds.map(
                                          (round) => ({
                                            ...round,
                                            matches: round.matches.map((m) =>
                                              m.id === match.id
                                                ? {
                                                    ...m,
                                                    completed: true,
                                                    winner,
                                                  }
                                                : m
                                            ),
                                          })
                                        );
                                        setRounds(updatedRounds);
                                      } else if (
                                        match.player1Wins === 1 &&
                                        match.player2Wins === 1
                                      ) {
                                        // Empate 1-1
                                        // Actualizar jugadores (ambos reciben 1 punto por empate)
                                        const updatedPlayers = players.map(
                                          (player) => {
                                            if (
                                              player.id === match.player1 ||
                                              player.id === match.player2
                                            ) {
                                              return {
                                                ...player,
                                                wins: player.wins + 0.5,
                                                points:
                                                  calculatePlayerPoints(
                                                    player.id
                                                  ) + 1,
                                                opponents: [
                                                  ...player.opponents,
                                                  player.id === match.player1
                                                    ? match.player2
                                                    : match.player1,
                                                ],
                                              };
                                            }
                                            return player;
                                          }
                                        );
                                        setPlayers(updatedPlayers);

                                        // Marcar match como completado (sin winner)
                                        const updatedRounds = rounds.map(
                                          (round) => ({
                                            ...round,
                                            matches: round.matches.map((m) =>
                                              m.id === match.id
                                                ? {
                                                    ...m,
                                                    completed: true,
                                                    winner: undefined,
                                                  }
                                                : m
                                            ),
                                          })
                                        );
                                        setRounds(updatedRounds);

                                        alert(
                                          `Empate confirmado: 1 - 1\nAmbos jugadores reciben 1 punto.`
                                        );
                                      } else if (
                                        match.player1Wins === 1 ||
                                        match.player2Wins === 1
                                      ) {
                                        // Resultado parcial 1-0
                                        alert(
                                          `Score confirmado: ${match.player1Wins} - ${match.player2Wins}\nContinúa el match hasta que alguien llegue a 2 games o se declare empate 1-1.`
                                        );
                                      } else {
                                        alert(
                                          `Score confirmado: ${match.player1Wins} - ${match.player2Wins}\nContinúa el match.`
                                        );
                                      }
                                    }}
                                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                                  >
                                    ✅ Confirmar Resultado
                                  </button>

                                  {/* Botón para declarar empate 1-1 */}
                                  {!match.completed &&
                                    match.player1Wins === 1 &&
                                    match.player2Wins === 1 && (
                                      <button
                                        onClick={() => {
                                          // Declarar empate 1-1 manualmente
                                          const updatedPlayers = players.map(
                                            (player) => {
                                              if (
                                                player.id === match.player1 ||
                                                player.id === match.player2
                                              ) {
                                                return {
                                                  ...player,
                                                  wins: player.wins + 0.5,
                                                  points:
                                                    calculatePlayerPoints(
                                                      player.id
                                                    ) + 1,
                                                  opponents: [
                                                    ...player.opponents,
                                                    player.id === match.player1
                                                      ? match.player2
                                                      : match.player1,
                                                  ],
                                                };
                                              }
                                              return player;
                                            }
                                          );
                                          setPlayers(updatedPlayers);

                                          // Marcar match como completado (sin winner)
                                          const updatedRounds = rounds.map(
                                            (round) => ({
                                              ...round,
                                              matches: round.matches.map((m) =>
                                                m.id === match.id
                                                  ? {
                                                      ...m,
                                                      completed: true,
                                                      winner: undefined,
                                                    }
                                                  : m
                                              ),
                                            })
                                          );
                                          setRounds(updatedRounds);

                                          alert(
                                            `Empate declarado: 1 - 1\nAmbos jugadores reciben 1 punto.`
                                          );
                                        }}
                                        className="px-4 sm:px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm sm:text-base"
                                      >
                                        🤝 Declarar Empate 1-1
                                      </button>
                                    )}

                                  <div className="text-xs text-gray-500 mt-1">
                                    Confirma el score actual o finaliza el match
                                    si hay ganador
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

            <div className="flex flex-col sm:flex-row gap-2 mt-4 mb-4">
              {currentRound > 0 && (
                <button
                  onClick={generateNextRound}
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
                >
                  🔄 Siguiente Ronda
                </button>
              )}

              {players.length >= 2 && (
                <button
                  onClick={startManualPairing}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                >
                  ✋ Emparejamiento Manual
                </button>
              )}

              {currentRound > 0 &&
                !rounds.find((r) => r.number === currentRound)?.isActive && (
                  <button
                    onClick={() => startRoundTimer(currentRound)}
                    className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    ⏱️ Iniciar Temporizador
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Interfaz de emparejamientos manuales */}
      {isManualPairing && (
        <div className="mt-8 p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              ✋ Emparejamiento Manual - Ronda{" "}
              {currentRound === 0 ? 1 : currentRound + 1}
            </h2>
            <button
              onClick={cancelManualPairing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>

          {currentRound === 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              💡 <strong>Primera Ronda:</strong> Puedes crear emparejamientos
              personalizados o seguir las reglas suizas tradicionales
            </div>
          )}

          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            📊 <strong>Configuración de Rondas:</strong>{" "}
            {isManualRoundsEnabled
              ? `Manual: ${manualRounds} rondas totales`
              : `Automático: ${calculateTotalRounds(players.length)} rondas (${players.length} jugadores)`}
            {currentRound > 0 && (
              <div className="mt-1">
                📈 <strong>Progreso:</strong> Ronda {currentRound} de{" "}
                {getCurrentTotalRounds()}
              </div>
            )}
          </div>

          {/* Selector de jugadores */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">
              Crear Emparejamiento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugador 1
                </label>
                <select
                  value={selectedPlayer1}
                  onChange={(e) => setSelectedPlayer1(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 text-sm sm:text-base"
                >
                  <option value="">Seleccionar jugador</option>
                  {players
                    .filter(
                      (p) =>
                        !manualMatches.some(
                          (m) => m.player1 === p.id || m.player2 === p.id
                        )
                    )
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        #{player.seed} {player.name} (
                        {calculatePlayerPoints(player.id)} pts)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-end justify-center">
                <span className="text-xl sm:text-2xl font-bold text-gray-600">VS</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugador 2
                </label>
                <select
                  value={selectedPlayer2}
                  onChange={(e) => setSelectedPlayer2(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 text-sm sm:text-base"
                >
                  <option value="">Seleccionar jugador</option>
                  {players
                    .filter(
                      (p) =>
                        !manualMatches.some(
                          (m) => m.player1 === p.id || m.player2 === p.id
                        )
                    )
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        #{player.seed} {player.name} (
                        {calculatePlayerPoints(player.id)} pts)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={addManualMatch}
                disabled={
                  !selectedPlayer1 ||
                  !selectedPlayer2 ||
                  selectedPlayer1 === selectedPlayer2
                }
                className={`px-4 py-2 rounded transition-colors ${
                  !selectedPlayer1 ||
                  !selectedPlayer2 ||
                  selectedPlayer1 === selectedPlayer2
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                ➕ Agregar Emparejamiento
              </button>
            </div>
          </div>

          {/* Lista de emparejamientos creados */}
          {manualMatches.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">
                Emparejamientos Creados ({manualMatches.length})
              </h3>
              <div className="space-y-2">
                {manualMatches.map((match, index) => {
                  const player1 = players.find((p) => p.id === match.player1);
                  const player2 = players.find((p) => p.id === match.player2);

                  return (
                    <div
                      key={match.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50 border border-blue-200 rounded gap-2"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                        <span className="text-sm font-medium text-blue-800">
                          #{index + 1}
                        </span>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                          <span className="font-medium text-gray-800 truncate">
                            #{player1?.seed} {player1?.name} (
                            {calculatePlayerPoints(player1?.id || "")} pts)
                          </span>
                          <span className="text-gray-500">VS</span>
                          <span className="font-medium text-gray-800 truncate">
                            #{player2?.seed} {player2?.name} (
                            {calculatePlayerPoints(player2?.id || "")} pts)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeManualMatch(match.id)}
                        className="text-red-600 hover:text-red-800 font-bold flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jugadores sin emparejar */}
          {(() => {
            const pairedPlayers = new Set();
            manualMatches.forEach((match) => {
              pairedPlayers.add(match.player1);
              pairedPlayers.add(match.player2);
            });
            const unpairedPlayers = players.filter(
              (p) => !pairedPlayers.has(p.id)
            );

            return (
              unpairedPlayers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Jugadores Sin Emparejar ({unpairedPlayers.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {unpairedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm"
                      >
                        <span className="font-medium text-gray-800 truncate block">
                          #{player.seed} {player.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {calculatePlayerPoints(player.id)} pts
                        </div>
                      </div>
                    ))}
                  </div>
                  {unpairedPlayers.length === 1 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      💡 El jugador sin emparejar recibirá bye automáticamente
                    </div>
                  )}
                </div>
              )
            );
          })()}

          {/* Botón para crear la ronda */}
          <div className="flex flex-col sm:flex-row gap-2">
            {currentRound === 0 && (
              <button
                onClick={() => {
                  const sortedPlayers = [...players].sort(
                    (a, b) => a.seed - b.seed
                  );
                  const round1 = generateAcceleratedPairings(sortedPlayers, 1);
                  setRounds([round1]);
                  setCurrentRound(1);
                  setIsManualPairing(false);
                  setTimeout(() => startRoundTimer(1), 1000);
                  alert(
                    `Ronda 1 creada automáticamente con emparejamientos acelerados`
                  );
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm sm:text-base"
              >
                🎲 Generar Automático
              </button>
            )}

            <button
              onClick={createManualRound}
              disabled={manualMatches.length === 0}
              className={`px-6 py-3 rounded transition-colors font-medium text-sm sm:text-base ${
                manualMatches.length === 0
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              ✅ Crear Ronda Manual
            </button>
          </div>
        </div>
      )}

      {/* Mostrar opciones de playoff cuando el torneo suizo termine */}
      {currentRound > 0 &&
        !rounds.find((r) => r.number === currentRound)?.isActive &&
        !playoff && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              🏆 Torneo Suizo Completado - ¿Jugar Playoff?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => generatePlayoff("top4")}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
              >
                🥇 Top 4
              </button>
              <button
                onClick={() => generatePlayoff("top8")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
              >
                🏅 Top 8
              </button>
              <button
                onClick={() => generatePlayoff("top16")}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
              >
                🎯 Top 16
              </button>
              <button
                onClick={() => generatePlayoff("none")}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
              >
                ❌ Sin Playoff
              </button>
            </div>
          </div>
        )}

      {/* Mostrar playoff activo */}
      {playoff && playoff.isActive && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">
              🏆 Playoff {playoff.format.toUpperCase()} - Ronda{" "}
              {playoff.currentRound}/{playoff.totalRounds}
            </h3>
            {playoff.currentRound < playoff.totalRounds && (
              <button
                onClick={advancePlayoffRound}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Avanzar Ronda
              </button>
            )}
          </div>

          {/* Matches del playoff */}
          <div className="space-y-4">
            {playoff.matches
              .filter((match) => match.round === playoff.currentRound)
              .map((match) => (
                <PlayoffMatchCard
                  key={match.id}
                  match={match}
                  players={players}
                  onComplete={completePlayoffMatch}
                />
              ))}
          </div>
        </div>
      )}

      {/* Clasificación final */}
      {players.some((p) => p.wins > 0 || p.losses > 0) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🏅 Clasificación Final
          </h2>
          <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-2 sm:px-4 text-left font-medium text-xs sm:text-sm">#</th>
                  <th className="py-3 px-2 sm:px-4 text-left font-medium text-xs sm:text-sm">Jugador</th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm">
                    Victorias
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm">
                    Derrotas
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm">Puntos</th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm">Opp</th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm">GW%</th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm">Bye</th>
                </tr>
              </thead>
              <tbody>
                {[...players]
                  .sort((a, b) => {
                    const pointsA = calculatePlayerPoints(a.id);
                    const pointsB = calculatePlayerPoints(b.id);
                    if (pointsB !== pointsA) return pointsB - pointsA;

                    // Si tienen los mismos puntos totales, priorizar victorias reales sobre bye + victoria
                    const realWinsA = calculateRealWins(a.id);
                    const realWinsB = calculateRealWins(b.id);
                    if (realWinsB !== realWinsA) return realWinsB - realWinsA;

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
                    const winPercentage =
                      totalGames > 0
                        ? ((player.wins / totalGames) * 100).toFixed(1)
                        : "0.0";
                    const gameWinPercentage = calculateGameWinPercentage(
                      player.id
                    );

                    return (
                      <tr
                        key={player.id}
                        className={`${
                          index === 0
                            ? "bg-yellow-50"
                            : index === 1
                              ? "bg-gray-50"
                              : index === 2
                                ? "bg-orange-50"
                                : index % 2 === 0
                                  ? "bg-gray-50"
                                  : "bg-white"
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <td className="py-3 px-2 sm:px-4 font-bold text-gray-800 text-xs sm:text-sm">
                          {index === 0
                            ? "🥇"
                            : index === 1
                              ? "🥈"
                              : index === 2
                                ? "🥉"
                                : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-800 text-xs sm:text-sm truncate">
                          #{player.seed} {player.name}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-emerald-600 font-bold text-xs sm:text-sm">
                          {player.wins % 1 === 0
                            ? player.wins
                            : player.wins.toFixed(1)}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-red-600 font-medium text-xs sm:text-sm">
                          {player.losses}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-purple-600 font-bold text-xs sm:text-sm">
                          {calculatePlayerPoints(player.id)}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-blue-600 font-medium text-xs sm:text-sm">
                          {calculateOpp(player.id)}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-indigo-600 font-medium text-xs sm:text-sm">
                          {gameWinPercentage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center text-gray-600 font-medium text-xs sm:text-sm">
                          {player.hasBye ? "🆓 Bye" : "-"}
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
