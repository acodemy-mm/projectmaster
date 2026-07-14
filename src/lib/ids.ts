/** Next numeric suffix from ids like `m101`, `proj42`. */
export function nextCounterFromIds(ids: string[], prefix: string): number {
  let max = 0;
  for (const id of ids) {
    if (!id.startsWith(prefix)) continue;
    const n = Number(id.slice(prefix.length));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

export function createUniqueId(existingIds: string[], prefix: string): string {
  return `${prefix}${nextCounterFromIds(existingIds, prefix)}`;
}
