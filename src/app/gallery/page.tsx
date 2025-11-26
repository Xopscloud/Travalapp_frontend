import Link from 'next/link';
import { API_BASE_URL } from '@/lib/apiBase';
import { buildImageUrl } from '@/lib/imageUrl';
import { GalleryGrid, type GalleryTile } from '@/components/GalleryGrid';

type BackendMoment = {
  _id: string;
  title: string;
  photoUrl: string;
  createdAt: string;
};

type BackendPhoto = {
  _id: string;
  filePath: string;
  originalName?: string;
  createdAt: string;
};

type GalleryItem = GalleryTile & { createdAt: string };

async function getGalleryItems(): Promise<GalleryItem[]> {
  const [momentsResponse, photosResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/moments`, { cache: 'no-store' }),
    fetch(`${API_BASE_URL}/api/photos?context=gallery`, { cache: 'no-store' })
  ]);

  if (!momentsResponse.ok) {
    throw new Error('Failed to fetch gallery posts');
  }

  if (!photosResponse.ok) {
    throw new Error('Failed to fetch gallery photos');
  }

  const moments: BackendMoment[] = await momentsResponse.json();
  const photos: BackendPhoto[] = await photosResponse.json();

  const momentItems: GalleryItem[] = moments.map((moment) => ({
    id: moment._id,
    imageUrl: buildImageUrl(moment.photoUrl),
    alt: moment.title,
    createdAt: moment.createdAt
  }));

  const photoItems: GalleryItem[] = photos.map((photo) => ({
    id: photo._id,
    imageUrl: buildImageUrl(photo.filePath),
    alt: photo.originalName ?? 'Gallery photo',
    createdAt: photo.createdAt
  }));

  return [...momentItems, ...photoItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const metadata = {
  title: 'Gallery | Offbeat Odyssey',
  description: 'Scroll every travel photo memory shared inside Offbeat Odyssey.'
};

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <main className="page">
      <section className="page-hero">
        <p className="eyebrow">Gallery</p>
        <h1>Every snapshot in one place</h1>
        <p>Browse the full collection of travel memories sourced from the Express + MongoDB backend.</p>
        <div className="panel-actions">
          <Link href="/" className="link-button secondary">
            Back to home
          </Link>
        </div>
      </section>

      <GalleryGrid items={items} />
    </main>
  );
}
