import { defineConfig, devices } from '@playwright/test'

// Tests de extremo a extremo (E2E): un navegador real recorre la app con el
// backend y el frontend arrancados en local. Las contraseñas de los usuarios de
// prueba se leen de .env.e2e (no se sube al repo; ver .env.e2e.example).
try {
  process.loadEnvFile('.env.e2e')
} catch {
  // Sin .env.e2e los recorridos que necesitan iniciar sesión se saltan.
}

export default defineConfig({
  testDir: './e2e',
  // Los recorridos comparten la misma base de datos: mejor de uno en uno.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:5173',
    // Los certificados de mkcert son locales: el navegador de pruebas no los conoce.
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})