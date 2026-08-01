import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://joebrownhotels.com';

  const staticRoutes = [
    '',
    '/menu',
    '/contact',
    '/rooms',
    '/privacy',
    '/terms',
    '/concierge'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('slug, updated_at')
    .eq('hotel_id', (await supabase.from('hotels').select('id').eq('slug', 'joebrown').single()).data?.id);

  const dynamicRoutes = (rooms || []).map((room) => ({
    url: `${baseUrl}/rooms/${room.slug}`,
    lastModified: new Date(room.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
