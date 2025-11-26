/** @type {import('next').NextConfig} */
const fallbackApiOrigins = ['https://travalapp-backend.vercel.app', 'https://travalapp-backend.vercel.app'];
const candidateOrigins = [
  process.env.NEXT_PUBLIC_API_BASE_URL,
  process.env.API_BASE_URL,
  ...fallbackApiOrigins
];

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com'
  }
];

const seenOrigins = new Set();

for (const origin of candidateOrigins) {
  if (!origin) continue;
  try {
    const apiUrl = new URL(origin);
    const protocol = apiUrl.protocol.replace(':', '');
    const hostname = apiUrl.hostname;
    const port = apiUrl.port || undefined;
    const key = `${protocol}://${hostname}${port ? `:${port}` : ''}`;
    if (seenOrigins.has(key)) {
      continue;
    }
    seenOrigins.add(key);
    remotePatterns.push({ protocol, hostname, port });
  } catch {
    // ignore invalid origins so dev server keeps running
  }
}

const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns
  }
};

export default nextConfig;
