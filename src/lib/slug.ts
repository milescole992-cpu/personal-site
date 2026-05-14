export function createSlug(input: string) {
  const slug = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || `resource-${Date.now()}`;
}

export function getResourceSlug(resource: {
  slug?: string | null;
  title: string;
}) {
  return resource.slug || createSlug(resource.title);
}
