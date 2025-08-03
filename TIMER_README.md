# ⏱️ Temporizador Simple

Un temporizador que **solo cuenta el tiempo**, sin funcionalidades adicionales, tal como solicitaste.

## 📁 Archivos Creados

### Componente Principal
- `src/components/ui/timer.tsx` - Componente de temporizador reutilizable

### Hook Personalizado
- `src/hooks/use-timer.ts` - Hook para control total del temporizador

### Páginas de Demostración
- `src/app/timer/page.tsx` - Página principal con múltiples temporizadores
- `src/app/timer/layout.tsx` - Layout para la página del temporizador
- `src/app/timer/hook-example/page.tsx` - Ejemplo usando el hook useTimer

## 🎯 Características

### ✅ Solo cuenta el tiempo
- No tiene funcionalidades adicionales
- No completa automáticamente matches
- No modifica el estado del juego
- Solo muestra el tiempo restante

### ✅ Controles básicos
- **Iniciar/Pausar** - Controla el estado del temporizador
- **Reiniciar** - Vuelve al tiempo inicial
- **Auto-inicio** - Opción para iniciar automáticamente

### ✅ Interfaz visual
- Formato de tiempo MM:SS
- Cambio de colores según tiempo restante:
  - 🟢 Verde: Tiempo normal
  - 🟡 Amarillo: 10 minutos o menos
  - 🔴 Rojo: 5 minutos o menos

### ✅ Callbacks opcionales
- `onStart` - Se ejecuta al iniciar
- `onStop` - Se ejecuta al detener
- `onComplete` - Se ejecuta al completar
- `onTick` - Se ejecuta cada segundo

## 🚀 Uso

### Componente Timer
```tsx
import { Timer } from "@/components/ui/timer";

// Temporizador básico de 10 minutos
<Timer duration={10} />

// Temporizador con callbacks
<Timer 
  duration={5}
  autoStart={true}
  onComplete={() => alert("¡Tiempo completado!")}
  onStart={() => console.log("Iniciado")}
  onStop={() => console.log("Detenido")}
/>
```

### Hook useTimer
```tsx
import { useTimer } from "@/hooks/use-timer";

const {
  timeRemaining,
  formattedTime,
  isRunning,
  start,
  stop,
  reset,
  toggle,
} = useTimer({
  duration: 15,
  onComplete: () => alert("¡Completado!"),
  onTick: (time) => {
    if (time <= 30000) console.log("¡30 segundos!");
  }
});
```

## 📱 Páginas de Acceso

1. **Página principal**: `/timer` - Múltiples temporizadores de ejemplo
2. **Ejemplo con hook**: `/timer/hook-example` - Demostración del hook useTimer

## 🔧 Propiedades del Componente Timer

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `duration` | `number` | Duración en minutos (requerido) |
| `autoStart` | `boolean` | Iniciar automáticamente (opcional) |
| `onStart` | `() => void` | Callback al iniciar (opcional) |
| `onStop` | `() => void` | Callback al detener (opcional) |
| `onComplete` | `() => void` | Callback al completar (opcional) |
| `className` | `string` | Clases CSS adicionales (opcional) |

## 🎣 Propiedades del Hook useTimer

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `duration` | `number` | Duración en minutos (requerido) |
| `autoStart` | `boolean` | Iniciar automáticamente (opcional) |
| `onStart` | `() => void` | Callback al iniciar (opcional) |
| `onStop` | `() => void` | Callback al detener (opcional) |
| `onComplete` | `() => void` | Callback al completar (opcional) |
| `onTick` | `(time: number) => void` | Callback cada segundo (opcional) |

## 📋 Valores Retornados por useTimer

| Valor | Tipo | Descripción |
|-------|------|-------------|
| `timeRemaining` | `number` | Tiempo restante en milisegundos |
| `formattedTime` | `string` | Tiempo formateado (MM:SS) |
| `isRunning` | `boolean` | Si el temporizador está ejecutándose |
| `start` | `() => void` | Función para iniciar |
| `stop` | `() => void` | Función para detener |
| `reset` | `() => void` | Función para reiniciar |
| `toggle` | `() => void` | Función para alternar inicio/detención |
| `formatTime` | `(ms: number) => string` | Función para formatear tiempo |

## 🎨 Personalización

El temporizador usa Tailwind CSS y puede ser personalizado fácilmente:

```tsx
// Personalizar colores
<Timer 
  duration={10}
  className="bg-blue-100 border-blue-300"
/>

// Usar el hook para control total
const { formattedTime, isRunning, toggle } = useTimer({ duration: 5 });

return (
  <div className="custom-timer">
    <span className="time-display">{formattedTime}</span>
    <button onClick={toggle}>
      {isRunning ? "Pausar" : "Iniciar"}
    </button>
  </div>
);
```

## 🔄 Diferencias con el Temporizador Original

| Aspecto | Temporizador Original | Temporizador Simple |
|---------|----------------------|-------------------|
| **Funcionalidad** | Completa matches automáticamente | Solo cuenta el tiempo |
| **Control** | Integrado en SwissTournamentManager | Componente independiente |
| **Reutilización** | Específico para torneos | Reutilizable en cualquier lugar |
| **Flexibilidad** | Limitada | Total control con hook |
| **Simplicidad** | Complejo con lógica de negocio | Simple y enfocado |

## ✅ Cumple con tu Solicitud

- ✅ **Solo es un temporizador** - No tiene funcionalidades adicionales
- ✅ **Solo cuenta el tiempo** - No modifica el estado del juego
- ✅ **Simple y enfocado** - Hace una cosa y la hace bien
- ✅ **Reutilizable** - Puede usarse en cualquier parte de la aplicación
- ✅ **Flexible** - Tanto como componente como hook 