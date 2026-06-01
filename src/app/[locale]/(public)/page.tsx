import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Code2,
  Palette,
  PenTool,
  Megaphone,
  ArrowRight,
  Sparkles,
  Compass,
  Layers,
  Hammer,
  Rocket,
  Heart,
  Cpu,
  Users,
} from 'lucide-react';

const services = [
  { key: 'web', icon: Code2, color: 'var(--primary)' },
  { key: 'brand', icon: Sparkles, color: 'var(--accent-soft)' },
  { key: 'design', icon: PenTool, color: 'var(--cyan)' },
  { key: 'marketing', icon: Megaphone, color: 'var(--violet)' },
];

const steps = [
  { key: 'step1', icon: Compass },
  { key: 'step2', icon: Layers },
  { key: 'step3', icon: Hammer },
  { key: 'step4', icon: Rocket },
];

const reasons = [
  { key: 'point1', icon: Palette },
  { key: 'point2', icon: Cpu },
  { key: 'point3', icon: Users },
  { key: 'point4', icon: Heart },
];

const marquee = [
  'Websites', 'Logos', 'E-commerce', 'Branding', 'Flyers', 'Banners',
  'Social Media', 'Platforms', 'UI/UX', 'Identity', 'Landing Pages', 'Marketing',
];

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="blob bg-primary w-[480px] h-[480px] -top-32 -left-24 animate-pulse-glow" />
        <div className="blob bg-violet w-[420px] h-[420px] top-10 right-0 animate-pulse-glow" />
        <div className="blob bg-cyan w-[300px] h-[300px] bottom-0 left-1/3 opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur text-xs sm:text-sm text-muted animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {t('hero.badge')}
          </div>

          <h1 className="mt-7 text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-balance animate-fade-up delay-1 max-w-4xl mx-auto">
            {t('hero.title_pre')}{' '}
            <span className="gradient-text">{t('hero.title_highlight')}</span>{' '}
            {t('hero.title_post')}
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto animate-fade-up delay-2 text-balance">
            {t('hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up delay-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all glow"
            >
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-surface/50 text-foreground font-semibold hover:bg-surface-hover transition-colors"
            >
              {t('hero.services_cta')}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto animate-fade-up delay-4">
            {[
              { value: '20+', label: t('hero.stat_projects') },
              { value: '7', label: t('hero.stat_members') },
              { value: '100%', label: t('hero.stat_passion') },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="mt-1 text-xs sm:text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div className="relative border-y border-border bg-surface/40 py-4 overflow-hidden">
          <div className="marquee">
            {[...marquee, ...marquee].map((word, i) => (
              <span key={i} className="flex items-center gap-6 px-6 text-sm font-medium text-muted whitespace-nowrap">
                {word}
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('services.title')}</h2>
            <p className="mt-4 text-muted">{t('services.subtitle')}</p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map(({ key, icon: Icon, color }) => (
              <div
                key={key}
                className="card-glow p-6 rounded-2xl border border-border bg-surface hover:border-primary/40"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(`services.${key}.title`)}</h3>
                <p className="text-sm text-muted leading-relaxed">{t(`services.${key}.description`)}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              {t('services.learn_more')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative border-t border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('process.title')}</h2>
            <p className="mt-4 text-muted">{t('process.subtitle')}</p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ key, icon: Icon }, i) => (
              <div key={key} className="relative p-6 rounded-2xl border border-border bg-surface">
                <span className="absolute top-5 right-6 text-5xl font-bold text-border/80 select-none">
                  0{i + 1}
                </span>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t(`process.${key}_title`)}</h3>
                <p className="text-sm text-muted leading-relaxed">{t(`process.${key}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('why.title')}</h2>
              <p className="mt-4 text-muted max-w-md">{t('why.subtitle')}</p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface text-foreground font-semibold hover:bg-surface-hover transition-colors"
              >
                {t('nav.about')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {reasons.map(({ key, icon: Icon }) => (
                <div key={key} className="p-6 rounded-2xl border border-border bg-surface card-glow hover:border-accent/40">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-accent-soft" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{t(`why.${key}_title`)}</h3>
                  <p className="text-sm text-muted leading-relaxed">{t(`why.${key}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border overflow-hidden">
        <div className="blob bg-primary w-[420px] h-[420px] -bottom-32 left-1/4 opacity-25" />
        <div className="blob bg-violet w-[360px] h-[360px] -top-20 right-1/4 opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
            {t('contact.title')}
          </h2>
          <p className="mt-5 text-muted text-lg max-w-xl mx-auto">{t('contact.subtitle')}</p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 mt-9 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all glow"
          >
            {t('hero.cta')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
