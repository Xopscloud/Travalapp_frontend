'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type LightboxState = { src: string; alt: string };

type LightboxContextValue = {
  open: (src: string, alt?: string) => void;
  close: () => void;
};

const PhotoLightboxContext = createContext<LightboxContextValue | undefined>(undefined);

export function PhotoLightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const open = useCallback((src: string, alt: string = 'Photo') => {
    setState({ src, alt });
  }, []);

  const close = useCallback(() => {
    setState(null);
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, close]);

  return (
    <PhotoLightboxContext.Provider value={{ open, close }}>
      {children}
      {state && (
        <div className="photo-lightbox__overlay" aria-modal="true" role="dialog">
          <button type="button" className="photo-lightbox__backdrop" onClick={close} aria-label="Close image" />
          <div className="photo-lightbox__content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.src} alt={state.alt} />
            <button type="button" className="photo-lightbox__close" onClick={close}>
              Close
            </button>
          </div>
        </div>
      )}
    </PhotoLightboxContext.Provider>
  );
}

export function usePhotoLightbox() {
  const ctx = useContext(PhotoLightboxContext);
  if (!ctx) {
    throw new Error('usePhotoLightbox must be used within PhotoLightboxProvider');
  }
  return ctx;
}

