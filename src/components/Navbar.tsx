'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const otherLocale = locale === 'en' ? 'fr' : 'en';
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/services' as const, label: t('services') },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              VOLTI<span className="gradient-text">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === link.href ? 'text-foreground' : 'text-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={pathname}
              locale={otherLocale}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors uppercase"
            >
              {otherLocale}
            </Link>
            <a
              href={`/${locale}/login`}
              className="text-sm font-medium px-3 py-2 rounded-lg text-muted hover:text-foreground transition-colors"
            >
              {t('login')}
            </a>
            <Link
              href="/contact"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              {t('cta')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-primary' : 'text-muted'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <Link
                href={pathname}
                locale={otherLocale}
                className="text-sm font-medium text-muted hover:text-foreground uppercase"
              >
                {otherLocale}
              </Link>
              <a
                href={`/${locale}/login`}
                className="text-sm font-medium text-muted"
              >
                {t('login')}
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white"
              >
                {t('cta')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
