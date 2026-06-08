/** @type {import('next').NextConfig} */
const nextConfig = {
  // Линтуем локально; на сборке не блокируем деплой из-за ESLint.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
