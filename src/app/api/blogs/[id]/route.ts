import { NextResponse } from 'next/server';
import { deleteBlog, getBlogById, updateBlog } from '@/lib/blogStore';
import { deletePublicAsset } from '@/lib/publicFiles';
import type { BlogEntry } from '@/types/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const existing = getBlogById(params.id);
  if (!existing) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  const payload = await request.json();
  const updates = sanitizeBlogUpdates(payload);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const updated = updateBlog(params.id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const removed = deleteBlog(params.id);
  if (!removed) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  await deletePublicAsset(removed.imageUrl);
  return NextResponse.json({ success: true, deletedId: removed.id });
}

function sanitizeBlogUpdates(payload: Record<string, unknown>): Partial<Omit<BlogEntry, 'id' | 'createdAt'>> {
  const updates: Partial<Omit<BlogEntry, 'id' | 'createdAt'>> = {};

  if (typeof payload.title === 'string' && payload.title.trim().length > 0) {
    updates.title = payload.title.trim();
  }
  if (typeof payload.excerpt === 'string' && payload.excerpt.trim().length > 0) {
    updates.excerpt = payload.excerpt.trim();
  }
  if (typeof payload.tag === 'string' && payload.tag.trim().length > 0) {
    updates.tag = payload.tag.trim();
  }

  return updates;
}

