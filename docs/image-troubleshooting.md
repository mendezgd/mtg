# Guía de Solución de Problemas para Imágenes Locales

## Problema
Las imágenes locales (`chudix.webp`, `chudixd.webp`) funcionan en desarrollo pero no en producción después de varios deploys.

## Causas Identificadas

### 1. Conflictos de Headers
- **Problema**: Headers duplicados entre `next.config.ts` y `vercel.json`
- **Solución**: Simplificar configuración, eliminar redundancias

### 2. Políticas de Seguridad Restrictivas
- **Problema**: CSP muy estricto bloqueando recursos locales
- **Solución**: Ajustar políticas de seguridad

### 3. Headers de CORS Problemáticos
- **Problema**: `Cross-Origin-Embedder-Policy: require-corp` bloqueando imágenes
- **Solución**: Eliminar headers innecesarios para recursos locales

## Solución Implementada

### 1. Configuración de next.config.ts
```typescript
headers: async () => {
  return [
    {
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
      ],
    },
    // ... otros headers
  ];
},
```

### 2. Configuración de vercel.json (Simplificada)
```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 3. Componente LocalImage Optimizado
```typescript
const LocalImage: React.FC<LocalImageProps> = ({
  src,
  alt,
  fallbackSrc = "/images/default-card.svg",
  // ... otras props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      // ... otras props
    />
  );
};
```

## Verificación y Prevención

### Script de Verificación
```bash
npm run verify-images
```

Este script verifica:
- ✅ Existencia de imágenes críticas
- ✅ Tamaños de archivo
- ✅ Configuración de archivos

### Checklist Pre-Deploy
```bash
npm run pre-deploy
```

1. **Verificar imágenes en repositorio**
   ```bash
   git ls-files public/images/
   ```

2. **Probar en desarrollo local**
   ```bash
   npm run dev
   ```

3. **Verificar configuración**
   - `next.config.ts` tiene headers correctos
   - `vercel.json` no tiene conflictos
   - No hay headers duplicados

4. **Después del deploy**
   - Verificar logs de Vercel
   - Comprobar Network tab en DevTools
   - Verificar que las imágenes se sirvan con headers correctos

## Debugging en Producción

### 1. Verificar Headers de Respuesta
```bash
curl -I https://tu-dominio.vercel.app/images/chudix.webp
```

**Headers esperados:**
```
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: *
Content-Type: image/webp
```

### 2. Verificar en DevTools
1. Abrir Network tab
2. Recargar página
3. Buscar imágenes con error 404 o problemas de CORS
4. Verificar headers de respuesta

### 3. Logs de Vercel
```bash
vercel logs --follow
```

Buscar errores relacionados con:
- Imágenes no encontradas
- Problemas de permisos
- Errores de configuración

## Mejores Prácticas

### 1. Estructura de Archivos
```
public/
├── images/
│   ├── chudix.webp
│   ├── chudixd.webp
│   └── default-card.svg
├── favicon.ico
└── ...
```

### 2. Nomenclatura
- Usar nombres descriptivos
- Mantener consistencia en extensiones
- Evitar espacios y caracteres especiales

### 3. Optimización
- Comprimir imágenes antes de subir
- Usar formatos modernos (WebP, AVIF)
- Mantener tamaños razonables

### 4. Fallbacks
- Siempre proporcionar imágenes de fallback
- Manejar errores de carga
- Usar placeholders mientras cargan

## Comandos Útiles

### Verificar Imágenes
```bash
npm run verify-images
```

### Pre-Deploy Check
```bash
npm run pre-deploy
```

### Limpiar Cache
```bash
npm run clean
```

### Analizar Bundle
```bash
npm run analyze
```

## Contacto y Soporte

Si los problemas persisten:
1. Verificar logs de Vercel
2. Comprobar configuración de dominio
3. Verificar permisos de archivos
4. Contactar soporte de Vercel si es necesario

## Notas Importantes

- Las imágenes en `/public` se sirven estáticamente
- Los headers de caché son importantes para performance
- Evitar configuraciones redundantes entre archivos
- Mantener configuración simple y clara
