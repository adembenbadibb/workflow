import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Code2, Sparkles, PenTool, Megaphone, Check, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const t = useTranslations('services');

  const services = [
    {
      key: 'web',
      icon: Code2,
      color: 'var(--primary)',
      features: ['Websites & Landing Pages', 'E-commerce Stores', 'Web Applications', 'Dashboards & Platforms'],
    },
    {
      key: 'brand',
      icon: Sparkles,
      color: 'var(--accent-soft)',
      features: ['Logo Design', 'Visual Identity', 'Brand Guidelines', 'Signature & Style'],
    },
    {
      key: 'design',
      icon: PenTool,
      color: 'var(--cyan)',
      features: ['Flyers & Posters', 'Banners', 'Social Media Posts', 'Print-Ready Visuals'],
    },
    {
      key: 'marketing',
      icon: Megaphone,
      color: 'var(--violet)',
      features: ['Social Media Strategy', 'Content Creation', 'Ad Campaigns', 'Audience Growth'],
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="blob bg-primary w-[420px] h-[420px] -top-24 right-0 opacity-25" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up">{t('title')}</h1>
          <p className="mt-5 text-lg text-muted max-w-2xl mx-auto animate-fade-up delay-1">{t('subtitle')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-2 gap-6">
          {services.map(({ key, icon: Icon, color, features }) => (
            <div
              key={key}
              className="card-glow p-8 rounded-2xl border border-border bg-surface hover:border-primary/40"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
              >
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t(`${key}.title`)}</h2>
              <p className="text-muted leading-relaxed mb-6">{t(`${key}.description`)}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}
                    >
                      <Check className="w-3 h-3" style={{ color }} />
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-10 rounded-3xl border border-border bg-surface/40 text-center relative overflow-hidden">
          <div className="blob bg-violet w-[320px] h-[320px] -bottom-20 right-1/4 opacity-20" />
          <h2 className="text-2xl md:text-3xl font-bold relative">{t('subtitle')}</h2>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 mt-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all glow relative"
          >
            {t('learn_more')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
