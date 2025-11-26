import { API_BASE_URL } from './apiBase';

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export function buildImageUrl(path: string | null | undefined, baseUrl: string = API_BASE_URL): string {
  if (!path) {
    return '';
  }

  if (ABSOLUTE_URL_REGEX.test(path)) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

