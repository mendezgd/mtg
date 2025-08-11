#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Lista de imágenes críticas que deben existir
const criticalImages = [
  "/images/chudix.webp",
  "/images/chudixd.webp",
  "/assets/images/chudix.webp",
  "/assets/images/chudixd.webp",
  "/images/pixelpox.webp",
  "/images/default-card.svg",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Verificar que las imágenes existan
function verifyImages() {
  console.log("🔍 Verificando imágenes locales...\n");

  const publicDir = path.join(process.cwd(), "public");
  let allImagesExist = true;

  criticalImages.forEach((imagePath) => {
    const fullPath = path.join(publicDir, imagePath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${imagePath} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`❌ ${imagePath} - NO ENCONTRADO`);
      allImagesExist = false;
    }
  });

  console.log("\n" + "=".repeat(50));

  if (allImagesExist) {
    console.log("🎉 Todas las imágenes críticas están presentes");
    console.log("💡 Si las imágenes no cargan en producción, verifica:");
    console.log("   1. La configuración de next.config.ts");
    console.log("   2. La configuración de vercel.json");
    console.log("   3. Los headers de caché");
    console.log("   4. Los permisos de archivos en Vercel");
  } else {
    console.log("⚠️  Algunas imágenes críticas faltan");
    console.log(
      "   Asegúrate de que todas las imágenes estén en /public/images/ y /public/assets/images/"
    );
  }

  return allImagesExist;
}

// Verificar configuración de archivos
function verifyConfig() {
  console.log("\n🔧 Verificando configuración...\n");

  const nextConfigPath = path.join(process.cwd(), "next.config.ts");
  const vercelConfigPath = path.join(process.cwd(), "vercel.json");

  if (fs.existsSync(nextConfigPath)) {
    console.log("✅ next.config.ts existe");
  } else {
    console.log("❌ next.config.ts no encontrado");
  }

  if (fs.existsSync(vercelConfigPath)) {
    console.log("✅ vercel.json existe");
  } else {
    console.log("❌ vercel.json no encontrado");
  }
}

// Ejecutar verificaciones
if (require.main === module) {
  verifyImages();
  verifyConfig();

  console.log("\n📋 Checklist para producción:");
  console.log("   □ Verificar que las imágenes estén en el repositorio");
  console.log("   □ Confirmar que next.config.ts tenga headers correctos");
  console.log("   □ Verificar que vercel.json no tenga conflictos");
  console.log("   □ Probar las imágenes en desarrollo local");
  console.log("   □ Verificar logs de Vercel después del deploy");
  console.log("   □ Comprobar Network tab en DevTools");
}

module.exports = { verifyImages, verifyConfig };
