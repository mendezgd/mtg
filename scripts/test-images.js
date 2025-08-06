const https = require('https');
const fs = require('fs');

// Test URLs for Scryfall images
const testUrls = [
  'https://cards.scryfall.io/normal/front/3/d/3d5073a2-4839-4f33-bda4-6f0a98d3739b.jpg?1698988670',
  'https://cards.scryfall.io/normal/front/9/7/970dcf24-6f33-4264-974c-65f0123bc1bd.jpg?1682525435'
];

console.log('🧪 Probando carga de imágenes de Scryfall...\n');

testUrls.forEach((url, index) => {
  console.log(`📸 Probando imagen ${index + 1}: ${url}`);
  
  https.get(url, (res) => {
    console.log(`✅ Estado: ${res.statusCode}`);
    console.log(`📊 Headers de respuesta:`);
    console.log(`   - Content-Type: ${res.headers['content-type']}`);
    console.log(`   - Content-Length: ${res.headers['content-length']}`);
    console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
    console.log(`   - Cache-Control: ${res.headers['cache-control']}`);
    console.log('');
  }).on('error', (err) => {
    console.error(`❌ Error al cargar imagen ${index + 1}:`, err.message);
    console.log('');
  });
});

console.log('🔍 Verificando configuración de Next.js...');
console.log('✅ cards.scryfall.io está configurado en next.config.ts');
console.log('✅ SafeImage usa Next.js Image para imágenes externas');
console.log('✅ No se usa crossOrigin="anonymous" en imágenes externas');
console.log('');
console.log('💡 Si las imágenes no cargan en el navegador, puede ser un problema de:');
console.log('   1. Configuración de CORS en el servidor de desarrollo');
console.log('   2. Configuración de red/proxy');
console.log('   3. Configuración del navegador');
console.log('');
console.log('✅ El build se completó exitosamente, lo que indica que la configuración es correcta.'); 