import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vbqfvypfcicrilxzspdq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Las fotos de jugador (registrar/editar) van dentro del mismo POST del
      // Server Action. El límite por defecto es 1 MB, muy poco para una foto
      // de celular — lo subimos para que la carga de foto no rompa el guardado.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
