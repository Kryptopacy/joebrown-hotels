import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Joebrown Palace Hotel and Suites',
    short_name: 'Joebrown',
    description: 'Quality accommodations, bar, lounge, and 24/7 room service in Lagos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F6',
    theme_color: '#FAF9F6',
    icons: [
      {
        src: '/jb_logo_background.jpg',
        sizes: '1024x1024',
        type: 'image/jpeg',
      },
      {
        src: '/jb_logo_background.jpg',
        sizes: '1024x1024',
        type: 'image/jpeg',
        purpose: 'maskable',
      }
    ]
  }
}
