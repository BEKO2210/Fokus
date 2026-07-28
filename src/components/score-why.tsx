import { LEVEL_COLOR, LEVEL_LABEL, formatScore, priorityLevel, priorityScore } from "@/lib/score";
import type { Task } from "@/lib/types";

type Factor = { label: string; value: string; weight: "hoch" | "mittel" | "niedrig" };

function rate(n: number): Factor["weight"] {
  if (n >= 4) return "hoch";
  if (n >= 3) return "mittel";
  return "niedrig";
}

const WEIGHT_COLOR: Record<Factor["weight"], string> = {
  hoch: "var(--color-accent)",
  mittel: "var(--color-ink-soft)",
  niedrig: "var(--color-ink-dim)",
};

/**
 * Ein Satz, der die Zahl in Sprache übersetzt.
 *
 * Eine Aufgabe steht nicht "wegen 9,0" oben, sondern weil sie viel bringt,
 * eilt und wenig kostet. Genau das soll dastehen — sonst bleibt der Score
 * eine Zahl, der man glauben muss.
 */
function reason(task: Task): string {
  const teile: string[] = [];
  if (task.impact >= 4) teile.push("bringt viel");
  if (task.urgency >= 4) teile.push("eilt");
  if (task.effort <= 2) teile.push("ist schnell erledigt");
  if (task.effort >= 4) teile.push("ist ein großer Brocken");
  if (task.confidence <= 40) teile.push("ist noch unklar");

  if (teile.length === 0) return "Alles im Mittelfeld — deshalb weder oben noch unten.";

  const satz =
    teile.length === 1
      ? teile[0]
      : `${teile.slice(0, -1).join(", ")} und ${teile[teile.length - 1]}`;

  const hoch = task.effort <= 2 || task.impact >= 4 || task.urgency >= 4;
  return `Sie ${satz} — deshalb steht sie ${hoch ? "weit oben" : "weiter unten"}.`;
}

/** Aufklappbare Begründung direkt neben der Zahl. */
export function ScoreWhy({ task, defaultOpen = false }: { task: Task; defaultOpen?: boolean }) {
  const score = priorityScore(task);
  const level = priorityLevel(score);

  const factors: Factor[] = [
    { label: "Bringt viel", value: `${task.impact} von 5`, weight: rate(task.impact) },
    { label: "Eilt", value: `${task.urgency} von 5`, weight: rate(task.urgency) },
    { label: "Kostet Kraft", value: `${task.effort} von 5`, weight: rate(6 - task.effort) },
    {
      label: "Sicherheit",
      value: `${task.confidence} %`,
      weight: task.confidence >= 70 ? "hoch" : task.confidence >= 40 ? "mittel" : "niedrig",
    },
  ];

  return (
    <details open={defaultOpen} className="group">
      <summary className="-my-2 flex cursor-pointer list-none items-center gap-2 py-2 text-xs text-ink-soft hover:text-ink">
        <span
          className="tnum text-sm font-bold"
          style={{ color: LEVEL_COLOR[level] }}
        >
          {formatScore(score)}
        </span>
        <span className="text-ink-dim">{LEVEL_LABEL[level]}</span>
        <span className="ml-1 underline underline-offset-4 group-open:hidden">Warum?</span>
        <span className="ml-1 hidden underline underline-offset-4 group-open:inline">
          Zuklappen
        </span>
      </summary>

      <div className="nm-sink mt-3 rounded-2xl p-4">
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">{reason(task)}</p>
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {factors.map((f) => (
            <div key={f.label} className="nm-raise-sm rounded-xl px-3 py-2.5">
              <dt className="label-xs">{f.label}</dt>
              <dd
                className="tnum mt-1 text-sm font-semibold"
                style={{ color: WEIGHT_COLOR[f.weight] }}
              >
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-ink-dim">
          ({task.impact} × {task.urgency} × {(task.confidence / 100).toFixed(2).replace(".", ",")})
          ÷ {task.effort} = {formatScore(score)}
        </p>
      </div>
    </details>
  );
}
