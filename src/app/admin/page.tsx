'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { FormEvent, useEffect, useState, useTransition } from 'react';
import { PostForm } from '@/components/PostForm';
import { PhotoUploadForm } from '@/components/PhotoUploadForm';
import { BlogForm } from '@/components/BlogForm';
import { API_BASE_URL } from '@/lib/apiBase';
import type { Post } from '@/types/post';
import type { BlogEntry } from '@/types/blog';
import type { PhotoAsset } from '@/types/photo';

type BackendPost = Post & { _id?: string };
type BackendBlog = BlogEntry & { _id?: string };

const jsonFetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load data');
  }
  return response.json();
};

const getDocumentId = (entity: { id?: string; _id?: string }): string => {
  return entity.id ?? (entity as { _id?: string })._id ?? '';
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, startLoginTransition] = useTransition();

  const [momentMessage, setMomentMessage] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [blogMessage, setBlogMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = localStorage.getItem('oo_admin_token');
    const savedEmail = localStorage.getItem('oo_admin_email');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedEmail) {
      setAdminEmail(savedEmail);
      setCredentials((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('oo_admin_token', token);
    } else {
      localStorage.removeItem('oo_admin_token');
    }
  }, [token]);

  const isAuthenticated = Boolean(token);

  const {
    data: momentData,
    isLoading: momentsLoading,
    mutate: mutateMoments
  } = useSWR<BackendPost[]>(`${API_BASE_URL}/api/moments`, jsonFetcher);
  const {
    data: photoData,
    isLoading: photosLoading,
    mutate: mutatePhotos
  } = useSWR<PhotoAsset[]>(`${API_BASE_URL}/api/photos`, jsonFetcher);
  const {
    data: blogData,
    isLoading: blogsLoading,
    mutate: mutateBlogs
  } = useSWR<BackendBlog[]>(`${API_BASE_URL}/api/blogs`, jsonFetcher);

  const moments = momentData ?? [];
  const photos = photoData ?? [];
  const blogs = blogData ?? [];

  const requireAuthHeaders = (onError: (message: string) => void): HeadersInit | null => {
    try {
      return buildAuthHeaders();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Please log in first.');
      return null;
    }
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    startLoginTransition(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: 'Login failed' }));
          throw new Error(data.error ?? 'Login failed');
        }

        const data = await response.json();
        setToken(data.token);
        setAdminEmail(credentials.email);
        localStorage.setItem('oo_admin_email', credentials.email);
        setAuthMessage('Logged in successfully.');
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Unable to login');
      }
    });
  };

  const handleLogout = () => {
    setToken(null);
    setAuthMessage('Logged out.');
  };

  const buildAuthHeaders = () => {
    if (!token) {
      throw new Error('Please log in first.');
    }
    return { Authorization: `Bearer ${token}` } as HeadersInit;
  };

  const handleMomentSubmit = async (formData: FormData) => {
    setMomentMessage(null);
    const headers = buildAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/moments`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Unable to save moment' }));
      throw new Error(data.error ?? 'Unable to save moment');
    }

    setMomentMessage('Travel moment saved. It now appears in the gallery and destination views.');
    await mutateMoments();
  };

  const handlePhotoSubmit = async (formData: FormData) => {
    setPhotoMessage(null);
    const headers = buildAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/photos`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Unable to upload photo' }));
      throw new Error(data.error ?? 'Unable to upload photo');
    }

    const uploadType = formData.get('uploadType');
    const message = uploadType === 'destination'
      ? 'Photo uploaded to destination successfully.'
      : 'Photo uploaded to gallery successfully.';
    setPhotoMessage(message);
    await mutatePhotos();
  };

  const handleBlogSubmit = async (formData: FormData) => {
    setBlogMessage(null);
    const headers = buildAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/blogs`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Unable to publish blog' }));
      throw new Error(data.error ?? 'Unable to publish blog');
    }

    setBlogMessage('Blog post published. View it on the blog page.');
    await mutateBlogs();
  };

  const handleMomentRename = async (moment: BackendPost) => {
    const id = getDocumentId(moment);
    if (!id) return;
    const newTitle = window.prompt('Rename memory', moment.title);
    if (!newTitle || newTitle.trim() === moment.title.trim()) {
      return;
    }
    const headers = requireAuthHeaders(setMomentMessage);
    if (!headers) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/moments/${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to rename moment' }));
        throw new Error(data.error ?? 'Unable to rename moment');
      }
      setMomentMessage('Travel moment renamed.');
      await mutateMoments();
    } catch (error) {
      setMomentMessage(error instanceof Error ? error.message : 'Unable to rename moment');
    }
  };

  const handleMomentDelete = async (moment: BackendPost) => {
    const id = getDocumentId(moment);
    if (!id) return;
    if (!window.confirm(`Delete "${moment.title}"? This cannot be undone.`)) {
      return;
    }
    const headers = requireAuthHeaders(setMomentMessage);
    if (!headers) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/moments/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to delete moment' }));
        throw new Error(data.error ?? 'Unable to delete moment');
      }
      setMomentMessage('Travel moment deleted.');
      await mutateMoments();
    } catch (error) {
      setMomentMessage(error instanceof Error ? error.message : 'Unable to delete moment');
    }
  };

  const handlePhotoRename = async (photo: PhotoAsset) => {
    const newTitle = window.prompt('Rename photo', photo.title ?? photo.originalName ?? 'Untitled photo');
    if (!newTitle || newTitle.trim() === (photo.title ?? '').trim()) {
      return;
    }
    const headers = requireAuthHeaders(setPhotoMessage);
    if (!headers) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${photo._id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to rename photo' }));
        throw new Error(data.error ?? 'Unable to rename photo');
      }
      setPhotoMessage('Photo renamed.');
      await mutatePhotos();
    } catch (error) {
      setPhotoMessage(error instanceof Error ? error.message : 'Unable to rename photo');
    }
  };

  const handlePhotoDelete = async (photo: PhotoAsset) => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) {
      return;
    }
    const headers = requireAuthHeaders(setPhotoMessage);
    if (!headers) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${photo._id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to delete photo' }));
        throw new Error(data.error ?? 'Unable to delete photo');
      }
      setPhotoMessage('Photo deleted.');
      await mutatePhotos();
    } catch (error) {
      setPhotoMessage(error instanceof Error ? error.message : 'Unable to delete photo');
    }
  };

  const handleBlogRename = async (blog: BackendBlog) => {
    const id = getDocumentId(blog);
    if (!id) return;
    const newTitle = window.prompt('Rename blog story', blog.title);
    if (!newTitle || newTitle.trim() === blog.title.trim()) {
      return;
    }
    const headers = requireAuthHeaders(setBlogMessage);
    if (!headers) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to rename blog' }));
        throw new Error(data.error ?? 'Unable to rename blog');
      }
      setBlogMessage('Blog renamed.');
      await mutateBlogs();
    } catch (error) {
      setBlogMessage(error instanceof Error ? error.message : 'Unable to rename blog');
    }
  };

  const handleBlogDelete = async (blog: BackendBlog) => {
    const id = getDocumentId(blog);
    if (!id) return;
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) {
      return;
    }
    const headers = requireAuthHeaders(setBlogMessage);
    if (!headers) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to delete blog' }));
        throw new Error(data.error ?? 'Unable to delete blog');
      }
      setBlogMessage('Blog deleted.');
      await mutateBlogs();
    } catch (error) {
      setBlogMessage(error instanceof Error ? error.message : 'Unable to delete blog');
    }
  };


  return (
    <main className="page admin-page">
      <section className="page-hero">
        <p className="eyebrow">Admin</p>
        <h1>Offbeat Odyssey Studio</h1>
        <p>Manage gallery moments, photos, and stories from one dashboard.</p>
        <div className="panel-actions">
          <Link href="/" className="link-button secondary">
            Back to site
          </Link>
        </div>
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Authentication</p>
          <h2>Admin login</h2>
          <p>Use the credentials configured in the Express server `.env` file.</p>
        </header>
        {isAuthenticated ? (
          <div className="auth-status">
            <p>Logged in as {adminEmail ?? 'admin'}.</p>
            <div className="panel-actions">
              <button type="button" className="link-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
            {authMessage && <p className="success-message">{authMessage}</p>}
          </div>
        ) : (
          <form className="blog-admin-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </label>
            {authError && <p className="form-error">{authError}</p>}
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Log in'}
            </button>
            {authMessage && <p className="success-message">{authMessage}</p>}
          </form>
        )}
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Travel moments</p>
          <h2>Add a travel moment</h2>
          <p>Create a complete travel memory with full details: traveler name, location, description, mood, and photo. This creates a destination album if the location is new.</p>
        </header>
        <PostForm onSubmit={handleMomentSubmit} disabled={!isAuthenticated} renderHeader={false} />
        {momentMessage && <p className="success-message">{momentMessage}</p>}
        {!isAuthenticated && <p className="form-error">Log in to add a moment.</p>}
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Photo upload</p>
          <h2>Upload a photo</h2>
          <p>Quickly add a photo to the gallery or to an existing destination. Choose where to upload and select a destination if needed.</p>
        </header>
        <PhotoUploadForm onSubmit={handlePhotoSubmit} apiBase={API_BASE_URL} disabled={!isAuthenticated} />
        {photoMessage && <p className="success-message">{photoMessage}</p>}
        {!isAuthenticated && <p className="form-error">Log in to upload photos.</p>}
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Blog</p>
          <h2>Publish a blog story</h2>
          <p>Share field notes, itineraries, or creative prompts. Images appear at the top of the blog card.</p>
        </header>
        <BlogForm onSubmit={handleBlogSubmit} disabled={!isAuthenticated} />
        {blogMessage && <p className="success-message">{blogMessage}</p>}
        {!isAuthenticated && <p className="form-error">Log in to publish blogs.</p>}
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Travel memories</p>
          <h2>Manage existing moments</h2>
          <p>Rename or delete any memory already published to the gallery.</p>
        </header>
        {momentsLoading ? (
          <p className="loading">Loading travel moments...</p>
        ) : moments.length === 0 ? (
          <p className="empty-state">No moments yet. Add your first one above.</p>
        ) : (
          <ul className="admin-content-list">
            {moments.map((moment) => {
              const id = getDocumentId(moment);
              return (
                <li key={id} className="admin-content-item">
                  <div>
                    <h3>{moment.title}</h3>
                    <p className="admin-item-meta">
                      {moment.location} · {new Date(moment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className="admin-item-actions">
                      <button type="button" onClick={() => handleMomentRename(moment)}>
                        Rename
                      </button>
                      <button type="button" className="danger" onClick={() => handleMomentDelete(moment)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Gallery uploads</p>
          <h2>Manage standalone photos</h2>
          <p>Review every manually uploaded gallery or destination photo.</p>
        </header>
        {photosLoading ? (
          <p className="loading">Loading photos...</p>
        ) : photos.length === 0 ? (
          <p className="empty-state">No uploaded photos yet.</p>
        ) : (
          <ul className="admin-content-list">
            {photos.map((photo) => (
              <li key={photo._id} className="admin-content-item">
                <div>
                  <h3>{photo.title ?? photo.originalName ?? 'Untitled photo'}</h3>
                  <p className="admin-item-meta">
                    {photo.context === 'destination' ? `Destination: ${photo.destinationSlug}` : 'Gallery'} ·{' '}
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {isAuthenticated && (
                  <div className="admin-item-actions">
                    <button type="button" onClick={() => handlePhotoRename(photo)}>
                      Rename
                    </button>
                    <button type="button" className="danger" onClick={() => handlePhotoDelete(photo)}>
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="landing-panel">
        <header>
          <p className="eyebrow">Blog stories</p>
          <h2>Update or delete posts</h2>
          <p>Clean up outdated stories by renaming or removing them.</p>
        </header>
        {blogsLoading ? (
          <p className="loading">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="empty-state">No blog entries published yet.</p>
        ) : (
          <ul className="admin-content-list">
            {blogs.map((blog) => {
              const id = getDocumentId(blog);
              return (
                <li key={id} className="admin-content-item">
                  <div>
                    <h3>{blog.title}</h3>
                    <p className="admin-item-meta">
                      Tag: {blog.tag} · {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className="admin-item-actions">
                      <button type="button" onClick={() => handleBlogRename(blog)}>
                        Rename
                      </button>
                      <button type="button" className="danger" onClick={() => handleBlogDelete(blog)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

    </main>
  );
}
