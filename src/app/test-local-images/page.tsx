import React from "react";

export default function TestLocalImagesPage() {
  const testImages = [
    { name: "pixelpox.webp", url: "/api/local-image?name=pixelpox.webp" },
    { name: "chudix.webp", url: "/api/local-image?name=chudix.webp" },
    { name: "chudixd.webp", url: "/api/local-image?name=chudixd.webp" },
    { name: "pox.webp", url: "/api/local-image?name=pox.webp" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test Local Images API</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testImages.map((image) => (
          <div key={image.name} className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{image.name}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Direct URL (may fail on Vercel):
                </h3>
                <img
                  src={`/images/${image.name}`}
                  alt={image.name}
                  className="w-32 h-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.border = "2px solid red";
                    e.currentTarget.alt = "Failed to load";
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  API Route (should work on Vercel):
                </h3>
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-32 h-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.border = "2px solid red";
                    e.currentTarget.alt = "Failed to load";
                  }}
                />
              </div>

              <div className="text-sm text-gray-400">
                <p>
                  <strong>API URL:</strong> {image.url}
                </p>
                <p>
                  <strong>Direct URL:</strong> /images/{image.name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ul className="space-y-2 text-gray-300">
          <li>• Red borders indicate failed image loads</li>
          <li>• API routes should work on both local and Vercel</li>
          <li>• Direct URLs may fail on Vercel due to WebP serving issues</li>
          <li>
            • If API routes work but direct URLs don't, the fix is working
          </li>
        </ul>
      </div>
    </div>
  );
}
