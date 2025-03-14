import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Asegura que la carpeta de salida sea 'dist'
  },
  server: {
    watch: {
      usePolling: true, // 👈 Activa polling para detectar cambios
    },
    host: "0.0.0.0", // 👈 Necesario para que el contenedor acepte conexiones
    strictPort: true,
    port: 5173, // Puedes cambiar el puerto si lo deseas
  },
});
