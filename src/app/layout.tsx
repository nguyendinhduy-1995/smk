import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Siêu Thị Mắt Kính — Kính Mắt Thời Trang',
    template: '%s | Siêu Thị Mắt Kính',
  },
  description:
    'Cửa hàng kính mắt thời trang hàng đầu. Gọng kính cao cấp, tròng chống ánh sáng xanh, thử kính online, tư vấn chuyên nghiệp.',
  manifest: '/manifest.json',
  keywords: [
    'kính mắt',
    'gọng kính',
    'kính thời trang',
    'kính cận',
    'kính râm',
    'mắt kính',
    'tròng kính',
    'siêu thị mắt kính',
    'thử kính online',
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Siêu Thị Mắt Kính',
    title: 'Siêu Thị Mắt Kính — Kính Mắt Thời Trang Cao Cấp',
    description: 'Gọng kính cao cấp Ray-Ban, Tom Ford, Lindberg. Thử kính online, giao hàng miễn phí từ 500K.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Siêu Thị Mắt Kính' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siêu Thị Mắt Kính — Kính Mắt Thời Trang',
    description: 'Thử kính online, bảo hành 1 năm, freeship từ 500K.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://sieuthimatkinh.vn',
  },
};

export const viewport: Viewport = {
  themeColor: '#d4a853',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
