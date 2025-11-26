import { randomUUID } from 'crypto';
import type { BlogEntry } from '@/types/blog';

const seedBlogs: BlogEntry[] = [
  {
    id: randomUUID(),
    title: 'How to capture golden hour on the road',
    excerpt: 'Dial in composition fast, even when you are juggling backpacks and lightning-fast departures.',
    tag: 'Fieldcraft',
    imageUrl: '/blog-1.jpg',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: randomUUID(),
    title: 'Five micro-itineraries for remote workers',
    excerpt: 'Blend coastline strolls and co-working hubs so you can work by day and wander by dusk.',
    tag: 'Remote Life',
    imageUrl: '/blog-2.jpg',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString()
  },
  {
    id: randomUUID(),
    title: 'Street food photo etiquette 101',
    excerpt: 'Keep lines moving, support vendors, and still snag the steamy shot that tells the story.',
    tag: 'Culture',
    imageUrl: '/blog-3.jpg',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  }
];

const blogs: BlogEntry[] = [...seedBlogs];

export function getAllBlogs(): BlogEntry[] {
  return [...blogs].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function addBlog(entry: { title: string; excerpt: string; tag: string; imageUrl: string }): BlogEntry {
  const newBlog: BlogEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  };

  blogs.unshift(newBlog);
  return newBlog;
}

export function getBlogById(id: string): BlogEntry | null {
  return blogs.find((blog) => blog.id === id) ?? null;
}

type EditableBlogFields = Partial<Omit<BlogEntry, 'id' | 'createdAt'>>;

export function updateBlog(id: string, updates: EditableBlogFields): BlogEntry | null {
  const index = blogs.findIndex((blog) => blog.id === id);
  if (index === -1) {
    return null;
  }
  blogs[index] = { ...blogs[index], ...updates };
  return blogs[index];
}

export function deleteBlog(id: string): BlogEntry | null {
  const index = blogs.findIndex((blog) => blog.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = blogs.splice(index, 1);
  return removed;
}
