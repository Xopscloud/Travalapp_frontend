import { NextResponse } from 'next/server';
import { deletePost, getPostById, updatePost } from '@/lib/postsStore';
import { deletePublicAsset } from '@/lib/publicFiles';
import type { Post } from '@/types/post';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = params;
  const existing = getPostById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const payload = await request.json();
  const updates = sanitizePostUpdates(payload);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const updated = updatePost(id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const removed = deletePost(params.id);
  if (!removed) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  await deletePublicAsset(removed.photoUrl);
  return NextResponse.json({ success: true, deletedId: removed.id });
}

function sanitizePostUpdates(payload: Record<string, unknown>): Partial<Omit<Post, 'id' | 'createdAt'>> {
  const updates: Partial<Omit<Post, 'id' | 'createdAt'>> = {};

  if (typeof payload.title === 'string' && payload.title.trim().length > 0) {
    updates.title = payload.title.trim();
  }
  if (typeof payload.location === 'string' && payload.location.trim().length > 0) {
    updates.location = payload.location.trim();
  }
  if (typeof payload.description === 'string' && payload.description.trim().length > 0) {
    updates.description = payload.description.trim();
  }
  if (typeof payload.traveler === 'string' && payload.traveler.trim().length > 0) {
    updates.traveler = payload.traveler.trim();
  }
  if (typeof payload.weather === 'string' && payload.weather.trim().length > 0) {
    updates.weather = payload.weather.trim();
  }
  if (typeof payload.mood === 'string') {
    updates.mood = payload.mood as Post['mood'];
  }
  if (typeof payload.travelDate === 'string' && payload.travelDate.trim().length > 0) {
    updates.travelDate = payload.travelDate.trim();
  }
  if (Array.isArray(payload.tags)) {
    updates.tags = payload.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
  }

  return updates;
}

