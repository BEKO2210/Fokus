import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fokus — Projekt-Cockpit",
    short_name: "Fokus",
    description:
      "Alle Projekte auf einen Blick: Status, Fortschritt, Deadlines und die eine Aufgabe, die als Nächstes zählt.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2b2c30",
    theme_color: "#2b2c30",
    lang: "de",
    dir: "ltr",
    categories: ["productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Fokus starten", url: "/fokus" },
      { name: "Neues Projekt", url: "/projekt/neu" },
    ],
  };
}
