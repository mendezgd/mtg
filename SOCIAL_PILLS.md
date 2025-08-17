# Social Pills - Documentación

## Descripción
Componente de redes sociales en formato "pills" (píldoras) para el footer de la aplicación. Incluye iconos y enlaces a las principales redes sociales.

## Características

### ✅ Implementadas
- ✅ **5 redes sociales**: YouTube, Instagram, X (Twitter), Twitch, Kick
- ✅ **Diseño pill**: Botones redondeados con colores de marca
- ✅ **Responsive**: Solo iconos en móvil, iconos + texto en desktop
- ✅ **Efectos hover**: Escala, sombra y cambio de color
- ✅ **Colores de marca**: Cada red social tiene su color característico
- ✅ **Accesibilidad**: ARIA labels y navegación por teclado
- ✅ **Modo oscuro**: Soporte completo para tema oscuro
- ✅ **Animaciones suaves**: Transiciones de 300ms

### 📍 Ubicación
- **Archivo del componente**: `src/components/SocialPills.tsx`
- **Integración**: `src/app/page.tsx` (footer, línea ~170)

## Redes Sociales Incluidas

### 🎯 YouTube
- **Color**: Rojo (#dc2626)
- **Icono**: Lucide React `Youtube`
- **URL**: `https://youtube.com/@TU_CANAL`
- **Hover**: Escala 1.05 + sombra

### 📸 Instagram
- **Color**: Gradiente púrpura a rosa
- **Icono**: Lucide React `Instagram`
- **URL**: `https://instagram.com/TU_USUARIO`
- **Hover**: Escala 1.05 + sombra

### 🐦 X (Twitter)
- **Color**: Negro (blanco en modo oscuro)
- **Icono**: Lucide React `Twitter`
- **URL**: `https://x.com/TU_USUARIO`
- **Hover**: Escala 1.05 + sombra

### 🟣 Twitch
- **Color**: Púrpura (#9333ea)
- **Icono**: Lucide React `Twitch`
- **URL**: `https://twitch.tv/TU_CANAL`
- **Hover**: Escala 1.05 + sombra

### 🟢 Kick
- **Color**: Verde (#16a34a)
- **Icono**: Texto "K" (placeholder)
- **URL**: `https://kick.com/TU_CANAL`
- **Hover**: Escala 1.05 + sombra

## Personalización

### Cambiar URLs
```tsx
// En src/components/SocialPills.tsx
const handleSocialClick = (url: string) => {
  // Cambiar URLs aquí
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Líneas específicas:
onClick={() => handleSocialClick('https://youtube.com/@TU_CANAL')}
onClick={() => handleSocialClick('https://instagram.com/TU_USUARIO')}
onClick={() => handleSocialClick('https://x.com/TU_USUARIO')}
onClick={() => handleSocialClick('https://twitch.tv/TU_CANAL')}
onClick={() => handleSocialClick('https://kick.com/TU_CANAL')}
```

### Cambiar Colores
```tsx
// YouTube
className="... bg-red-600 hover:bg-red-700 ..."

// Instagram
className="... bg-gradient-to-r from-purple-500 to-pink-500 ..."

// X (Twitter)
className="... bg-black dark:bg-white ..."

// Twitch
className="... bg-purple-600 hover:bg-purple-700 ..."

// Kick
className="... bg-green-600 hover:bg-green-700 ..."
```

### Cambiar Tamaños
```tsx
// Iconos
<Youtube className="w-4 h-4" />

// Texto
<span className="text-sm font-medium hidden sm:inline">YouTube</span>

// Botones
className="... px-4 py-2 ..."
```

## Estructura del Componente

### Props
```tsx
interface SocialPillsProps {
  className?: string; // Clases CSS adicionales
}
```

### Funciones
- `handleSocialClick(url)`: Abre enlace de red social

### Estados
- No tiene estados internos (componente estático)

## Responsive Design

### Breakpoints
- **Móvil (< 640px)**: Solo iconos
- **Desktop (≥ 640px)**: Iconos + texto

### Clases Responsive
```tsx
<span className="text-sm font-medium hidden sm:inline">YouTube</span>
```

## Accesibilidad

### Atributos ARIA
- `aria-label`: Descripción específica para cada red social
- Ejemplo: "Sígueme en YouTube", "Sígueme en Instagram"

### Navegación por Teclado
- Tab para navegar entre botones
- Enter/Space para activar enlaces
- Escape para cerrar (si aplica)

### Preferencias de Usuario
- `prefers-reduced-motion`: Respeta preferencias de movimiento
- `prefers-color-scheme: dark`: Modo oscuro automático

## Integración

### Uso Básico
```tsx
import SocialPills from '@/components/SocialPills';

// En cualquier componente
<SocialPills />
```

### Con Clases Personalizadas
```tsx
<SocialPills className="my-8" />
```

### En Footer
```tsx
// src/app/page.tsx
<div className="mb-6">
  <p className="text-sm text-gray-500 mb-4">Sígueme en redes sociales</p>
  <SocialPills />
</div>
```

## Animaciones

### Efectos Disponibles
1. **Hover**: Escala 1.05 + sombra
2. **Color**: Cambio de color de fondo
3. **Transición**: 300ms ease-in-out

### Clases de Animación
```tsx
className="... transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
```

## Troubleshooting

### Problemas Comunes

1. **Iconos no aparecen**
   - Verificar que Lucide React esté instalado
   - Revisar imports de iconos

2. **Enlaces no funcionan**
   - Verificar URLs en `handleSocialClick`
   - Revisar bloqueadores de popups

3. **Estilos no se aplican**
   - Verificar que Tailwind CSS esté configurado
   - Revisar clases CSS

4. **No es responsive**
   - Verificar clases `hidden sm:inline`
   - Revisar breakpoints de Tailwind

### Debug
```tsx
// Agregar logs para debug
const handleSocialClick = (url: string) => {
  console.log('Opening social link:', url);
  window.open(url, '_blank', 'noopener,noreferrer');
};
```

## Notas de Desarrollo

### Dependencias
- React 18+ (hooks)
- Lucide React (iconos)
- Tailwind CSS (estilos)

### Compatibilidad
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Móviles (iOS/Android)

### Performance
- Iconos optimizados de Lucide React
- Lazy loading de enlaces
- Transiciones CSS optimizadas

### SEO
- Enlaces con `noopener,noreferrer`
- No afecta el SEO de la página principal
- Mejora la presencia en redes sociales
