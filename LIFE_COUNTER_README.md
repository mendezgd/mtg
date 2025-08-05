# MTG Life Counter - Contador de Vidas para Magic: The Gathering

## 🎯 Descripción

Un contador de vidas completo y moderno para Magic: The Gathering, diseñado con React y TypeScript. Incluye todas las funcionalidades necesarias para un juego competitivo de MTG.

## ✨ Características Principales

### Contadores Básicos
- **2 Jugadores**: Soporte para dos jugadores con contadores independientes
- **Vida Inicial**: 20 puntos de vida por defecto para cada jugador
- **Botones de Control**: Incremento/decremento con botones +1, -1, +5, -5

### Contadores Avanzados
- **Contador de Veneno**: Para mecánicas de veneno (Infect, Wither)
- **Contador de Energía**: Para cartas que generan contadores de energía
- **Valores Mínimos**: Todos los contadores tienen un mínimo de 0

### Funcionalidades Avanzadas

#### Historial y Control
- **Undo/Redo**: Historial completo de cambios con deshacer/rehacer
- **Persistencia**: Guardado automático en localStorage
- **Reset**: Función para iniciar una nueva partida

#### Interfaz de Usuario
- **Modo Oscuro/Claro**: Cambio dinámico de tema
- **Diseño Responsive**: Adaptable a móviles y tablets
- **Modo Landscape**: Optimización para orientación horizontal
- **Animaciones**: Efectos visuales sutiles al cambiar valores

#### Características Adicionales
- **Sonidos**: Efectos de audio opcionales al cambiar valores
- **Atajos de Teclado**: Control rápido con combinaciones de teclas
- **Detección de Orientación**: Adaptación automática a la rotación de pantalla

## 🎮 Controles

### Botones de Interfaz
- **+/-**: Incrementar/decrementar en 1
- **+5/-5**: Cambios rápidos de 5 puntos
- **Deshacer/Rehacer**: Navegar por el historial
- **Nueva Partida**: Resetear todos los contadores

### Atajos de Teclado
- **Ctrl+Z**: Deshacer último cambio
- **Ctrl+Y**: Rehacer cambio deshecho
- **Ctrl+R**: Nueva partida
- **Ctrl+D**: Cambiar modo oscuro/claro
- **Ctrl+S**: Activar/desactivar sonido

## 🎨 Diseño

### Colores por Tipo de Contador
- **Vida**: Verde (text-green-600)
- **Veneno**: Púrpura (text-purple-600)
- **Energía**: Amarillo (text-yellow-600)

### Temas
- **Modo Claro**: Fondo degradado azul con texto oscuro
- **Modo Oscuro**: Fondo gris oscuro con texto claro

### Responsive Design
- **Móvil**: Layout vertical con contadores apilados
- **Tablet**: Layout horizontal en modo landscape
- **Desktop**: Layout de dos columnas

## 🔧 Tecnologías Utilizadas

- **React 18**: Componentes funcionales con hooks
- **TypeScript**: Tipado estático completo
- **Tailwind CSS**: Estilos y diseño responsive
- **Radix UI**: Componentes de interfaz accesibles
- **Lucide React**: Iconografía moderna
- **localStorage**: Persistencia de datos

## 📱 Características Móviles

### Optimizaciones Touch
- Botones grandes para interacción táctil
- Espaciado optimizado para dedos
- Feedback visual inmediato

### Orientación de Pantalla
- **Portrait**: Layout vertical optimizado
- **Landscape**: Layout horizontal con contadores lado a lado

## 🎵 Sistema de Audio

### Frecuencias por Tipo
- **Vida**: 440Hz (A4)
- **Veneno**: 220Hz (A3)
- **Energía**: 880Hz (A5)

### Características
- Audio sintetizado en tiempo real
- Volumen controlado (0.1)
- Duración corta (0.1s)
- Manejo de errores para navegadores sin soporte

## 💾 Persistencia de Datos

### Datos Guardados
- Estado actual de ambos jugadores
- Configuración de tema (oscuro/claro)
- Configuración de sonido
- Historial de cambios (últimos 50 movimientos)

### Almacenamiento
- **localStorage**: Persistencia entre sesiones
- **Sincronización**: Cambios reflejados en tiempo real
- **Recuperación**: Restauración automática al cargar

## 🚀 Instalación y Uso

### Acceso
1. Navegar a `/life-counter` en la aplicación
2. O usar el botón "Contador de Vidas" en la página principal

### Configuración Inicial
- Los contadores inician en 20 vida, 0 veneno, 0 energía
- El modo oscuro se puede activar desde el header
- El sonido se puede desactivar desde el header

## 🔄 Historial y Control de Versiones

### Funcionalidad Undo/Redo
- **Historial Limitado**: Máximo 50 movimientos guardados
- **Navegación**: Botones habilitados/deshabilitados según estado
- **Información**: Contador de movimientos en tiempo real

### Reset de Partida
- Limpia todos los contadores
- Reinicia el historial
- Mantiene configuraciones de tema y sonido

## 🎯 Casos de Uso

### Juego Casual
- Contadores básicos de vida
- Interfaz simple e intuitiva
- Cambios rápidos con botones

### Juego Competitivo
- Contadores de veneno para Infect
- Historial para revisar jugadas
- Modo oscuro para reducir fatiga visual

### Juego con Mecánicas Especiales
- Contador de energía para cartas específicas
- Múltiples contadores simultáneos
- Persistencia para partidas largas

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- Soporte para más de 2 jugadores
- Contadores personalizables
- Exportar/importar estado de partida
- Estadísticas de partida
- Integración con mazos de la aplicación

### Mejoras Técnicas
- PWA (Progressive Web App)
- Notificaciones push
- Sincronización entre dispositivos
- Temas personalizables

## 📄 Licencia

Este componente es parte del proyecto MTG Premodern y está bajo la misma licencia MIT.

---

**Desarrollado con ❤️ para la comunidad de Magic: The Gathering** 