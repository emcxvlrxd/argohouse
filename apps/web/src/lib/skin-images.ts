const CDN_BASE = "https://cdn.cstrike.app";

let lookup: Record<string, string> | null = null;

async function getLookup(): Promise<Record<string, string>> {
  if (lookup) return lookup;
  const { CS2_ITEMS } = await import("@ianlucas/cs2-lib");
  lookup = {};
  for (const item of CS2_ITEMS) {
    if (!item.base && (item.index ?? 0) > 0 && item.image) {
      lookup[`${item.def}:${item.index}`] = `${CDN_BASE}${item.image}`;
    }
  }
  return lookup;
}

export async function getCdnImage(defindex: number, paintId: number): Promise<string | null> {
  const map = await getLookup();
  return map[`${defindex}:${paintId}`] ?? null;
}
