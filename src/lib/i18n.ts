export type Language = "es" | "en";

export interface Translations {
  // Navbar
  navbar: {
    home: string;
    deckBuilder: string;
    game: string;
    lifeCounter: string;
    timer: string;
    tournament: string;
  };

  // Home page
  home: {
    title: string;
    subtitle: string;
    description: string;
    advancedSearch: string;
    advancedSearchDescription: string;
    deckBuilder: string;
    deckBuilderDescription: string;
    gameSimulator: string;
    gameSimulatorDescription: string;
    gameSimulatorInDevelopment: string;
    gameSimulatorComingSoon: string;
    aboutPremodern: string;
    aboutPremodernDescription: string;
    formatPremodern: string;
    formatPremodernDescription: string;
    tools: string;
    toolsDescription: string;
    readyToStart: string;
    joinCommunity: string;
    features: {
      deckBuilder: {
        title: string;
        description: string;
      };
      game: {
        title: string;
        description: string;
      };
      lifeCounter: {
        title: string;
        description: string;
      };
      timer: {
        title: string;
        description: string;
      };
      tournament: {
        title: string;
        description: string;
      };
    };
  };

  // Deck Builder
  deckBuilder: {
    title: string;
    subtitle: string;
    description: string;
    myDeck: string;
    loading: string;
    search: string;
    preview: string;
    previewDescription: string;
    importDeck: string;
    importFromMtgdecks: string;
    importDescription: string;
    expectedFormat: string;
    formatExample: string;
    sideboard: string;
    newDeck: string;
    deckName: string;
    createDeck: string;
    renameDeck: string;
    deleteDeck: string;
    confirmDelete: string;
    totalCards: string;
    mainDeck: string;
    sideboardCards: string;
    noCards: string;
    noCardsDescription: string;
    swipeIndicator: string;
    opponentDeck: string;
    selectOpponentDeck: string;
    noOpponentDeck: string;
    startGame: string;
    cards: string;
    mana: string;
    type: string;
    rarity: string;
    set: string;
    price: string;
    addToDeck: string;
    addToSideboard: string;
    removeFromDeck: string;
    removeFromSideboard: string;
    copyDeck: string;
    exportDeck: string;
    importDeckText: string;
    importDeckName: string;
    import: string;
    importing: string;
    importSuccess: string;
    importError: string;
    invalidFormat: string;
    deckNotFound: string;
    deckEmpty: string;
    deckTooManyCards: string;
    deckTooFewCards: string;
    deckInvalidCards: string;
    deckInvalidSideboard: string;
    deckInvalidFormat: string;
    deckInvalidName: string;
    deckNameRequired: string;
    deckNameTooLong: string;
    deckNameInvalid: string;
    deckNameExists: string;
    deckNameEmpty: string;
    sampleHand: string;
    generateHand: string;
    clearHand: string;
    playVs: string;
    needMinCards: string;
    tip: string;
    longPressTip: string;
    vsMode: string;
    vsModeDescription: string;
    noOtherDecks: string;
    createAnotherDeck: string;
    yourDeck: string;
    searching: string;
    searchCards: string;
    exploreWithFilters: string;
    cardsFound: string;
    totalCardsFound: string;
    useNavigationButtons: string;
    basicLands: string;
  };

  // Tournament
  tournament: {
    title: string;
    subtitle: string;
    autoSave: string;
    swissSystem: string;
    tournamentStatus: string;
    players: string;
    currentRound: string;
    matchesPlayed: string;
    totalMatches: string;
    format: string;
    formatDescription: string;
    tiebreakers: string;
    tiebreakersDescription: string;
    byeSystem: string;
    byeSystemDescription: string;
    localSave: string;
    localSaveDescription: string;
    playerManagement: string;
    addPlayer: string;
    playerName: string;
    startTournament: string;
    resetTournament: string;
    round: string;
    match: string;
    completed: string;
    score: string;
    gameCounters: string;
    standings: string;
    rank: string;
    name: string;
    wins: string;
    losses: string;
    points: string;
    opponentPercentage: string;
    gameWinPercentage: string;
    timeRemaining: string;
    minutes: string;
    seconds: string;
    exportResults: string;
    importResults: string;
    playoff: string;
    playoffOptions: string;
    top4: string;
    top8: string;
    top16: string;
    noPlayoff: string;
    startPlayoff: string;
    playoffRound: string;
    semifinals: string;
    finals: string;
    winner: string;
    exportTournament: string;
    importTournament: string;
    manualPairing: string;
    manualPairingDescription: string;
    enableManualPairing: string;
    selectPlayer1: string;
    selectPlayer2: string;
    createMatch: string;
    removeMatch: string;
    manualRounds: string;
    enableManualRounds: string;
    roundConfiguration: string;
    timeLimit: string;
    saveConfiguration: string;
  };

