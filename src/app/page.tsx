'use client';

import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Post } from '@/types/post';
import type { BlogEntry } from '@/types/blog';
import { PostCard } from '@/components/PostCard';
import { AlbumGrid, type AlbumSummary } from '@/components/AlbumGrid';
import { BlogGrid } from '@/components/BlogGrid';
import { API_BASE_URL } from '@/lib/apiBase';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const navLinks: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/destinations', label: 'Destination' },
  { href: '#categories', label: 'Categories' },
  { href: '/gallery', label: 'Gallery' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' }
];

const categoryShowcase = [
  { title: 'Coastal retreats', description: 'Cliff walks, tide pools, and sleepy surf towns.', mood: 'relaxed' },
  { title: 'High-altitude thrills', description: 'Switchbacks, glaciers, and sunrise summit pushes.', mood: 'thrill' },
  { title: 'Cultural immersions', description: 'Festivals, alleyway jazz bars, and art dives.', mood: 'culture' },
  { title: 'Food pilgrimages', description: 'Steam-filled night markets and grandma-run kitchens.', mood: 'foodie' },
  { title: 'Forest bathing', description: 'Mossy trails, misty mornings, and lake dips.', mood: 'nature' }
];

const postsEndpoint = `${API_BASE_URL}/api/moments`;
const blogsEndpoint = `${API_BASE_URL}/api/blogs`;
const destinationsEndpoint = `${API_BASE_URL}/api/destinations`;

export default function HomePage() {
  const { data: postData, isLoading: postsLoading } = useSWR<Post[]>(postsEndpoint, fetcher, {
    revalidateOnFocus: false
  });
  const { data: blogData, isLoading: blogsLoading } = useSWR<BlogEntry[]>(blogsEndpoint, fetcher, {
    revalidateOnFocus: false
  });
  const { data: destinationData } = useSWR<AlbumSummary[]>(destinationsEndpoint, fetcher, {
    revalidateOnFocus: false
  });

  const posts = useMemo(() => postData ?? [], [postData]);
  const galleryPreview = useMemo(() => posts.slice(0, 6), [posts]);
  const blogPreview = useMemo(() => (blogData ?? []).slice(0, 2), [blogData]);
  const albums = destinationData ?? [];

  return (
    <>
      <header className="site-header">
        <div className="brand">Offbeat Odyssey</div>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href as any}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="page">
        <section className="hero hero-full" id="home">
          <Image
            src="/istockphoto-511119416-612x612.jpg"
            alt="Traveler overlooking Cappadocia at sunrise"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-overlay">
            <p className="eyebrow">Travel photo journal</p>
            <h1 className="hero-title">Offbeat Odyssey</h1>
            <p className="hero-subtitle">
              This is a world travel blog featuring beautiful destinations, new experiences, and hidden places around the globe.
            </p>
            <p className="hero-tagline">Please tag along!</p>
            <div className="hero-actions">
              <Link href="/blog" className="link-button">
                Visit Blog
              </Link>
              <Link href="/gallery" className="link-button secondary">
                View Gallery
              </Link>
              <Link href="/destinations" className="link-button secondary">
                Explore Destinations
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-panel" id="blog">
          <header>
            <p className="eyebrow">Blog</p>
            <h2>Fresh reads for travelers</h2>
            <p>Bite-sized stories and how-tos from globetrotting shutterbugs.</p>
          </header>
          {blogsLoading ? (
            <p className="loading">Loading stories...</p>
          ) : blogPreview.length === 0 ? (
            <p className="empty-state">No stories yet. Visit the admin studio to add one.</p>
          ) : (
            <BlogGrid entries={blogPreview} />
          )}
          <div className="panel-actions">
            <Link href="/blog" className="link-button">
              See all blog stories
            </Link>
            <Link href="/admin" className="link-button secondary">
              Open admin studio
            </Link>
          </div>
        </section>

        {albums.length > 0 && <AlbumGrid id="destinations" albums={albums} />}

        <section className="landing-panel" id="categories">
          <header>
            <p className="eyebrow">Categories</p>
            <h2>Curate trips by mood</h2>
            <p>Pick a vibe and plan your next escape.</p>
          </header>
          <div className="category-grid">
            {categoryShowcase.map((category) => (
              <article key={category.title} className={`category-card category-${category.mood}`}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid-heading" id="gallery">
          <div>
            <h2>Latest field notes</h2>
            <p>Fresh drops surface first, backed by the Express + MongoDB API.</p>
          </div>
          <div className="grid-heading-actions">
            <span>{posts.length} stories</span>
            <Link href="/gallery" className="link-button secondary">
              View full gallery
            </Link>
          </div>
        </section>

        {postsLoading ? (
          <p className="loading">Loading dreamy places...</p>
        ) : posts.length === 0 ? (
          <p className="empty-state">No entries yet. Visit the admin studio to add your first memory.</p>
        ) : (
          <div className="card-grid">
            {galleryPreview.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <section className="landing-panel about-panel" id="about">
          <header>
            <p className="eyebrow">About</p>
            <h2>A lightweight travel journal for modern explorers</h2>
          </header>
          <p>
            Travel Field Notes started as a way to keep tiny sensory memories alive between flights. It has since become
            a collaborative mood board where travelers stash raw, unfiltered moments and revisit them later by place,
            category, or story.
          </p>
        </section>

        <section className="contact-card" id="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Say hello, pitch a story, or drop travel tips</h2>
            <p>travelfieldnotes@example.com</p>
          </div>
          <button type="button" onClick={() => window.location.assign('mailto:travelfieldnotes@example.com')}>
            Email us
          </button>
        </section>
      </main>
    </>
  );
}
