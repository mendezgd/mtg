# Componente de Donaciones - Documentación

## Descripción
Componente discreto de donaciones que incluye dos variantes:
1. **Navbar**: Integrado en la barra de navegación (recomendado)
2. **Floating**: Botón flotante circular (legacy)

## Características

### ✅ Implementadas

#### 🎯 Variante Navbar (Recomendada)
- ✅ Integrado en la barra de navegación
- ✅ Dropdown menu elegante y discreto
- ✅ Icono de corazón + texto "Apoyar" (desktop)
- ✅ Solo icono en móvil para ahorrar espacio
- ✅ Separador visual para distinguirlo
- ✅ Colores: #29abe2 (Ko-fi) y #009ee3 (MercadoPago)
- ✅ Iconos de Lucide React (Coffee, CreditCard, ExternalLink)
- ✅ Responsive design completo
- ✅ Accesibilidad completa (ARIA, navegación por teclado)
- ✅ Soporte para modo oscuro
- ✅ Animaciones suaves

#### 🔄 Variante Floating (Legacy)
- ✅ Botón flotante circular fijo (50x50px en desktop, 45x45px en móvil)
- ✅ Posición: esquina inferior derecha (20px desde bordes)
- ✅ Efectos hover: escala 1.05 y cambio de opacidad
- ✅ Efecto de pulso discreto cada 15 segundos
- ✅ Sombra suave con efecto hover mejorado
- ✅ Animaciones suaves (300ms ease-in-out)

### 📍 Ubicación
- **Archivo del componente**: `src/components/DonationButton.tsx`
- **Estilos CSS**: `src/app/globals.css` (líneas 258-320)
- **Integración Navbar**: `src/components/Navbar.tsx` (líneas 58 y 95)
- **Integración Floating**: `src/app/layout.tsx` (línea 175) - Removido

## Personalización

### Colores
```css
/* En src/app/globals.css */
:root {
  --donation-primary: #29abe2;    /* Color principal */
  --donation-secondary: #009ee3;  /* Color secundario */
  --donation-hover: #1a8bc7;      /* Color hover */
}
```

### Tamaños
```css
/* Botón principal */
.donation-button {
  width: 50px;  /* Desktop */
  height: 50px;
}

/* Móvil */
@media (max-width: 768px) {
  .donation-button-mobile {
    width: 45px !important;
    height: 45px !important;
  }
}
```

### Posición
```css
/* Cambiar posición del botón */
.donation-button {
  bottom: 20px;  /* Distancia desde abajo */
  right: 20px;   /* Distancia desde la derecha */
}
```

### Enlaces de Donación
```tsx
// En src/components/DonationButton.tsx
const handleDonationClick = (url: string) => {
  // Cambiar URLs aquí
  window.open(url, '_blank', 'noopener,noreferrer');
  setIsOpen(false);
};

// Líneas 89 y 125
onClick={() => handleDonationClick('https://ko-fi.com/fattiepox')}
onClick={() => handleDonationClick('https://www.mercadopago.com.ar/fattiepox')}
```

### Frecuencia del Pulso
```tsx
// En src/components/DonationButton.tsx, línea 15
const pulseInterval = setInterval(() => {
  setIsPulsing(true);
  setTimeout(() => setIsPulsing(false), 1000);
}, 10000); // Cambiar 10000 por el tiempo deseado en ms
```

## Estructura del Componente

### Props
```tsx
interface DonationButtonProps {
  className?: string; // Clases CSS adicionales
}
```

### Estados
- `isOpen`: Controla la visibilidad del menú
- `isPulsing`: Controla el efecto de pulso

### Funciones
- `handleToggle()`: Abre/cierra el menú
- `handleClose()`: Cierra el menú
- `handleDonationClick(url)`: Abre enlace de donación

## Accesibilidad

### Atributos ARIA
- `aria-label`: Descripción del botón
- `aria-expanded`: Estado del menú
- `aria-haspopup`: Indica que tiene menú emergente

### Navegación por Teclado
- Tab para navegar al botón
- Enter/Space para abrir menú
- Escape para cerrar menú
- Tab para navegar entre opciones

### Preferencias de Usuario
- `prefers-reduced-motion`: Desactiva animaciones
- `prefers-contrast: high`: Aumenta contraste
- `prefers-color-scheme: dark`: Modo oscuro

## Responsive Design

### Breakpoints
- **Desktop**: 50x50px, posición estándar
- **Tablet**: 50x50px, posición ajustada
- **Móvil**: 45x45px, posición optimizada

### Menú Emergente
- **Desktop**: 280-320px de ancho
- **Móvil**: 260px mínimo, máximo 100vw-30px

## Animaciones

### Efectos Disponibles
1. **Hover**: Escala 1.05 + cambio de opacidad
2. **Active**: Escala 0.95 (feedback táctil)
3. **Pulse**: Pulso discreto cada 10 segundos
4. **Fade-in**: Aparición suave del menú

### Duración
- Transiciones: 300ms ease-in-out
- Animaciones: 1s ease-in-out
- Fade-in: 0.3s ease-out

## Integración

### Uso en Navbar (Recomendado)
```tsx
// src/components/Navbar.tsx
import DonationButton from './DonationButton';

// En la navegación desktop
<div className="hidden md:flex items-center space-x-1">
  {/* ... otros botones ... */}
  <div className="w-px h-6 bg-gray-700 mx-2" />
  <DonationButton variant="navbar" />
</div>

// En el menú móvil
<div className="md:hidden">
  {/* ... otros botones ... */}
  <div className="w-full h-px bg-gray-700 my-2" />
  <DonationButton variant="navbar" />
</div>
```

### Uso Floating (Legacy)
```tsx
import DonationButton from '@/components/DonationButton';

// En cualquier componente
<DonationButton variant="floating" />

// Con clases personalizadas
<DonationButton variant="floating" className="custom-style" />
```

### Variantes Disponibles
```tsx
// Navbar (recomendado)
<DonationButton variant="navbar" />

// Floating (legacy)
<DonationButton variant="floating" />
```

## Troubleshooting

### Problemas Comunes

1. **Botón no aparece**
   - Verificar que esté importado en layout.tsx
   - Revisar z-index (debe ser 50)

2. **Menú no se abre**
   - Verificar que el componente sea 'use client'
   - Revisar eventos onClick

3. **Estilos no se aplican**
   - Verificar que globals.css esté importado
   - Revisar clases CSS personalizadas

4. **No es responsive**
   - Verificar media queries en globals.css
   - Revisar clases donation-button-mobile

### Debug
```tsx
// Agregar logs para debug
console.log('Donation button state:', { isOpen, isPulsing });
```

## Notas de Desarrollo

### Dependencias
- React 18+ (hooks: useState, useEffect)
- Tailwind CSS (clases utilitarias)
- TypeScript (tipado)

### Compatibilidad
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Móviles (iOS/Android)

### Performance
- Lazy loading del menú (solo se renderiza cuando está abierto)
- Cleanup de intervalos en useEffect
- Optimizaciones de CSS (transform en lugar de position)

### SEO
- No afecta el SEO (botón flotante)
- Enlaces con `noopener,noreferrer`
- No interfiere con el contenido principal
