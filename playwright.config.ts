import { defineConfig, devices } from "@playwright/test";

/**
 * Die Tests laufen gegen eine echte Instanz mit echtem Appwrite — kein Mock.
 * Genau deshalb sind sie aussagekräftig: sie hätten den blockierten
 * Hydrations-Fehler und die kaputte Mandantentrennung beide gefunden.
 *
 * Standardziel ist die lokale Instanz auf Port 3016. Gegen die Live-Instanz
 * mit `FOKUS_BASE_URL=https://fokus.it-handwerk-stuttgart.de npm test`.
 */
/**
 * Eigener Port für Tests. Die Produktivinstanz auf 3016 bleibt unangetastet,
 * und die Ratenbremse darf hier großzügig sein, ohne sie dort zu schwächen.
 */
const TEST_PORT = 3017;
const baseURL = process.env.FOKUS_BASE_URL ?? `http://localhost:${TEST_PORT}`;
const eigenerServer = !process.env.FOKUS_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Konten und Projekte kollidieren sonst über parallele Läufe hinweg.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "handy",
      use: { ...devices["Pixel 7"] },
    },
  ],
  ...(eigenerServer
    ? {
        webServer: {
          command: `next start -p ${TEST_PORT}`,
          port: TEST_PORT,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            NODE_ENV: "production",
            FOKUS_RATE_LIMIT_MULTIPLIER: "500",
            NEXT_PUBLIC_SITE_URL: `http://localhost:${TEST_PORT}`,
          },
        },
      }
    : {}),
});
