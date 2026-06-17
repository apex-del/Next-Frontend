export function makeAnimeSlug(title: string | null | undefined, id: number): string {
  if (!title) return String(id);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/^(\d+)$/, "a$1");
  if (!slug || slug === `a${id}`) return String(id);
  return `${slug}-${id}`;
}

export function parseSlugId(slug: string): { id: number; name: string } {
  const parts = slug.split("-");
  const last = parts[parts.length - 1];
  const id = parseInt(last, 10);
  if (!isNaN(id) && parts.length > 1) {
    return { id, name: parts.slice(0, -1).join("-") };
  }
  const direct = parseInt(slug, 10);
  return { id: isNaN(direct) ? 0 : direct, name: "" };
}
