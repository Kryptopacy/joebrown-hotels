import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://joebrownhotels.com"),
  title: {
    default: "Joebrown Palace Hotel and Suites | Luxury Hotel & Lounge",
    template: "%s | Joebrown Palace Hotel and Suites"
  },
  description: "Experience the best hotel, lounge, and bar. Enjoy luxury rooms, 24/7 room service, cold drinks, and delicious meals.",
  keywords: [
    "Joebrown Palace Hotel", "Joebrown Palace Hotel and Suites", "Luxury Hotel", 
    "Accommodation", "Lounge", "Bar and Kitchen"
  ],
  openGraph: {
    title: "Joebrown Palace Hotel and Suites | Luxury Hotel & Lounge",
    description: "Experience the best hotel, lounge, and bar. Enjoy luxury rooms, 24/7 room service, cold drinks, and delicious meals.",
    images: ["/jb_logo_background.jpg"],
    type: "website",
    locale: "en_US",
    siteName: "Joebrown Palace Hotel and Suites",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joebrown Palace Hotel and Suites",
    description: "Experience the best hotel, lounge, and bar.",
    images: ["/jb_logo_background.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Joebrown Palace Hotel and Suites",
  },
  icons: {
    icon: "/jb_logo_background.jpg",
    apple: "/jb_logo_background.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
};

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Joebrown Palace Hotel and Suites",
    "description": "Experience the best hotel, lounge, and bar. Enjoy luxury rooms, 24/7 room service, cold drinks, and delicious meals.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Hotel Address Here",
      "addressLocality": "Your City",
      "addressRegion": "Your State",
      "addressCountry": "Your Country"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.0000",
      "longitude": "0.0000"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Your City"
      }
    ],
    "telephone": "+1234567890",
    "priceRange": "₦₦₦",
    "image": "https://joebrownhotels.com/jb_logo_background.jpg",
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Fiber Wi-Fi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Restaurant & Lounge Service",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "24/7 Room Service & Intercom",
        "value": true
      }
    ]
  };

  return (
    <html lang="en" className={`scroll-smooth ${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-[#FAF9F6] text-slate-900 min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
