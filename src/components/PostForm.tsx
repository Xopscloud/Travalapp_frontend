'use client';

import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import type { PostFormFields } from '@/types/post';

const defaultForm: PostFormFields = {
  traveler: '',
  title: '',
  location: '',
  description: '',
  travelDate: new Date().toISOString().slice(0, 10),
  tags: [],
  mood: 'nature',
  weather: ''
};

const moodOptions: Array<{ label: string; value: PostFormFields['mood'] }> = [
  { label: 'Nature Escape', value: 'nature' },
  { label: 'Laid-back', value: 'relaxed' },
  { label: 'Adrenaline', value: 'thrill' },
  { label: 'Culture Dive', value: 'culture' },
  { label: 'Food Journey', value: 'foodie' }
];

export function PostForm({ onSubmit, disabled = false, renderHeader = true }: { onSubmit: (data: FormData) => Promise<void>; disabled?: boolean; renderHeader?: boolean }) {
  const [form, setForm] = useState<PostFormFields>(defaultForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (disabled) {
      setError('Please log in first.');
      return;
    }

    if (!photoFile) {
      setError('Please choose an image to upload.');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        payload.append(key, value.join(','));
      } else {
        payload.append(key, value);
      }
    });
    payload.append('photo', photoFile);

    startTransition(async () => {
      try {
        await onSubmit(payload);
        setForm({ ...defaultForm, travelDate: form.travelDate });
        setPhotoFile(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoFile(file ?? null);
  };

  return (
    <section className="form-panel">
      {renderHeader && (
        <header>
          <p className="eyebrow">Share a moment</p>
          <h2>Post a travel photo</h2>
          <p>Drop a highlight from the road — upload a shot straight from your camera roll.</p>
        </header>
      )}
      <form onSubmit={handleSubmit}>
        <div className="field-grid">
          <label>
            Traveler
            <input
              placeholder="Your name"
              value={form.traveler}
              onChange={(e) => setForm((prev) => ({ ...prev, traveler: e.target.value }))}
              required
              disabled={disabled}
            />
          </label>
          <label>
            Title
            <input
              placeholder="Headline of the memory"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              disabled={disabled}
            />
          </label>
          <label>
            Location
            <input
              placeholder="City, Country"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              required
              disabled={disabled}
            />
          </label>
          <label>
            Travel date
            <input
              type="date"
              value={form.travelDate}
              onChange={(e) => setForm((prev) => ({ ...prev, travelDate: e.target.value }))}
              max={new Date().toISOString().slice(0, 10)}
              required
              disabled={disabled}
            />
          </label>
          <label>
            Mood
            <select
              value={form.mood}
              onChange={(e) => setForm((prev) => ({ ...prev, mood: e.target.value as PostFormFields['mood'] }))}
              disabled={disabled}
            >
              {moodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Weather snapshot
            <input
              placeholder="e.g. Golden hour, 24°C"
              value={form.weather}
              onChange={(e) => setForm((prev) => ({ ...prev, weather: e.target.value }))}
              required
              disabled={disabled}
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            placeholder="What made this moment standout?"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
            disabled={disabled}
          />
        </label>
        <label>
          Upload photo
          <input type="file" accept="image/*" onChange={handleFileChange} required disabled={disabled} />
        </label>
        <label>
          Tags (comma separated)
          <input
            placeholder="sunrise, markets, hiking"
            value={form.tags.join(', ')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                tags: e.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              }))
            }
            disabled={disabled}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={disabled || isPending}>
          {disabled ? 'Login required' : isPending ? 'Posting...' : 'Share memory'}
        </button>
      </form>
    </section>
  );
}
