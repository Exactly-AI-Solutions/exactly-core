import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exactly Admin',
  description: 'Admin portal for managing Exactly tenants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#F9FAFB',
          minHeight: '100vh',
        }}
      >
        <header
          style={{
            backgroundColor: '#1F2937',
            color: 'white',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Exactly Admin
          </h1>
          <nav>
            <a
              href="/tenants"
              style={{ color: '#9CA3AF', textDecoration: 'none', marginRight: '1rem' }}
            >
              Tenants
            </a>
            <a href="/handoffs" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
              Handoffs
            </a>
          </nav>
        </header>
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
