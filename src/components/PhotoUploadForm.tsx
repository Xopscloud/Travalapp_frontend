'use client';

import { useState, useTransition, FormEvent, ChangeEvent } from 'react';
import useSWR from 'swr';
import { API_BASE_URL } from '@/lib/apiBase';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type DestinationSummary = {
  slug: string;
  location: string;
  entryCount: number;
};

type PhotoUploadFormProps = {
  onSubmit: (data: FormData) => Promise<void>;
  disabled?: boolean;
  apiBase?: string;
};

export function PhotoUploadForm({ onSubmit, disabled = false, apiBase = API_BASE_URL }: PhotoUploadFormProps) {
  const [uploadType, setUploadType] = useState<'gallery' | 'destination'>('gallery');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { data: destinations = [] } = useSWR<DestinationSummary[]>(`${apiBase}/api/destinations`, fetcher);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!image) {
      setError('Please select an image to upload.');
      return;
    }

    if (uploadType === 'destination' && !selectedDestination) {
      setError('Please select a destination.');
      return;
    }

    const payload = new FormData();
    payload.append('image', image);
    payload.append('uploadType', uploadType);
    if (uploadType === 'destination') {
      payload.append('destinationSlug', selectedDestination);
    }

    startTransition(async () => {
      try {
        await onSubmit(payload);
        setImage(null);
        setSelectedDestination('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImage(file ?? null);
  };

  return (
    <form className="photo-upload-form" onSubmit={handleSubmit}>
      <label>
        Upload to
        <select
          value={uploadType}
          onChange={(e) => {
            const value = e.target.value as 'gallery' | 'destination';
            setUploadType(value);
            if (value === 'gallery') {
              setSelectedDestination('');
            }
          }}
          disabled={disabled}
        >
          <option value="gallery">Gallery</option>
          <option value="destination">Destination</option>
        </select>
      </label>

      {uploadType === 'destination' && (
        <label>
          Select destination
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            required={uploadType === 'destination'}
            disabled={disabled || destinations.length === 0}
          >
            <option value="">Choose a destination...</option>
            {destinations.map((dest) => (
              <option key={dest.slug} value={dest.slug}>
                {dest.location}
              </option>
            ))}
          </select>
          {destinations.length === 0 && <small>No destinations available yet.</small>}
        </label>
      )}

      <label>
        Image
        <input type="file" accept="image/*" onChange={handleFileChange} required disabled={disabled} />
      </label>

      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={disabled || isPending}>
        {disabled ? 'Login required' : isPending ? 'Uploading...' : 'Upload photo'}
      </button>
    </form>
  );
}
