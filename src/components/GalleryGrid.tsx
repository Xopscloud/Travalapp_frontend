'use client';

import Image from 'next/image';
import { usePhotoLightbox } from './PhotoLightboxProvider';

export type GalleryTile = {
  id: string;
  imageUrl: string;
  alt: string;
};

export function GalleryGrid({ items }: { items: GalleryTile[] }) {
  const { open } = usePhotoLightbox();

  if (items.length === 0) {
    return <p className="empty-state">No posts yet. Head back home to add your first memory.</p>;
  }

  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="gallery-card interactive"
          onClick={() => open(item.imageUrl, item.alt)}
        >
          <Image src={item.imageUrl} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 320px" />
        </button>
      ))}
    </div>
  );
}

