import path from 'path';
import { promises as fs } from 'fs';

function ensureRelativePath(targetPath: string): string {
  const normalized = targetPath.replace(/^\/+/, '');
  const resolved = path.normalize(normalized);
  if (resolved.startsWith('..')) {
    throw new Error(`Refusing to access path outside public directory: ${targetPath}`);
  }
  return resolved;
}

export function resolvePublicPath(relativePath: string): string {
  const safeRelativePath = ensureRelativePath(relativePath);
  return path.join(process.cwd(), 'public', safeRelativePath);
}

export async function deletePublicAsset(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) {
    return;
  }

  const target = resolvePublicPath(relativePath);
  try {
    await fs.unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

