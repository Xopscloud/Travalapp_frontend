import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { addBlog, getAllBlogs } from '@/lib/blogStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getAllBlogs());
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 });
  }

  const title = getString(formData, 'title');
  const excerpt = getString(formData, 'excerpt');
  const tag = getString(formData, 'tag');

  const blogsDir = path.join(process.cwd(), 'public', 'blogs');
  await fs.mkdir(blogsDir, { recursive: true });

  const extension = path.extname(image.name) || inferExtension(image.type) || '.jpg';
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const arrayBuffer = await image.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  await fs.writeFile(path.join(blogsDir, fileName), uint8Array);


  const createdBlog = addBlog({
    title,
    excerpt,
    tag,
    imageUrl: `/blogs/${fileName}`
  });

  return NextResponse.json(createdBlog, { status: 201 });
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function inferExtension(mime: string | undefined): string | null {
  if (!mime) {
    return null;
  }
  const subtype = mime.split('/')[1];
  if (!subtype) {
    return null;
  }
  return subtype === 'jpeg' ? '.jpg' : `.${subtype}`;
}
