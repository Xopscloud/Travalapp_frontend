import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { addPost } from '@/lib/postsStore';
import { getDestinationBySlug } from '@/lib/destinations';
import { slugify } from '@/lib/slugify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');
  const uploadType = formData.get('uploadType') as string;
  const destinationSlug = formData.get('destinationSlug') as string | null;

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 });
  }

  let location: string;
  let albumsRoot: string;

  if (uploadType === 'destination') {
    if (!destinationSlug) {
      return NextResponse.json({ error: 'destinationSlug is required when uploading to destination' }, { status: 400 });
    }

    const destination = getDestinationBySlug(destinationSlug);
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    location = destination.location;
    albumsRoot = path.join(process.cwd(), 'public', 'albums', destinationSlug);
  } else {
    location = 'Gallery';
    albumsRoot = path.join(process.cwd(), 'public', 'albums', 'gallery');
  }

  await fs.mkdir(albumsRoot, { recursive: true });

  const extension = path.extname(image.name) || inferExtension(image.type) || '.jpg';
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(albumsRoot, fileName);
  const arrayBuffer = await image.arrayBuffer();
  await fs.writeFile(filePath, new Uint8Array(arrayBuffer));

  const photoUrl = uploadType === 'destination'
    ? `/albums/${destinationSlug}/${fileName}`
    : `/albums/gallery/${fileName}`;

  const newPost = addPost({
    traveler: 'Admin',
    title: `Photo from ${location}`,
    location,
    description: `Uploaded photo to ${uploadType === 'destination' ? location : 'gallery'}`,
    photoUrl,
    travelDate: new Date().toISOString().slice(0, 10),
    tags: [],
    mood: 'nature',
    weather: 'Uploaded via admin'
  });

  return NextResponse.json({ success: true, post: newPost }, { status: 201 });
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
