import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Content-Security-Policy', 
            // Adicionamos o connect-src para autorizar a comunicação com a API
            value: "default-src 'self'; connect-src 'self' http://localhost:3000; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" 
          },
          { key: 'Cache-Control', value: 'no-store, max-age=0' }
        ],
      },
    ];
  },
};

export default nextConfig;