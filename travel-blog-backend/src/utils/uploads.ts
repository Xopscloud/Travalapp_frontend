import path from 'path';
import { promises as fs } from 'fs';
import { env } from '../config/env';

export async function deleteUploadFile(relativePath: string | null | undefined) {
  if (!relativePath) {
    return;
  }

  const fileName = path.basename(relativePath);
  const uploadDir = path.resolve(env.uploadRoot);
  const absolutePath = path.join(uploadDir, fileName);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

