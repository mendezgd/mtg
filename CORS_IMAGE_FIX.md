# CORS e Imagenes - Problemas y Soluciones

## Problema Original
**Error**: `GET https://cards.scryfall.io/... net::ERR_FAILED` y `Access to image at 'https://cards.scryfall.io/...' from origin 'http://localhost:9002' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

**Causa**: El navegador estaba intentando cargar imágenes externas directamente desde `cards.scryfall.io`, pero el servidor no incluye los headers CORS necesarios.

## Solución Implementada

### 1. Componente SafeImage Mejorado
- **Archivo**: `src/components/ui/safe-image.tsx`
- **Cambio**: Eliminamos la lógica condicional que usaba `<img>` para URLs externas
- **Resultado**: Ahora TODAS las imágenes usan el componente `Next.js Image`, aprovechando el proxy integrado

### 2. Configuración Next.js
- **Archivo**: `next.config.ts`
- **Cambios**:
  - `unoptimized: true` - Deshabilita la optimización de imágenes para evitar problemas en Vercel
  - `domains: ['cards.scryfall.io', 'api.scryfall.com']` - Permite imágenes externas
  - `dangerouslyAllowSVG: true` - Permite archivos SVG

### 3. Imagen por Defecto
- **Archivo**: `public/images/default-card.svg`
- **Propósito**: Imagen de respaldo cuando las imágenes de cartas fallan
- **Diseño**: SVG simple con texto "Card Image" y "Not Available"

### 4. Headers de Seguridad
- **Archivo**: `public/_headers`
- **Propósito**: Headers de seguridad y cache para imágenes
- **Contenido**: Headers de seguridad y control de cache para diferentes tipos de archivos

### 5. Configuración Vercel
- **Archivo**: `vercel.json`
- **Propósito**: Headers adicionales para el despliegue
- **Contenido**: Headers de seguridad y CORS

## Problemas Adicionales Resueltos

### Error de Prioridad/Loading
**Error**: `Uncaught Error: Image with src "/images/pixelpox.jpg" has both "priority" and "loading='lazy'" properties. Only one should be used.`

**Solución**: Modificamos `SafeImage` para usar solo una propiedad a la vez:
```typescript
if (priority) {
  imageProps.priority = true;
} else {
  imageProps.loading = loading;
}
```

### Error 400 Bad Request en Vercel
**Error**: `GET https://mtg-three.vercel.app/_next/image?url=%2Fimages%2Fpixelpox.jpg&w=256&q=75 400 (Bad Request)`

**Solución**: 
- Cambiamos `unoptimized: true` en `next.config.ts`
- Actualizamos `SafeImage` para usar `unoptimized: true`
- Esto evita que Next.js intente optimizar imágenes locales que pueden causar problemas

### Favicon 404
**Error**: `GET https://mtg-three.vercel.app/android-chrome-192x192.png 404 (Not Found)`

**Solución**: 
- Actualizamos `public/site.webmanifest` para usar imágenes existentes
- Cambiamos las referencias de PNG a JPG usando `pixelpox.jpg`

## Verificación

### Scripts de Verificación
- **Archivo**: `scripts/check-images.js`
- **Propósito**: Verifica que todas las imágenes locales existan
- **Uso**: `node scripts/check-images.js`

### Scripts de Prueba
- **Archivo**: `scripts/test-images.js`
- **Propósito**: Prueba la accesibilidad de URLs externas de Scryfall
- **Uso**: `node scripts/test-images.js`

## Estado Actual
**Estado**: ✅ Resuelto
**Impacto**: Todas las imágenes de cartas ahora cargan correctamente sin errores de consola
**Despliegue**: Funciona correctamente en Vercel sin errores 400 Bad Request
**Favicon**: Usa imágenes existentes para evitar 404s

## Archivos Modificados
1. `src/components/ui/safe-image.tsx` - Componente principal de imágenes
2. `next.config.ts` - Configuración de Next.js
3. `public/images/default-card.svg` - Imagen por defecto
4. `public/_headers` - Headers de seguridad
5. `vercel.json` - Configuración de Vercel
6. `public/site.webmanifest` - Manifesto de la aplicación
7. `scripts/check-images.js` - Script de verificación
8. `scripts/test-images.js` - Script de prueba

## Próximos Pasos
- Monitorear el rendimiento de las imágenes en producción
- Considerar implementar lazy loading más avanzado si es necesario
- Evaluar la necesidad de optimización de imágenes en el futuro
