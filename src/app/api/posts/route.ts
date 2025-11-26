import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { addPost, getAllPosts } from '@/lib/postsStore';
import { slugify } from '@/lib/slugify';
import type { PostFormFields } from '@/types/post';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const albumsRoot = path.join(process.cwd(), 'public', 'albums');

export function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const photo = formData.get('photo');

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: 'photo is required' }, { status: 400 });
  }

  let fields: PostFormFields;
  try {
    fields = extractFields(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const placeSlug = slugify(fields.location);
  const safeSlug = placeSlug.length > 0 ? placeSlug : `place-${Date.now()}`;
  const placeDir = path.join(albumsRoot, safeSlug);
  await fs.mkdir(placeDir, { recursive: true });

  const extensionFromName = path.extname(photo.name);
  const guessedExtension = extensionFromName || inferExtension(photo.type) || '.jpg';
  const fileName = `${Date.now()}-${randomUUID()}${guessedExtension}`;
  const arrayBuffer = await photo.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  await fs.writeFile(path.join(placeDir, fileName), uint8Array);



  const createdPost = addPost({
    ...fields,
    photoUrl: `/albums/${safeSlug}/${fileName}`
  });

  return NextResponse.json(createdPost, { status: 201 });
}

function extractFields(formData: FormData): PostFormFields {
  const getString = (key: keyof PostFormFields): string => {
    const value = formData.get(key);
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${key} is required`);
    }
    return value.trim();
  };

  return {
    traveler: getString('traveler'),
    title: getString('title'),
    location: getString('location'),
    description: getString('description'),
    travelDate: getString('travelDate'),
    tags: parseTags(formData.get('tags')),
    mood: getString('mood') as PostFormFields['mood'],
    weather: getString('weather')
  };
}

function parseTags(entry: FormDataEntryValue | null): string[] {
  if (!entry) {
    return [];
  }

  return String(entry)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function inferExtension(mime: string | undefined): string | null {
  if (!mime) {
    return null;
  }

  const subtype = mime.split('/')[1];
  if (!subtype) {
    return null;
  }

  if (subtype === 'jpeg') {
    return '.jpg';
  }

  return `.${subtype}`;
}
