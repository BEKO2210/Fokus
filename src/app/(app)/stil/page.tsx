import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page-header";
import { Chip, Dot, ProgressRing, SectionTitle } from "@/components/ui/bits";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/field";
import { ConfidenceSlider, Rating } from "@/components/ui/rating";
import { LEVEL_COLOR, LEVEL_LABEL } from "@/lib/score";
import { HEALTH_COLOR, HEALTH_LABEL, PROJECT_HEALTH } from "@/lib/types";

export const metadata: Metadata = { title: "Stil" };

const ICONS = Object.entries(Icon) as [string, (p: { className?: string }) => React.ReactElement][];

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <SectionTitle right={note ? <span className="label-xs">{note}</span> : undefined}>{title}</SectionTitle>
      {children}
    </section>
  );
}

export default function StylePage() {
  // Baukasten für die Entwicklung. Fremde Nutzer würden hier landen und es für
  // einen Fehler halten — im Betrieb nur mit gesetztem Schalter erreichbar.
  if (process.env.SHOW_STYLE_GUIDE !== "1") notFound();

  return (
    <div className="animate-rise">
      <PageHeader
        back="/"
        eyebrow="Baukasten"
        title="Stil"
        lead="Jedes Element hier ist die echte Komponente aus der App, kein Screenshot. Was hier gut aussieht, sieht überall gut aus."
      />

      <Block title="Marke" note="SVG, skaliert verlustfrei">
        <div className="nm-card flex flex-wrap items-center gap-8 p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="nm-raise grid h-24 w-24 place-items-center rounded-[26px]">
              <Logo className="h-14 w-14" id="s1" />
            </div>
            <span className="label-xs">voll</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="nm-raise grid h-16 w-16 place-items-center rounded-[20px]">
              <Logo className="h-9 w-9" compact id="s2" />
            </div>
            <span className="label-xs">kompakt</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="nm-raise grid h-16 w-16 place-items-center rounded-[20px] text-ink-soft">
              <Logo className="h-9 w-9" variant="mono" id="s3" />
            </div>
            <span className="label-xs">einfarbig</span>
          </div>
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" id="s4" />
            <span className="display text-2xl text-ink">Fokus</span>
          </div>
        </div>
      </Block>

      <Block title="Flächen" note="Tiefe nur über Licht und Schatten">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["nm-raise", "erhaben"],
            ["nm-sink", "eingelassen"],
            ["nm-card", "Karte"],
          ].map(([cls, label]) => (
            <div key={cls} className={`${cls} grid h-28 place-items-center rounded-[var(--radius-card)]`}>
              <span className="text-sm text-ink-soft">{label}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Farben">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Akzent", "linear-gradient(135deg,#ff9040,#ef3f14)"],
            ["Läuft", "var(--color-ok)"],
            ["Wackelt", "var(--color-warn)"],
            ["Blockiert", "var(--color-danger)"],
          ].map(([label, bg]) => (
            <div key={label} className="nm-raise-sm overflow-hidden rounded-2xl">
              <div className="h-16" style={{ background: bg }} />
              <p className="px-3 py-2.5 text-xs text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Buttons" note="echte Zustände, kein Bild">
        <div className="nm-card flex flex-col gap-7 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="accent">Wichtigste Aktion</Button>
            <Button variant="raised">Sekundär</Button>
            <Button variant="sunk">Gewählt</Button>
            <Button variant="ghost">Unauffällig</Button>
            <Button variant="raised" disabled>
              Deaktiviert
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="accent" size="sm">
              Klein
            </Button>
            <Button variant="accent" size="md">
              Mittel
            </Button>
            <Button variant="accent" size="lg">
              Groß
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon" aria-label="Hinzufügen">
              <Icon.Plus className="h-5 w-5" />
            </Button>
            <Button variant="accent" size="icon" aria-label="Starten">
              <Icon.Play className="h-5 w-5" />
            </Button>
            <Button size="icon-lg" aria-label="Pausieren">
              <Icon.Pause className="h-5 w-5" />
            </Button>
            <LinkButton href="/stil" size="md">
              <Icon.Link className="h-4 w-4" />
              Als Link
            </LinkButton>
          </div>

          <p className="text-xs leading-relaxed text-ink-dim">
            Beim Drücken kippt der Schatten von erhaben nach eingelassen — die Fläche gibt
            physisch nach. Pro Bildschirm trägt genau ein Button den Orange-Verlauf.
          </p>
        </div>
      </Block>

      <Block title="Icons" note={`${ICONS.length} Stück, geerbte Farbe`}>
        <div className="nm-card grid grid-cols-4 gap-3 p-6 sm:grid-cols-6 lg:grid-cols-8">
          {ICONS.map(([name, Cmp]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className="nm-sink-sm grid h-12 w-12 place-items-center rounded-2xl text-ink-soft">
                <Cmp className="h-5 w-5" />
              </div>
              <span className="truncate text-[0.6rem] text-ink-dim">{name}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Etiketten und Punkte">
        <div className="nm-card flex flex-wrap items-center gap-3 p-6">
          <Chip>Neutral</Chip>
          <Chip tone="accent">Akzent</Chip>
          <Chip tone="ok">Läuft</Chip>
          <Chip tone="warn">Wackelt</Chip>
          <Chip tone="danger">Überfällig</Chip>
          {PROJECT_HEALTH.map((h) => (
            <span key={h} className="inline-flex items-center gap-2 text-xs text-ink-soft">
              <Dot color={HEALTH_COLOR[h]} pulse={h === "blocked"} />
              {HEALTH_LABEL[h]}
            </span>
          ))}
        </div>
      </Block>

      <Block title="Fortschritt">
        <div className="nm-card flex flex-wrap items-center gap-8 p-6">
          {[0, 25, 60, 100].map((v) => (
            <ProgressRing key={v} value={v} size={68} stroke={7}>
              <span className="tnum text-sm font-bold text-ink">{v}%</span>
            </ProgressRing>
          ))}
        </div>
      </Block>

      <Block title="Prioritätsstufen">
        <div className="nm-card flex flex-wrap gap-6 p-6">
          {(Object.keys(LEVEL_LABEL) as (keyof typeof LEVEL_LABEL)[]).map((lvl) => (
            <div key={lvl}>
              <p className="tnum text-2xl font-bold" style={{ color: LEVEL_COLOR[lvl] }}>
                {lvl === "critical" ? "18,0" : lvl === "high" ? "8,3" : lvl === "medium" ? "3,8" : "1,2"}
              </p>
              <p className="text-xs text-ink-dim">{LEVEL_LABEL[lvl]}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Eingaben">
        <div className="nm-card flex flex-col gap-6 p-6">
          <Field label="Textfeld" htmlFor="demo-text" hint="Beim Fokussieren zieht sich der Rand orange nach.">
            <Input id="demo-text" placeholder="Tippen …" defaultValue="Elementa" />
          </Field>
          <Field label="Auswahl" htmlFor="demo-select">
            <Select id="demo-select" defaultValue="aktiv">
              <option value="idee">Idee</option>
              <option value="aktiv">Aktiv</option>
              <option value="pausiert">Pausiert</option>
            </Select>
          </Field>
          <Field label="Mehrzeilig" htmlFor="demo-area">
            <Textarea id="demo-area" placeholder="Notiz …" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Rating name="demo-impact" label="Wirkung" defaultValue={5} />
            <Rating name="demo-urgency" label="Dringlichkeit" defaultValue={4} />
            <Rating name="demo-effort" label="Aufwand" defaultValue={2} />
          </div>
          <ConfidenceSlider name="demo-confidence" defaultValue={80} />
          <FormError message="So sieht eine Fehlermeldung aus." />
        </div>
      </Block>

      <Block title="Schrift" note="Plus Jakarta Sans">
        <div className="nm-card flex flex-col gap-4 p-6">
          <p className="display text-[3rem] text-ink">Überschrift</p>
          <p className="text-lg font-bold text-ink">Abschnittstitel</p>
          <p className="text-sm leading-relaxed text-ink-soft">
            Fließtext in Weichgrau. Lang genug, um zu zeigen, wie der Zeilenabstand auf
            einer dunklen Fläche wirkt, ohne dass die Augen ermüden.
          </p>
          <p className="label-xs">Überschrift klein, gesperrt</p>
          <p className="tnum text-2xl font-bold text-ink">0123456789 — Ziffern laufen tabellarisch</p>
        </div>
      </Block>
    </div>
  );
}
