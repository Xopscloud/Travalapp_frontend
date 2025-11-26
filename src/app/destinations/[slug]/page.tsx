import Link from 'next/link';
import { API_BASE_URL } from '@/lib/apiBase';
import type { AlbumSummary } from '@/components/AlbumGrid';
import type { Post } from '@/types/post';
import { slugify } from '@/lib/slugify';
import { buildImageUrl } from '@/lib/imageUrl';
import { DestinationPhotoGrid } from '@/components/DestinationPhotoGrid';

async function getDestination(slug: string): Promise<AlbumSummary | null> {
  const response = await fetch(`${API_BASE_URL}/api/destinations`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch destination list');
  }
  const destinations: AlbumSummary[] = await response.json();
  return destinations.find((destination) => destination.slug === slug) ?? null;
}

async function getPosts(slug: string): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/api/moments`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch destination posts');
  }
  const posts: Post[] = await response.json();
  return posts.filter((post) => slugify(post.location) === slug);
}

export async function generateStaticParams() {
  return [];
}

export const dynamic = 'force-dynamic';

export default async function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const destination = await getDestination(params.slug);

  if (!destination) {
    return (
      <main className="page">
        <p className="empty-state">Destination not found.</p>
      </main>
    );
  }

  const posts = await getPosts(params.slug);

  return (
    <main className="page">
      <section className="page-hero">
        <p className="eyebrow">Destination</p>
        <h1>{destination.location}</h1>
        <p>{destination.entryCount} photos logged by {destination.travelers.join(', ')}.</p>
        <div className="panel-actions">
          <Link href="/destinations" className="link-button secondary">
            Back to destinations
          </Link>
        </div>
      </section>

      <DestinationPhotoGrid
        photos={posts.map((post) => ({
          id: post.id,
          imageUrl: buildImageUrl(post.photoUrl),
          title: post.title
        }))}
      />
    </main>
  );
}
