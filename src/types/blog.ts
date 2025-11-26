export type BlogEntry = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  imageUrl: string;
  createdAt: string;
};

export type NewBlogPayload = Pick<BlogEntry, 'title' | 'excerpt' | 'tag' | 'imageUrl'>;
