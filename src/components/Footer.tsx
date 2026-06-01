import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Zap, Camera, MessagesSquare, Link2 } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const ts = useTranslations('services');

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet">
                <Zap className="w-5 h-5 text-white" fill="currentColor" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                VOLTI<span className="gradient-text">X</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">{t('tagline')}</p>
            <div className="mt-5 flex gap-3">
              {[Camera, MessagesSquare, Link2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{t('services_title')}</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="/services" className="hover:text-foreground transition-colors">{ts('web.title')}</Link></li>
              <li><Link href="/services" className="hover:text-foreground transition-colors">{ts('brand.title')}</Link></li>
              <li><Link href="/services" className="hover:text-foreground transition-colors">{ts('design.title')}</Link></li>
              <li><Link href="/services" className="hover:text-foreground transition-colors">{ts('marketing.title')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{t('company_title')}</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="/" className="hover:text-foreground transition-colors">{tn('home')}</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">{tn('about')}</Link></li>
              <li><Link href="/services" className="hover:text-foreground transition-colors">{tn('services')}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">{tn('contact')}</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold mb-4">{t('connect_title')}</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><a href="mailto:contact@voltix.dev" className="hover:text-foreground transition-colors">contact@voltix.dev</a></li>
              <li>
                <Link href="/contact" className="inline-flex items-center text-primary font-medium hover:text-primary-hover transition-colors">
                  {tn('cta')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} VOLTIX. {t('rights')}
          </p>
          <p className="text-xs text-muted uppercase tracking-wider">
            Web Design &middot; Brand Identity &middot; Creative Agency
          </p>
        </div>
      </div>
    </footer>
  );
}
