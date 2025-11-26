'use client';

import Link from 'next/link';
import Image from 'next/image';
import { buildImageUrl } from '@/lib/imageUrl';

export type AlbumSummary = {
  slug: string;
  location: string;
  coverUrl: string;
  entryCount: number;
  travelers: string[];
};

export function AlbumGrid({ albums, id }: { albums: AlbumSummary[]; id?: string }) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <section className="album-section" id={id}>
      <div className="album-heading">
        <div>
          <p className="eyebrow">Photo albums</p>
          <h2>Browse by destination</h2>
          <p>Every place you log gets its own folder plus a visual cover. Jump back into old adventures fast.</p>
        </div>
        <span>{albums.length} places logged</span>
      </div>
      <div className="album-grid">
        {albums.map((album) => (
          <article key={album.slug} className="album-card">
            <Link href={`/destinations/${album.slug}`} className="album-card-link">
              <div className="album-cover">
                <Image
                  src={buildImageUrl(album.coverUrl)}
                  alt={album.location}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="album-body">
                <p className="album-label">{album.entryCount} {album.entryCount === 1 ? 'entry' : 'entries'}</p>
                <h3>{album.location}</h3>
                <p className="album-travelers">{album.travelers.join(' • ')}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
