import { getAllPosts } from '@/lib/postsStore';
import { slugify } from '@/lib/slugify';
import type { Post } from '@/types/post';

export type DestinationSummary = {
  slug: string;
  location: string;
  coverUrl: string;
  entryCount: number;
  travelers: string[];
};

export function getDestinationSummaries(): DestinationSummary[] {
  const map = new Map<
    string,
    {
      location: string;
      coverUrl: string;
      entryCount: number;
      travelers: Set<string>;
      latestCreatedAt: number;
    }
  >();

  for (const post of getAllPosts()) {
    const slug = slugify(post.location) || post.id;
    const latestCreatedAt = Date.parse(post.createdAt);
    const existing = map.get(slug);

    if (existing) {
      existing.entryCount += 1;
      existing.travelers.add(post.traveler);
      if (latestCreatedAt > existing.latestCreatedAt) {
        existing.latestCreatedAt = latestCreatedAt;
        existing.coverUrl = post.photoUrl;
      }
    } else {
      map.set(slug, {
        location: post.location,
        coverUrl: post.photoUrl,
        entryCount: 1,
        travelers: new Set([post.traveler]),
        latestCreatedAt
      });
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].latestCreatedAt - a[1].latestCreatedAt)
    .map(([slug, summary]) => ({
      slug,
      location: summary.location,
      coverUrl: summary.coverUrl,
      entryCount: summary.entryCount,
      travelers: Array.from(summary.travelers)
    }));
}

export function getDestinationBySlug(slug: string): DestinationSummary | null {
  const destination = getDestinationSummaries().find((summary) => summary.slug === slug);
  return destination ?? null;
}

export function getPostsForDestination(slug: string): Post[] {
  return getAllPosts().filter((post) => (slugify(post.location) || post.id) === slug);
}
