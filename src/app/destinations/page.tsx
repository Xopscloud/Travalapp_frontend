import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/apiBase';
import type { AlbumSummary } from '@/components/AlbumGrid';
import { buildImageUrl } from '@/lib/imageUrl';

async function getDestinations(): Promise<AlbumSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/destinations`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch destinations');
  }
  return response.json();
}

export const metadata = {
  title: 'Destinations | Offbeat Odyssey',
  description: 'Explore every place visited inside Offbeat Odyssey and jump into their dedicated photo albums.'
};

export const dynamic = 'force-dynamic';

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <main className="page">
      <section className="page-hero">
        <p className="eyebrow">Destinations</p>
        <h1>Visited places</h1>
        <p>Choose a location to dive into every photo captured there. Each album grows as you keep posting memories.</p>
        <div className="panel-actions">
          <Link href="/" className="link-button secondary">
            Back to home
          </Link>
        </div>
      </section>

      {destinations.length === 0 ? (
        <p className="empty-state">No destinations yet. Head home to log your first stop.</p>
      ) : (
        <div className="destination-grid">
          {destinations.map((destination) => (
            <Link key={destination.slug} href={`/destinations/${destination.slug}`} className="destination-card">
              <div className="destination-image">
                <Image
                  src={buildImageUrl(destination.coverUrl)}
                  alt={destination.location}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="destination-body">
                <span>{destination.entryCount} photos</span>
                <h3>{destination.location}</h3>
                <p>{destination.travelers.join(' • ')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