  // Game
  game: {
    title: string;
    subtitle: string;
    inDevelopment: string;
    comingSoon: string;
    noDeckSelected: string;
    pleaseSelectDeck: string;
    goToDeckBuilder: string;
  };

  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    ok: string;
    copy: string;
    download: string;
    upload: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    settings: string;
    help: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    donate: string;
    thankYou: string;
    start: string;
    view: string;
    support: string;
    language: string;
    followMe: string;
    constructor: string;
    game: string;
    tournaments: string;
    copyright: string;
    clear: string;
    retry: string;
    of: string;
    page: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    navbar: {
      home: "Inicio",
      deckBuilder: "Constructor de Mazos",
      game: "Juego",
      lifeCounter: "Contador de Vida",
      timer: "Temporizador",
      tournament: "Torneo",
    },
    home: {
      title: "MTG Premodern - Constructor de Mazos y Simulador de Juego",
      subtitle:
        "Herramientas completas para jugadores de Magic: The Gathering Premodern",
      description:
        "Constructor de mazos MTG Premodern, simulador de juego, torneos suizos y herramientas para jugadores de Magic: The Gathering.",
      advancedSearch: "Búsqueda Avanzada",
      advancedSearchDescription:
        "Busca cartas por nombre, tipo, color y coste de maná. Filtros específicos para el formato Premodern.",
      deckBuilder: "Constructor de Mazos",
      deckBuilderDescription:
        "Construye y optimiza tus mazos con herramientas avanzadas. Soporte para sideboards y validación automática.",
          gameSimulator: "Simulador de Juego",
    gameSimulatorDescription:
      "Juega partidas completas con tus mazos. Interfaz intuitiva y todas las mecánicas del juego.",
    gameSimulatorInDevelopment: "🚧 En Desarrollo",
    gameSimulatorComingSoon: "Próximamente - Funcionalidad completa en desarrollo",
      aboutPremodern: "Sobre MTG Premodern",
      aboutPremodernDescription:
        "Premodern es un formato de Magic: The Gathering que incluye cartas desde la 4ª edición hasta Scourge (1995-2003). Nuestra plataforma te ofrece todas las herramientas necesarias para explorar este formato histórico y competitivo.",
      formatPremodern: "🎯 Formato Premodern",
      formatPremodernDescription:
        "• Cartas de 4ª edición a Scourge\n• Lista de cartas prohibidas específica\n• Comunidad activa y competitiva\n• Eventos y torneos regulares",
      tools: "🛠️ Herramientas",
      toolsDescription:
        "• Búsqueda de cartas en tiempo real\n• Constructor de mazos avanzado\n• Simulador de partidas\n• Gestión de torneos suizos",
      readyToStart: "¿Listo para empezar?",
      joinCommunity:
        "Únete a la comunidad de MTG Premodern y descubre un nuevo mundo de estrategias",
      features: {
        deckBuilder: {
          title: "Constructor de Mazos",
          description:
            "Construye mazos MTG Premodern con nuestro constructor avanzado. Busca cartas, crea sideboards y optimiza tus estrategias.",
        },
        game: {
          title: "Simulador de Juego",
          description:
            "Simula partidas de Magic: The Gathering con tu mazo. Prueba tus estrategias y mejora tu juego.",
        },
        lifeCounter: {
          title: "Contador de Vida",
          description:
            "Contador de vida digital para partidas de Magic: The Gathering. Interfaz intuitiva y fácil de usar.",
        },
        timer: {
          title: "Temporizador",
          description:
            "Temporizador para partidas y torneos. Controla el tiempo de tus juegos de manera eficiente.",
        },
        tournament: {
          title: "Torneos Suizos",
          description:
            "Organiza y participa en torneos suizos de Magic: The Gathering Premodern. Gestión avanzada de brackets y emparejamientos.",
        },
      },
    },
    deckBuilder: {
      title: "Constructor de Mazos MTG Premodern",
      subtitle:
        "Construye mazos MTG Premodern con nuestro constructor avanzado",
      description:
        "Constructor de mazos MTG Premodern, simulador de juego, torneos suizos y herramientas para jugadores de Magic: The Gathering.",
      myDeck: "Mi Mazo",
      loading: "Cargando constructor de mazos...",
      search: "Buscar",
      preview: "Vista Previa",
      previewDescription:
        "Selecciona una carta en la búsqueda para ver su vista previa detallada",
      importDeck: "Importar Mazo",
      importFromMtgdecks: "📥 Importar desde mtgdecks.net",
      importDescription:
        "Copia y pega el texto de tu mazo desde mtgdecks.net, TappedOut, o cualquier formato similar",
      expectedFormat: "Formato esperado:",
      formatExample:
        "4 Lightning Bolt\n2 Counterspell\n1 Black Lotus\n\n// Sideboard\n2 Disenchant\n1 Circle of Protection: Red\n...",
      sideboard: "Sideboard",
      newDeck: "Nuevo Mazo",
      deckName: "Nombre del mazo",
      createDeck: "Crear Mazo",
      renameDeck: "Renombrar Mazo",
      deleteDeck: "Eliminar Mazo",
      confirmDelete: "¿Estás seguro de que quieres eliminar este mazo?",
      totalCards: "Total de cartas",
      mainDeck: "Mazo Principal",
      sideboardCards: "Cartas del Sideboard",
      noCards: "Sin cartas",
      noCardsDescription:
        "No hay cartas en este mazo. Busca y agrega cartas para comenzar.",
      swipeIndicator: "← Desliza →",
      opponentDeck: "Mazo del Oponente",
      selectOpponentDeck: "Seleccionar Mazo del Oponente",
      noOpponentDeck: "Sin mazo del oponente",
      startGame: "Iniciar Juego",
      cards: "Cartas",
      mana: "Mana",
      type: "Tipo",
      rarity: "Rareza",
      set: "Set",
      price: "Precio",
      addToDeck: "Agregar al Mazo",
      addToSideboard: "Agregar al Sideboard",
      removeFromDeck: "Remover del Mazo",
      removeFromSideboard: "Remover del Sideboard",
      copyDeck: "Copiar Mazo",
      exportDeck: "Exportar Mazo",
      importDeckText: "Texto del mazo",
      importDeckName: "Nombre del mazo",
      import: "Importar",
      importing: "Importando...",
      importSuccess: "Mazo importado exitosamente",
      importError: "Error al importar el mazo",
      invalidFormat: "Formato inválido",
      deckNotFound: "Mazo no encontrado",
      deckEmpty: "El mazo está vacío",
      deckTooManyCards: "Demasiadas cartas en el mazo",
      deckTooFewCards: "Muy pocas cartas en el mazo",
      deckInvalidCards: "Cartas inválidas en el mazo",
      deckInvalidSideboard: "Sideboard inválido",
      deckInvalidFormat: "Formato de mazo inválido",
      deckInvalidName: "Nombre de mazo inválido",
      deckNameRequired: "El nombre del mazo es requerido",
      deckNameTooLong: "El nombre del mazo es demasiado largo",
      deckNameInvalid: "Nombre de mazo inválido",
      deckNameExists: "Ya existe un mazo con ese nombre",
      deckNameEmpty: "El nombre del mazo no puede estar vacío",
      sampleHand: "Mano de Ejemplo",
      generateHand: "Generar Mano",
      clearHand: "Limpiar Mano",
      playVs: "Jugar VS",
      needMinCards: "Se necesitan al menos 7 cartas para jugar",
      tip: "Consejo",
      longPressTip:
        "Mantén presionada una carta para ver su vista previa. Toca fuera o el botón × para cerrar.",
      vsMode: "Modo VS",
      vsModeDescription:
        'Usa el botón "Jugar VS" para enfrentar tu mazo contra otro de tus mazos en el juego.',
      noOtherDecks: "No hay otros mazos disponibles para jugar VS.",
      createAnotherDeck: "Crea otro mazo para poder jugar.",
      yourDeck: "Tu mazo",
      searching: "Buscando...",
      searchCards: "Buscar Cartas",
      exploreWithFilters: "Explorar con Filtros",
      cardsFound: "cartas encontradas",
      totalCardsFound: "Se encontraron {count} cartas en total.",
      useNavigationButtons:
        "Usa los botones de navegación para ver más resultados.",
             basicLands: "Tierras Básicas",
     },
     game: {
       title: "Simulador de Juego MTG Premodern",
       subtitle: "Juega partidas completas con tus mazos",
       inDevelopment: "🚧 En Desarrollo",
       comingSoon: "Próximamente - Funcionalidad completa en desarrollo",
       noDeckSelected: "No hay mazo seleccionado",
       pleaseSelectDeck: "Por favor, selecciona un mazo en el constructor de mazos.",
       goToDeckBuilder: "Ir al Constructor de Mazos",
     },
     tournament: {
      title: "🏆 Posada MTG Torneo",
      subtitle: "Torneo Suizo MTG Premodern",
      autoSave: "Guardado automático",
      swissSystem: "Swiss System",
      tournamentStatus: "📊 Estado del Torneo",
      players: "👥 Jugadores",
      currentRound: "🔄 Ronda Actual",
      matchesPlayed: "✅ Partidos Jugados",
      totalMatches: "🎯 Total Partidos",
      format: "📋 Formato",
      formatDescription:
        "Best of 3 (BO3) - Primer jugador en ganar 2 games gana el match",
      tiebreakers: "🏆 Criterios de Desempate",
      tiebreakersDescription:
        "1. Puntos | 2. Victorias Reales | 3. Opp% | 4. GW% | 5. Seed",
      byeSystem: "🆓 Sistema Bye",
      byeSystemDescription:
        "Jugador con menos puntos recibe bye automático (3 pts, no Opp)",
      localSave: "💾 Guardado Local",
      localSaveDescription:
        'El progreso del torneo se guarda automáticamente. Solo el botón "🔄 Resetear" elimina todos los datos.',
      playerManagement: "👥 Gestión de Jugadores",
      addPlayer: "Agregar Jugador",
      playerName: "Nombre del jugador",
      startTournament: "Iniciar Torneo",
      resetTournament: "🔄 Resetear",
      round: "Ronda",
      match: "Partido",
      completed: "✅ Finalizado",
      score: "Puntuación",
      gameCounters: "Contadores de Games",
      standings: "📈 Standings Parciales",
      rank: "Pos",
      name: "Nombre",
      wins: "Victorias",
      losses: "Derrotas",
      points: "Puntos",
      opponentPercentage: "Opp%",
      gameWinPercentage: "GW%",
      timeRemaining: "⏱️ Tiempo restante:",
      minutes: "minutos",
      seconds: "segundos",
      exportResults: "📊 Exportar Resultados",
      importResults: "📥 Importar Resultados",
      playoff: "🏆 Playoff",
      playoffOptions: "Opciones de Playoff",
      top4: "Top 4",
      top8: "Top 8",
      top16: "Top 16",
      noPlayoff: "Sin Playoff",
      startPlayoff: "Iniciar Playoff",
      playoffRound: "Ronda de Playoff",
      semifinals: "Semifinales",
      finals: "Finales",
      winner: "Ganador",
      exportTournament: "Exportar Torneo",
      importTournament: "Importar Torneo",
      manualPairing: "Emparejamiento Manual",
      manualPairingDescription:
        "Crear emparejamientos manualmente en lugar de usar el sistema automático",
      enableManualPairing: "Habilitar Emparejamiento Manual",
      selectPlayer1: "Seleccionar Jugador 1",
      selectPlayer2: "Seleccionar Jugador 2",
      createMatch: "Crear Partido",
      removeMatch: "Eliminar Partido",
      manualRounds: "Rondas Manuales",
      enableManualRounds: "Habilitar Rondas Manuales",
      roundConfiguration: "⚙️ Configuración de Rondas",
      timeLimit: "Límite de tiempo",
      saveConfiguration: "Guardar Configuración",
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Agregar",
      remove: "Remover",
      confirm: "Confirmar",
      back: "Atrás",
      next: "Siguiente",
      previous: "Anterior",
      close: "Cerrar",
      open: "Abrir",
      yes: "Sí",
      no: "No",
      ok: "OK",
      copy: "Copiar",
      download: "Descargar",
      upload: "Subir",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      refresh: "Actualizar",
      settings: "Configuración",
      help: "Ayuda",
      about: "Acerca de",
      contact: "Contacto",
      privacy: "Privacidad",
      terms: "Términos",
      donate: "Donar",
      thankYou: "Gracias",
      start: "Comenzar Ahora",
      view: "Ver",
      support: "Apoyar",
      language: "Idioma",
      followMe: "Sígueme en redes sociales",
      constructor: "Constructor",
      game: "Juego",
      tournaments: "Torneos",
      copyright:
        "© 2025 MTG Premodern. Desarrollado para la comunidad de Magic: The Gathering.",
      clear: "Limpiar",
      retry: "Reintentar",
      of: "de",
      page: "página",
    },
  },
  en: {
    navbar: {
      home: "Home",
      deckBuilder: "Deck Builder",
      game: "Game",
      lifeCounter: "Life Counter",
      timer: "Timer",
      tournament: "Tournament",
    },
    home: {
      title: "MTG Premodern - Deck Builder and Game Simulator",
      subtitle: "Complete tools for Magic: The Gathering Premodern players",
      description:
        "MTG Premodern deck builder, game simulator, Swiss tournaments and tools for Magic: The Gathering players.",
      advancedSearch: "Advanced Search",
      advancedSearchDescription:
        "Search cards by name, type, color and mana cost. Specific filters for the Premodern format.",
      deckBuilder: "Deck Builder",
      deckBuilderDescription:
        "Build and optimize your decks with advanced tools. Sideboard support and automatic validation.",
          gameSimulator: "Game Simulator",
    gameSimulatorDescription:
      "Play complete games with your decks. Intuitive interface and all game mechanics.",
    gameSimulatorInDevelopment: "🚧 In Development",
    gameSimulatorComingSoon: "Coming Soon - Full functionality in development",
      aboutPremodern: "About MTG Premodern",
      aboutPremodernDescription:
        "Premodern is a Magic: The Gathering format that includes cards from 4th Edition to Scourge (1995-2003). Our platform offers you all the tools needed to explore this historical and competitive format.",
      formatPremodern: "🎯 Premodern Format",
      formatPremodernDescription:
        "• Cards from 4th Edition to Scourge\n• Specific banned list\n• Active and competitive community\n• Regular events and tournaments",
      tools: "🛠️ Tools",
      toolsDescription:
        "• Real-time card search\n• Advanced deck builder\n• Game simulator\n• Swiss tournament management",
      readyToStart: "Ready to start?",
      joinCommunity:
        "Join the MTG Premodern community and discover a new world of strategies",
      features: {
        deckBuilder: {
          title: "Deck Builder",
          description:
            "Build MTG Premodern decks with our advanced builder. Search cards, create sideboards and optimize your strategies.",
        },
        game: {
          title: "Game Simulator",
          description:
            "Simulate Magic: The Gathering games with your deck. Test your strategies and improve your gameplay.",
        },
        lifeCounter: {
          title: "Life Counter",
          description:
            "Digital life counter for Magic: The Gathering games. Intuitive and easy-to-use interface.",
        },
        timer: {
          title: "Timer",
          description:
            "Timer for games and tournaments. Control your game time efficiently.",
        },
        tournament: {
          title: "Swiss Tournaments",
          description:
            "Organize and participate in Magic: The Gathering Premodern Swiss tournaments. Advanced bracket and pairing management.",
        },
      },
    },
    deckBuilder: {
      title: "MTG Premodern Deck Builder",
      subtitle: "Build MTG Premodern decks with our advanced builder",
      description:
        "MTG Premodern deck builder, game simulator, Swiss tournaments and tools for Magic: The Gathering players.",
      myDeck: "My Deck",
      loading: "Loading deck builder...",
      search: "Search",
      preview: "Preview",
      previewDescription:
        "Select a card in the search to see its detailed preview",
      importDeck: "Import Deck",
      importFromMtgdecks: "📥 Import from mtgdecks.net",
      importDescription:
        "Copy and paste your deck text from mtgdecks.net, TappedOut, or any similar format",
      expectedFormat: "Expected format:",
      formatExample:
        "4 Lightning Bolt\n2 Counterspell\n1 Black Lotus\n\n// Sideboard\n2 Disenchant\n1 Circle of Protection: Red\n...",
      sideboard: "Sideboard",
      newDeck: "New Deck",
      deckName: "Deck name",
      createDeck: "Create Deck",
      renameDeck: "Rename Deck",
      deleteDeck: "Delete Deck",
      confirmDelete: "Are you sure you want to delete this deck?",
      totalCards: "Total cards",
      mainDeck: "Main Deck",
      sideboardCards: "Sideboard Cards",
      noCards: "No cards",
      noCardsDescription:
        "No cards in this deck. Search and add cards to get started.",
      swipeIndicator: "← Swipe →",
      opponentDeck: "Opponent Deck",
      selectOpponentDeck: "Select Opponent Deck",
      noOpponentDeck: "No opponent deck",
      startGame: "Start Game",
      cards: "Cards",
      mana: "Mana",
      type: "Type",
      rarity: "Rarity",
      set: "Set",
      price: "Price",
      addToDeck: "Add to Deck",
      addToSideboard: "Add to Sideboard",
      removeFromDeck: "Remove from Deck",
      removeFromSideboard: "Remove from Sideboard",
      copyDeck: "Copy Deck",
      exportDeck: "Export Deck",
      importDeckText: "Deck text",
      importDeckName: "Deck name",
      import: "Import",
      importing: "Importing...",
      importSuccess: "Deck imported successfully",
      importError: "Error importing deck",
      invalidFormat: "Invalid format",
      deckNotFound: "Deck not found",
      deckEmpty: "Deck is empty",
      deckTooManyCards: "Too many cards in deck",
      deckTooFewCards: "Too few cards in deck",
      deckInvalidCards: "Invalid cards in deck",
      deckInvalidSideboard: "Invalid sideboard",
      deckInvalidFormat: "Invalid deck format",
      deckInvalidName: "Invalid deck name",
      deckNameRequired: "Deck name is required",
      deckNameTooLong: "Deck name is too long",
      deckNameInvalid: "Invalid deck name",
      deckNameExists: "A deck with that name already exists",
      deckNameEmpty: "Deck name cannot be empty",
      sampleHand: "Sample Hand",
      generateHand: "Generate Hand",
      clearHand: "Clear Hand",
      playVs: "Play VS",
      needMinCards: "You need at least 7 cards to play",
      tip: "Tip",
      longPressTip:
        "Long press a card to see its preview. Tap outside or the × button to close.",
      vsMode: "VS Mode",
      vsModeDescription:
        'Use the "Play VS" button to face your deck against another of your decks in the game.',
      noOtherDecks: "No other decks available to play VS.",
      createAnotherDeck: "Create another deck to play.",
      yourDeck: "Your deck",
      searching: "Searching...",
      searchCards: "Search Cards",
      exploreWithFilters: "Explore with Filters",
      cardsFound: "cards found",
      totalCardsFound: "Found {count} cards in total.",
      useNavigationButtons: "Use the navigation buttons to see more results.",
             basicLands: "Basic Lands",
     },
     game: {
       title: "MTG Premodern Game Simulator",
       subtitle: "Play complete games with your decks",
       inDevelopment: "🚧 In Development",
       comingSoon: "Coming Soon - Full functionality in development",
       noDeckSelected: "No deck selected",
       pleaseSelectDeck: "Please select a deck in the deck builder.",
       goToDeckBuilder: "Go to Deck Builder",
     },
     tournament: {
      title: "🏆 Posada MTG Tournament",
      subtitle: "MTG Premodern Swiss Tournament",
      autoSave: "Auto Save",
      swissSystem: "Swiss System",
      tournamentStatus: "📊 Tournament Status",
      players: "👥 Players",
      currentRound: "🔄 Current Round",
      matchesPlayed: "✅ Matches Played",
      totalMatches: "🎯 Total Matches",
      format: "📋 Format",
      formatDescription:
        "Best of 3 (BO3) - First player to win 2 games wins the match",
      tiebreakers: "🏆 Tiebreaker Criteria",
      tiebreakersDescription:
        "1. Points | 2. Real Wins | 3. Opp% | 4. GW% | 5. Seed",
      byeSystem: "🆓 Bye System",
      byeSystemDescription:
        "Player with fewer points receives automatic bye (3 pts, no Opp)",
      localSave: "💾 Local Save",
      localSaveDescription:
        'Tournament progress is saved automatically. Only the "🔄 Reset" button deletes all data.',
      playerManagement: "👥 Player Management",
      addPlayer: "Add Player",
      playerName: "Player name",
      startTournament: "Start Tournament",
      resetTournament: "🔄 Reset",
      round: "Round",
      match: "Match",
      completed: "✅ Completed",
      score: "Score",
      gameCounters: "Game Counters",
      standings: "📈 Partial Standings",
      rank: "Rank",
      name: "Name",
      wins: "Wins",
      losses: "Losses",
      points: "Points",
      opponentPercentage: "Opp%",
      gameWinPercentage: "GW%",
      timeRemaining: "⏱️ Time remaining:",
      minutes: "minutes",
      seconds: "seconds",
      exportResults: "📊 Export Results",
      importResults: "📥 Import Results",
      playoff: "🏆 Playoff",
      playoffOptions: "Playoff Options",
      top4: "Top 4",
      top8: "Top 8",
      top16: "Top 16",
      noPlayoff: "No Playoff",
      startPlayoff: "Start Playoff",
      playoffRound: "Playoff Round",
      semifinals: "Semifinals",
      finals: "Finals",
      winner: "Winner",
      exportTournament: "Export Tournament",
      importTournament: "Import Tournament",
      manualPairing: "Manual Pairing",
      manualPairingDescription:
        "Create pairings manually instead of using the automatic system",
      enableManualPairing: "Enable Manual Pairing",
      selectPlayer1: "Select Player 1",
      selectPlayer2: "Select Player 2",
      createMatch: "Create Match",
      removeMatch: "Remove Match",
      manualRounds: "Manual Rounds",
      enableManualRounds: "Enable Manual Rounds",
      roundConfiguration: "⚙️ Round Configuration",
      timeLimit: "Time limit",
      saveConfiguration: "Save Configuration",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      remove: "Remove",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      open: "Open",
      yes: "Yes",
      no: "No",
      ok: "OK",
      copy: "Copy",
      download: "Download",
      upload: "Upload",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      refresh: "Refresh",
      settings: "Settings",
      help: "Help",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      donate: "Donate",
      thankYou: "Thank You",
      start: "Start Now",
      view: "View",
      support: "Support",
      language: "Language",
      followMe: "Follow me on social media",
      constructor: "Constructor",
      game: "Game",
      tournaments: "Tournaments",
      copyright:
        "© 2025 MTG Premodern. Developed for the Magic: The Gathering community.",
      clear: "Clear",
      retry: "Retry",
      of: "of",
      page: "page",
    },
  },
};

export function getTranslation(language: Language, key: string): string {
  const keys = key.split(".");
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === "string" ? value : key;
}

export function useTranslation(language: Language) {
  return {
    t: (key: string) => getTranslation(language, key),
    language,
  };
}
