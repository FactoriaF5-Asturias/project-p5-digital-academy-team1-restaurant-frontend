import fs from 'fs'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

const CERT_KEY_PATH = '../certs/localhost+2-key.pem'
const CERT_PATH = '../certs/localhost+2.pem'

// Solo activamos HTTPS si los certificados locales existen de verdad
// (no se suben al repo, así que en CI o en una máquina sin mkcert no estarán).
const hasLocalCerts = fs.existsSync(CERT_KEY_PATH) && fs.existsSync(CERT_PATH)

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    ...(hasLocalCerts && {
      https: {
        key: fs.readFileSync(CERT_KEY_PATH),
        cert: fs.readFileSync(CERT_PATH),
      },
    }),
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Los tests E2E de la carpeta e2e/ los ejecuta Playwright, no Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})