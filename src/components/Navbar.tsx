
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/onboarding/1', label: 'Onboarding' },
  { href: '/admin', label: 'Admin' },
  { href: '/data', label: 'Data' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === href) return; // Don't navigate if already on the page
    
    setLoadingPath(href);
    router.push(href);
    
    // Reset loading state after navigation
    setTimeout(() => {
      setLoadingPath(null);
    }, 1000);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, width: '100%', background: 'transparent' }}>
      <div style={{ margin: '32px auto 0 auto', maxWidth: 800, padding: '0 16px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: 56,
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, fontFamily: 'Inter, Arial, Helvetica, sans-serif', letterSpacing: 0.5 }}>Board the Z</div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {LINKS.map(link => {
              const active = pathname?.startsWith(link.href);
              const isLoading = loadingPath === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavigation(link.href, e)}
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: active ? '#0070f3' : '#222',
                    textDecoration: 'none',
                    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
                    transition: 'color 0.2s',
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading && (
                    <div style={{
                      width: 16,
                      height: 16,
                      border: '2px solid #e0e0e0',
                      borderTop: '2px solid #0070f3',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  )}
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
