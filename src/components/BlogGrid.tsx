'use client';

import Image from 'next/image';
import type { BlogEntry } from '@/types/blog';
import { buildImageUrl } from '@/lib/imageUrl';
import { usePhotoLightbox } from './PhotoLightboxProvider';

export function BlogGrid({ entries }: { entries: BlogEntry[] }) {
  const { open } = usePhotoLightbox();

  return (
    <div className="blog-grid">
      {entries.map((entry) => (
        <article key={entry.id} className="blog-card">
          <div
            className="blog-image"
            role="button"
            tabIndex={0}
            onClick={() => open(buildImageUrl(entry.imageUrl), entry.title)}
            onKeyDown={(event) => (event.key === 'Enter' ? open(buildImageUrl(entry.imageUrl), entry.title) : undefined)}
          >
            <Image
              src={buildImageUrl(entry.imageUrl)}
              alt={entry.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
          <div className="blog-content">
            <span className="blog-tag">{entry.tag}</span>
            <h3>{entry.title}</h3>
            <p>{entry.excerpt}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
