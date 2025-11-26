import Link from 'next/link';
import { BlogGrid } from '@/components/BlogGrid';
import { API_BASE_URL } from '@/lib/apiBase';
import type { BlogEntry } from '@/types/blog';

async function getBlogs(): Promise<BlogEntry[]> {
  const response = await fetch(`${API_BASE_URL}/api/blogs`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }
  return response.json();
}

export const metadata = {
  title: 'Blog | Offbeat Odyssey',
  description: 'Travel stories, field notes, and photography tips from Offbeat Odyssey.'
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <main className="page">
      <section className="page-hero">
        <p className="eyebrow">Blog</p>
        <h1>Field notes & how-tos</h1>
        <p>Dive into the full archive of Offbeat Odyssey stories, itineraries, and creative travel prompts.</p>
        <div className="panel-actions">
          <Link href="/" className="link-button secondary">
            Back to home
          </Link>
        </div>
      </section>

      {blogs.length === 0 ? <p className="empty-state">No stories yet. Visit /admin to add one.</p> : <BlogGrid entries={blogs} />}
    </main>
  );
}
