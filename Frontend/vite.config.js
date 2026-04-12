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
  define: {
    'VITE_API_BASE_URL': process.env.VITE_API_BASE_URL || 'https://dreamhire-backend-ljay.onrender.com',
  },
})
