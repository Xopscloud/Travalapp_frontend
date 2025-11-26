const ENTITY_REGEX = /[^\w\s-]/g;
const DASH_REGEX = /-{2,}/g;
const SPACE_REGEX = /\s+/g;

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(ENTITY_REGEX, '')
    .trim()
    .replace(SPACE_REGEX, '-')
    .replace(DASH_REGEX, '-')
    .toLowerCase();
}
