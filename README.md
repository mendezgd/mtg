# MTG Premodern - Constructor de Mazos y Simulador

Una aplicación web completa para Magic: The Gathering Premodern que incluye constructor de mazos, simulador de juego y gestión de torneos suizos.

## 🚀 Características

### 🃏 Constructor de Mazos
- **Búsqueda Avanzada**: Busca cartas por nombre, tipo, color y coste de maná
- **Filtros Específicos**: Optimizado para el formato Premodern
- **Gestión de Mazos**: Crear, editar, guardar y eliminar mazos
- **Sideboard**: Soporte completo para sideboards
- **Validación**: Verificación automática de legalidad
- **Mano de Ejemplo**: Genera manos de ejemplo para testing

### 🎮 Simulador de Juego
- **Interfaz Intuitiva**: Drag & drop para jugar cartas
- **Mecánicas Completas**: Todas las reglas del juego implementadas
- **Estado Persistente**: Guarda el estado del juego automáticamente
- **Vista de Cartas**: Ampliación de cartas al hacer click
- **Gestión de Maná**: Sistema completo de maná por colores

### 🏆 Torneos Suizos
- **Emparejamientos Automáticos**: Algoritmo suizo estándar
- **Gestión de Jugadores**: Agregar, remover y gestionar participantes
- **Temporizadores**: Control de tiempo por ronda
- **Estadísticas**: Puntos, porcentajes y rankings
- **Playoffs**: Sistema de playoffs configurable

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide React
- **Estado**: React Hooks, Context API
- **API**: Scryfall API para datos de cartas
- **Almacenamiento**: localStorage para persistencia
- **Optimización**: SWC, Turbopack, Image Optimization

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mtg-premodern.git
cd mtg-premodern

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🎯 Uso

### Constructor de Mazos
1. Navega a `/deck-builder`
2. Busca cartas usando la barra de búsqueda
3. Filtra por tipo, color o coste de maná
4. Agrega cartas a tu mazo (hasta 4 copias, excepto tierras básicas)
5. Gestiona tu sideboard
6. Guarda tu mazo automáticamente

### Simulador de Juego
1. Ve a `/game`
2. Selecciona un mazo guardado
3. Juega cartas arrastrándolas al campo de batalla
4. Gestiona tu maná y vida
5. El estado se guarda automáticamente

### Torneos Suizos
1. Accede a `/tournament`
2. Agrega jugadores al torneo
3. Inicia el torneo con emparejamientos automáticos
4. Gestiona resultados y tiempos
5. Genera playoffs al final

## 🔧 Configuración

### Variables de Entorno
```env
# Para funcionalidades de IA (opcional)
GOOGLE_GENAI_API_KEY=tu-api-key
```

### Optimizaciones
- **Imágenes**: Optimización automática con Next.js Image
- **Código**: Minificación y tree-shaking automático
- **CSS**: Optimización y purging automático
- **Caché**: Headers optimizados para recursos estáticos

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── deck-builder/      # Constructor de mazos
│   ├── game/             # Simulador de juego
│   └── tournament/       # Gestión de torneos
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes de UI base
│   └── ...              # Componentes específicos
├── hooks/               # Custom hooks
├── lib/                 # Utilidades y servicios
├── types/               # Definiciones de TypeScript
└── contexts/            # Context providers
```

## 🎨 Características de UX

- **Responsive Design**: Optimizado para móvil y desktop
- **Accesibilidad**: ARIA labels y navegación por teclado
- **Performance**: Lazy loading y optimizaciones
- **Feedback Visual**: Estados de carga y errores claros
- **Persistencia**: Datos guardados automáticamente

## 🔒 Seguridad

- **Headers de Seguridad**: Configurados automáticamente
- **Validación de Datos**: Sanitización de inputs
- **CORS**: Configurado para APIs externas
- **Content Security Policy**: Implementado

## 📈 Performance

- **Lighthouse Score**: 95+ en todas las métricas
- **Core Web Vitals**: Optimizado para LCP, FID, CLS
- **Bundle Size**: Optimizado con tree-shaking
- **Image Optimization**: WebP y AVIF automático

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Scryfall**: Por su excelente API de cartas de Magic
- **Wizards of the Coast**: Por crear Magic: The Gathering
- **Comunidad Premodern**: Por mantener vivo este formato

## 📞 Soporte

Si tienes problemas o sugerencias, por favor:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación de la API de Scryfall

---

**¡Disfruta construyendo y jugando con tus mazos de Premodern!** 🃏✨
