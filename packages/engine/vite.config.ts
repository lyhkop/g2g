import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import glsl from 'vite-plugin-glsl';
import cesium from 'vite-plugin-cesium';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts(), glsl(), cesium()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
