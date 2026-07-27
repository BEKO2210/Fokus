/** "1 Projekt" / "3 Projekte" — spart im UI die haesslichen Klammerformen. */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
