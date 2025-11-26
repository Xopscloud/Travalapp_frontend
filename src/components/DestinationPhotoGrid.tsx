'use client';

import Image from 'next/image';
import { usePhotoLightbox } from './PhotoLightboxProvider';

export type DestinationPhoto = {
  id: string;
  imageUrl: string;
  title: string;
};

export function DestinationPhotoGrid({ photos }: { photos: DestinationPhoto[] }) {
  const { open } = usePhotoLightbox();

  if (photos.length === 0) {
    return <p className="empty-state">No photos yet. Add one from the admin studio.</p>;
  }

  return (
    <div className="gallery-grid">
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          className="gallery-card interactive"
          onClick={() => open(photo.imageUrl, photo.title)}
        >
          <Image src={photo.imageUrl} alt={photo.title} fill sizes="(max-width: 768px) 100vw, 320px" />
        </button>
      ))}
    </div>
  );
}

