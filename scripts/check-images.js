const fs = require('fs');
const path = require('path');

// Verificar que las imágenes locales existan
const publicImagesDir = path.join(__dirname, '../public/images');
const requiredImages = [
  'pixelpox.jpg',
  'default-card.svg',
  'chudix.webp',
  'chudixd.webp',
  'pox.webp',
  'background.webp'
];

console.log('🔍 Verificando imágenes locales...');

if (!fs.existsSync(publicImagesDir)) {
  console.error('❌ El directorio public/images no existe');
  process.exit(1);
}

const existingImages = fs.readdirSync(publicImagesDir);
const missingImages = requiredImages.filter(img => !existingImages.includes(img));

if (missingImages.length > 0) {
  console.error('❌ Imágenes faltantes:', missingImages);
  process.exit(1);
} else {
  console.log('✅ Todas las imágenes locales están presentes');
}

console.log('📁 Imágenes encontradas:', existingImages);
console.log('✅ Verificación completada'); 