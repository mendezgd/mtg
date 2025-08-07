import { NextResponse } from "next/server";

export async function GET() {
  const localImages = [
    "pixelpox.webp",
    "chudix.webp",
    "chudixd.webp",
    "chudix.jpg",
    "chudixdamon.jpg",
    "pox.webp",
    "pox.png",
  ];

  const testUrls = localImages.map((imageName) => ({
    name: imageName,
    directUrl: `/images/${imageName}`,
    apiUrl: `/api/local-image?name=${encodeURIComponent(imageName)}`,
  }));

  return NextResponse.json({
    localImages: testUrls,
    message:
      "Test local image endpoints - these should work on both local and Vercel",
    note: "The API route should serve images even if direct access fails on Vercel",
  });
}
