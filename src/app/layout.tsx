import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Siêu Thị Mắt Kính — Kính Mắt Thời Trang',
    template: '%s | Siêu Thị Mắt Kính',
  },
  description:
    'Cửa hàng kính mắt thời trang hàng đầu. Gọng kính cao cấp, tròng chống ánh sáng xanh, tư vấn AI, thử kính online.',
  manifest: '/manifest.json',
  keywords: [
    'kính mắt',
    'gọng kính',
    'kính thời trang',
    'kính cận',
    'kính râm',
    'mắt kính',
    'tròng kính',
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Siêu Thị Mắt Kính',
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
