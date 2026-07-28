import { expect, test } from "@playwright/test";

import { createProject, createTask, ensureLoggedIn, findProjectIdByName, makeUser, purgeUser, register } from "./helpers";

/**
 * Die Mandantentrennung hängt an Appwrites Dokument-Permissions. Ein einziges
 * `createDocument` ohne Owner-Rechte würde sie aushebeln — deshalb wird sie
 * hier bei jedem Lauf scharf nachgestellt statt nur angenommen.
 */
test.describe.serial("Trennung zwischen Konten", () => {
  const a = makeUser("angriff-a");
  const b = makeUser("angriff-b");
  const projektname = `Geheimprojekt ${Date.now().toString(36)}`;
  let projektId: string | null = null;

  test.afterAll(async () => {
    await purgeUser(a.email);
    await purgeUser(b.email);
  });

  test("Konto A legt ein Projekt mit Aufgabe an", async ({ page }) => {
    await register(page, a);
    projektId = await createProject(page, projektname);
    await createTask(page, "Vertrauliche Aufgabe");
    expect(projektId).toBeTruthy();
  });

  test("Konto B sieht das Projekt von A weder in der Liste noch direkt", async ({ page }) => {
    await ensureLoggedIn(page, b);

    await page.goto("/uebersicht");
    await expect(page.getByText(projektname)).toHaveCount(0);

    // Direktaufruf mit der ID, die wir über die Server-API holen — verlässlicher
    // als ein zwischen Tests geteilter Wert.
    const id = projektId ?? (await findProjectIdByName(projektname));
    expect(id).toBeTruthy();
    await page.goto(`/projekt/${id}`);
    await expect(page.getByText("Nicht gefunden")).toBeVisible();
    await expect(page.getByText("Vertrauliche Aufgabe")).toHaveCount(0);
  });

  test("Konto B kann das Projekt von A nicht ändern oder löschen", async ({ page }) => {
    await ensureLoggedIn(page, b);

    // Bearbeitungsseite mit fremder ID.
    const id = projektId ?? (await findProjectIdByName(projektname));
    await page.goto(`/projekt/${id}/bearbeiten`);
    await expect(page.getByText("Nicht gefunden")).toBeVisible();

    // Das Projekt von A muss unverändert dastehen.
    const nochDa = await findProjectIdByName(projektname);
    expect(nochDa).toBe(id);
  });

  test("Export von B enthält nichts von A", async ({ page }) => {
    await ensureLoggedIn(page, b);
    const res = await page.request.get("/api/export");
    const daten = (await res.json()) as { projects: { name: string }[]; tasks: { title: string }[] };
    expect(daten.projects.map((p) => p.name)).not.toContain(projektname);
    expect(daten.tasks.map((t) => t.title)).not.toContain("Vertrauliche Aufgabe");
  });
});

test.describe("Zugang und Missbrauch", () => {
  test("Geschützte Seiten leiten ohne Anmeldung auf den Login", async ({ page }) => {
    for (const pfad of ["/uebersicht", "/fokus", "/einstellungen", "/projekt/neu"]) {
      await page.goto(pfad);
      await expect(page, `${pfad} muss schützen`).toHaveURL(/\/anmelden$/);
    }
  });

  test("Export ohne Anmeldung antwortet mit 401", async ({ request }) => {
    const res = await request.get("/api/export");
    expect(res.status()).toBe(401);
  });

  test("Passwort-Reset verrät nicht, welche Adressen existieren", async ({ page }) => {
    await page.goto("/passwort-vergessen");
    await page.getByLabel("E-Mail").fill(`gibt-es-nicht-${Date.now()}@example.invalid`);
    await page.getByRole("button", { name: "Link anfordern" }).click();
    // Dieselbe Antwort wie bei einer echten Adresse.
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Post ist");
  });

  test("Unvollständiger Reset-Link führt nicht zum Formular", async ({ page }) => {
    await page.goto("/passwort-neu?userId=erfunden");
    await expect(page.getByText("Da fehlt etwas")).toBeVisible();
  });

  test("Erfundener Reset-Link wird abgelehnt", async ({ page }) => {
    await page.goto("/passwort-neu?userId=erfunden&secret=auchErfunden");
    await page.getByLabel("Neues Passwort").fill("NeuesPasswort9!");
    await page.getByLabel("Passwort wiederholen").fill("NeuesPasswort9!");
    await page.getByRole("button", { name: "Passwort setzen" }).click();
    await expect(page.getByText(/abgelaufen oder wurde schon benutzt/)).toBeVisible();
  });

  test("Sicherheitsheader sind gesetzt und Scripts tragen eine Nonce", async ({ request }) => {
    const res = await request.get("/anmelden");
    const h = res.headers();

    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    // Ohne Nonce blockiert die CSP die Inline-Scripts und nichts hydriert.
    expect(h["content-security-policy"]).toMatch(/'nonce-[^']+'/);

    const html = await res.text();
    const inline = html.match(/<script(?![^>]*\ssrc=)[^>]*>/g) ?? [];
    expect(inline.length).toBeGreaterThan(0);
    for (const tag of inline) expect(tag).toContain("nonce=");
  });
});

test.describe("Bedienbarkeit im Browser", () => {
  const user = makeUser("hydration");

  test.afterAll(async () => {
    await purgeUser(user.email);
  });

  test("React hydriert auf allen Hauptseiten", async ({ page }) => {
    await ensureLoggedIn(page, user);

    for (const pfad of ["/uebersicht", "/fokus", "/einstellungen", "/impressum", "/datenschutz"]) {
      await page.goto(pfad);
      const hydriert = await page.evaluate(() => {
        const el = document.querySelector("button, a");
        return Object.keys(el ?? {}).some((k) => k.startsWith("__react"));
      });
      expect(hydriert, `${pfad} muss hydrieren`).toBe(true);
    }
  });

  test("Kein waagerechter Überlauf auf dem Handy, auch bei langen Namen", async ({ page }) => {
    await ensureLoggedIn(page, user);
    await createProject(
      page,
      "Badezimmerrenovierung ABCDEFGHIJKLMNOPQRSTUVWXYZ Wasseranschlussleitungsverlegung",
    );

    for (const pfad of ["/uebersicht", "/fokus", "/projekt/neu"]) {
      await page.goto(pfad);
      const masse = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(masse.scroll, `${pfad} läuft über`).toBeLessThanOrEqual(masse.client + 1);
    }
  });

  test("Kontaktlink öffnet das Mailprogramm statt einer Fehlerseite", async ({ page }) => {
    await page.goto("/impressum");
    const ziel = await page.evaluate(() => {
      const a = [...document.querySelectorAll("a")].find((x) => x.href.startsWith("mailto:"));
      return a?.href ?? null;
    });
    expect(ziel).toMatch(/^mailto:.+@.+/);
  });
});
