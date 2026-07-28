import { expect, test } from "@playwright/test";

import { createProject, createTask, ensureLoggedIn, logout, makeUser, purgeUser, register } from "./helpers";

/**
 * Der Weg, den jeder neue Nutzer geht. Läuft der durch, funktioniert die App.
 */
test.describe("Ablauf von der Registrierung bis zum Export", () => {
  const user = makeUser("ablauf");

  test.afterAll(async () => {
    await purgeUser(user.email);
  });

  test("Startseite erklärt das Produkt, bevor man sich anmelden muss", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Eine nächste Aufgabe");
    await expect(page.getByRole("link", { name: "Kostenlos starten" })).toBeVisible();
    // Die Rechtstexte müssen ohne Anmeldung erreichbar sein.
    await expect(page.getByRole("link", { name: "Impressum" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Datenschutz" })).toBeVisible();
  });

  test("Registrieren, Projekt und Aufgaben anlegen, Score stimmt", async ({ page }) => {
    await register(page, user);

    await createProject(page, "Testprojekt Ablauf");
    await createTask(page, "Wichtig und schnell", { impact: 5, urgency: 5, effort: 2 });
    await createTask(page, "Egal und mühsam", { impact: 1, urgency: 1, effort: 5 });

    // (5 × 5 × 0,8) ÷ 2 = 10,0 — Standardsicherheit ist 80 %.
    await expect(page.getByText("10,0").first()).toBeVisible();

    // Die wichtigere Aufgabe steht auf der Übersicht ganz oben.
    await page.goto("/uebersicht");
    const naechste = page.locator("h2").filter({ hasText: "Wichtig und schnell" });
    await expect(naechste).toBeVisible();
  });

  test("Begründung erklärt den Score in Worten", async ({ page }) => {
    await ensureLoggedIn(page, user);
    await page.goto("/uebersicht");
    await page.getByText("Warum?").first().click();
    await expect(page.getByText(/bringt viel/i).first()).toBeVisible();
    await expect(page.getByText("Bringt viel").first()).toBeVisible();
  });

  test("Fokusmodus zeigt die Aufgabe und die Uhr läuft", async ({ page }) => {
    await ensureLoggedIn(page, user);
    await page.goto("/fokus");

    await expect(page.getByText("Wichtig und schnell").first()).toBeVisible();

    await page.getByRole("button", { name: "Fokus starten" }).click();
    await expect(page.getByRole("status").filter({ hasText: "läuft" })).toBeVisible();

    // Nach ein paar Sekunden muss die Restzeit gesunken sein.
    await page.waitForTimeout(4000);
    await expect(page.getByRole("status").filter({ hasText: /läuft, noch 24:5[0-9]/ })).toBeVisible();

    // Und sie überlebt einen Seitenwechsel.
    await page.goto("/uebersicht");
    await page.goto("/fokus");
    await expect(page.getByRole("status").filter({ hasText: "läuft" })).toBeVisible();
  });

  test("Export enthält Projekt und Aufgaben", async ({ page }) => {
    await ensureLoggedIn(page, user);
    const res = await page.request.get("/api/export");
    expect(res.status()).toBe(200);

    const daten = (await res.json()) as {
      format: string;
      projects: { name: string }[];
      tasks: { title: string }[];
    };
    expect(daten.format).toBe("fokus-export");
    expect(daten.projects.map((p) => p.name)).toContain("Testprojekt Ablauf");
    expect(daten.tasks.map((t) => t.title)).toContain("Wichtig und schnell");
  });

  test("Abmelden sperrt den geschützten Bereich", async ({ page }) => {
    await ensureLoggedIn(page, user);
    await logout(page);
    await page.goto("/uebersicht");
    await expect(page).toHaveURL(/\/anmelden$/);
  });
});
