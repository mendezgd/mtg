import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Deshabilitar optimización completamente
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.plugins.push(
        new (require("@next/bundle-analyzer"))({
          enabled: true,
        })
      );
      return config;
    },
  }),
  // Note: headers, redirects, and rewrites don't work with static export
  // These will need to be handled differently for static hosting
};

export default nextConfig;
