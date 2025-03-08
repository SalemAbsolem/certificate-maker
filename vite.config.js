import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: './', // Относительные пути для GitHub Pages
  root: 'src',
  server: {
    port: 3000,
    open: true,
    host: true, // Доступ по локальной сети
  },
  build: {
    outDir: '../dist', // Папка для сборки
    emptyOutDir: true, // Очистка папки перед сборкой
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html'),
      },
    },
  },
  plugins: [
    VitePWA({
      manifest: {
        name: 'Генератор сертификатов',
        short_name: 'Сертификаты',
        description: 'Генератор сертификатов с возможностью сохранения на телефон',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
