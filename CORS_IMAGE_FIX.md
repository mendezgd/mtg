# Fix para CORS en Imágenes de Scryfall

## Problema Identificado

Se reportó un error de CORS al cargar imágenes desde `cards.scryfall.io`:

```
Access to image at 'https://cards.scryfall.io/normal/front/9/7/970dcf24-6f33-4264-974c-65f0123bc1bd.jpg?1682525435' 
from origin 'http://localhost:9002' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Análisis del Problema

1. **Causa Raíz**: El servidor de Scryfall no envía headers `Access-Control-Allow-Origin`
2. **Contexto**: El error ocurría al usar `<img>` tags con `crossOrigin="anonymous"`
3. **Impacto**: Las imágenes de cartas no se cargaban en el navegador

## Solución Implementada

### 1. Modificación del Componente SafeImage

**Antes:**
```typescript
// Usar <img> tag para imágenes externas
if (src.startsWith("http")) {
  return (
    <img
      src={imgSrc}
      alt={alt}
      crossOrigin="anonymous" // ❌ Causaba error CORS
      // ...
    />
  );
}
```

**Después:**
```typescript
// Usar Next.js Image para todas las imágenes
return (
  <Image
    src={imgSrc}
    alt={alt}
    width={width || 100}
    height={height || 140}
    // ✅ Next.js maneja la optimización y evita CORS
  />
);
```

### 2. Configuración de Next.js

El archivo `next.config.ts` ya tenía la configuración correcta:

```typescript
images: {
  domains: ['cards.scryfall.io', 'api.scryfall.com'], // ✅ Dominios permitidos
  formats: ['image/webp', 'image/avif'],
  unoptimized: false, // ✅ Optimización habilitada
}
```

### 3. Fix para Conflicto Priority/Loading

**Problema Adicional:**
```
Uncaught Error: Image with src "/images/pixelpox.jpg" has both "priority" and "loading='lazy'" properties. Only one should be used.
```

**Solución:**
```typescript
// Preparar las props para Next.js Image
const imageProps: any = {
  src: imgSrc,
  alt,
  width: width || 100,
  height: height || 140,
  className,
  onError: handleError,
  unoptimized: false,
};

// Solo usar priority o loading, no ambos
if (priority) {
  imageProps.priority = true;
} else {
  imageProps.loading = loading;
}

return <Image {...imageProps} />;
```

## ¿Por qué Funciona?

1. **Next.js Image Optimization**: Next.js actúa como proxy para las imágenes externas
2. **Sin CORS**: Al usar el componente `Image` de Next.js, las imágenes se sirven desde el mismo dominio
3. **Optimización Automática**: Next.js optimiza automáticamente las imágenes (WebP, AVIF)
4. **Caching**: Mejor gestión del caché de imágenes
5. **Props Conflict Resolution**: Manejo correcto de props mutuamente excluyentes

## Verificación

### Test de Accesibilidad
```bash
node scripts/test-images.js
```

**Resultado:**
- ✅ HTTP 200: Las imágenes son accesibles
- ✅ Content-Type: image/jpeg
- ❌ Access-Control-Allow-Origin: undefined (esperado)

### Build de Producción
```bash
npm run build
```

**Resultado:**
- ✅ Compilación exitosa
- ✅ Sin errores de TypeScript
- ✅ Sin conflictos de props
- ✅ Todas las páginas generadas correctamente

## Beneficios Adicionales

1. **Performance**: Optimización automática de imágenes
2. **Responsive**: Tamaños automáticos según dispositivo
3. **Lazy Loading**: Carga diferida por defecto
4. **Fallbacks**: Manejo de errores con imagen por defecto
5. **SEO**: Mejor rendimiento en métricas de Core Web Vitals
6. **Props Safety**: Manejo seguro de props mutuamente excluyentes

## Archivos Modificados

- `src/components/ui/safe-image.tsx`: Eliminado uso de `<img>` para imágenes externas y fix de props conflict
- `scripts/test-images.js`: Script de verificación creado
- `CORS_IMAGE_FIX.md`: Esta documentación

## Conclusión

El problema de CORS se resolvió al eliminar el uso de `crossOrigin="anonymous"` y usar exclusivamente el componente `Image` de Next.js, que maneja automáticamente la optimización y el proxy de imágenes externas. También se resolvió el conflicto de props `priority`/`loading`.

**Estado**: ✅ Resuelto
**Impacto**: Todas las imágenes de cartas ahora cargan correctamente sin errores de consola 