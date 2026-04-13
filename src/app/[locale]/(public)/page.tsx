import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Zap, Globe, Cpu, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
              >
                {t('hero.cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-surface transition-colors"
              >
                {t('hero.services_cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t('services.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe, key: 'web' },
              { icon: Cpu, key: 'pointage' },
              { icon: Zap, key: 'network' },
            ].map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="p-6 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`services.${key}.title`)}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {t(`services.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('contact.subtitle')}
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 mt-4 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            {t('hero.cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
