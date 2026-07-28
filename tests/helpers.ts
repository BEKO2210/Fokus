import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Testkonten werden über die Appwrite-Server-API wieder abgeräumt.
 * Ohne das sammeln sich mit jedem Lauf Karteileichen in der Produktivinstanz.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? "fokus";
const DB = process.env.NEXT_PUBLIC_APPWRITE_DB ?? "fokus";
const KEY = process.env.APPWRITE_API_KEY!;

function headers() {
  return {
    "X-Appwrite-Project": PROJECT,
    "X-Appwrite-Key": KEY,
    "Content-Type": "application/json",
  };
}

export type TestUser = { email: string; password: string; name: string };

export function makeUser(prefix: string): TestUser {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return {
    email: `pw-${prefix}-${id}@example.invalid`,
    password: `Pw${id}Test!9`,
    name: `Test ${prefix}`,
  };
}

export async function register(page: Page, user: TestUser) {
  await page.goto("/registrieren");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("E-Mail").fill(user.email);
  await page.getByLabel("Passwort", { exact: true }).fill(user.password);
  await page.getByLabel("Passwort wiederholen").fill(user.password);
  await page.getByRole("button", { name: "Konto anlegen" }).click();
  await expect(page).toHaveURL(/\/uebersicht$/);
}

export async function login(page: Page, user: TestUser) {
  await page.goto("/anmelden");
  await page.getByLabel("E-Mail").fill(user.email);
  await page.getByLabel("Passwort", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/uebersicht$/);
}

/**
 * Angemeldet sein, egal ob das Konto schon existiert.
 * Jeder Test bekommt einen frischen Browser-Kontext ohne Cookie — ohne das
 * hier müsste man in jedem Test wissen, ob der Nutzer bereits angelegt wurde.
 */
export async function ensureLoggedIn(page: Page, user: TestUser) {
  await page.goto("/anmelden");
  await page.getByLabel("E-Mail").fill(user.email);
  await page.getByLabel("Passwort", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Anmelden" }).click();

  // Klappt die Anmeldung nicht, gibt es das Konto noch nicht.
  const angemeldet = await page
    .waitForURL(/\/uebersicht$/, { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  if (!angemeldet) await register(page, user);
}

export async function logout(page: Page) {
  await page.goto("/einstellungen");
  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page).toHaveURL(/\/anmelden$/);
}

export async function createProject(page: Page, name: string): Promise<string> {
  await page.goto("/projekt/neu");
  await page.getByLabel("Wie heißt das Projekt?").fill(name);
  await page.getByRole("button", { name: "Projekt anlegen" }).click();
  // Nicht auf "/projekt/neu" hereinfallen: die Seite bleibt dort stehen,
  // wenn das Anlegen fehlschlägt, und "neu" sähe wie eine ID aus.
  await expect(page).toHaveURL(/\/projekt\/(?!neu$)[a-z0-9]{8,}$/i);
  return page.url().split("/").pop()!;
}

export async function createTask(
  page: Page,
  title: string,
  { impact = 5, urgency = 5, effort = 2 } = {},
) {
  await page.getByRole("button", { name: "Aufgabe hinzufügen" }).click();
  await page.getByLabel("Aufgabe", { exact: true }).fill(title);
  await page.getByRole("radiogroup", { name: /Bringt viel/ }).getByRole("radio", { name: `${impact} von 5` }).click();
  await page.getByRole("radiogroup", { name: /Eilt/ }).getByRole("radio", { name: `${urgency} von 5` }).click();
  await page.getByRole("radiogroup", { name: /Kostet Kraft/ }).getByRole("radio", { name: `${effort} von 5` }).click();
  await page.getByRole("button", { name: "Aufgabe anlegen" }).click();
  await expect(page.getByText(title).first()).toBeVisible();
}

/** Nutzer samt Inhalten aus Appwrite entfernen. */
export async function purgeUser(email: string) {
  if (!KEY || !ENDPOINT) return;

  const res = await fetch(`${ENDPOINT}/users`, { headers: headers() });
  if (!res.ok) return;
  const { users } = (await res.json()) as { users: { $id: string; email: string }[] };
  const user = users.find((u) => u.email === email);
  if (!user) return;

  for (const collection of ["tasks", "sessions", "projects"]) {
    const list = await fetch(`${ENDPOINT}/databases/${DB}/collections/${collection}/documents`, {
      headers: headers(),
    });
    if (!list.ok) continue;
    const { documents } = (await list.json()) as { documents: { $id: string; ownerId?: string }[] };
    for (const doc of documents.filter((d) => d.ownerId === user.$id)) {
      await fetch(`${ENDPOINT}/databases/${DB}/collections/${collection}/documents/${doc.$id}`, {
        method: "DELETE",
        headers: headers(),
      });
    }
  }

  await fetch(`${ENDPOINT}/users/${user.$id}`, { method: "DELETE", headers: headers() });
}

/** Dokument-ID eines Projekts über die Server-API, um Angriffe nachzustellen. */
export async function findProjectIdByName(name: string): Promise<string | null> {
  const res = await fetch(`${ENDPOINT}/databases/${DB}/collections/projects/documents`, {
    headers: headers(),
  });
  if (!res.ok) return null;
  const { documents } = (await res.json()) as { documents: { $id: string; name: string }[] };
  return documents.find((d) => d.name === name)?.$id ?? null;
}
