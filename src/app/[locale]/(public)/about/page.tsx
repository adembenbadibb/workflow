import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Target, Rocket, ShieldCheck, Palette, Clock, ArrowRight, Code2, Wallet, Megaphone } from 'lucide-react';

type Role = 'dev' | 'finance' | 'marketing' | 'design';

const team: { name: string; role: Role }[] = [
  { name: 'Benabdi Adem', role: 'dev' },
  { name: 'Hamdine Yasin', role: 'dev' },
  { name: 'Benallal Lokmane', role: 'dev' },
  { name: 'Hamdine Lotfi', role: 'design' },
  { name: 'Idir Zakaria', role: 'design' },
  { name: 'Ouchikh Brahim', role: 'marketing' },
  { name: 'Chekroun Raouf', role: 'finance' },
];

const roleMeta: Record<Role, { icon: typeof Code2; color: string; labelKey: string }> = {
  dev: { icon: Code2, color: 'var(--primary)', labelKey: 'role_dev' },
  design: { icon: Palette, color: 'var(--cyan)', labelKey: 'role_design' },
  marketing: { icon: Megaphone, color: 'var(--violet)', labelKey: 'role_marketing' },
  finance: { icon: Wallet, color: 'var(--accent-soft)', labelKey: 'role_finance' },
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function AboutPage() {
  const t = useTranslations('about');
  const tt = useTranslations('team');
  const tc = useTranslations('contact');
  const th = useTranslations('hero');

  const values = [
    { icon: ShieldCheck, text: t('value_1') },
    { icon: Target, text: t('value_2') },
    { icon: Palette, text: t('value_3') },
    { icon: Clock, text: t('value_4') },
  ];

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="blob bg-violet w-[420px] h-[420px] -top-24 left-0 opacity-25" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up text-balance">
            {t('title')}
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl mx-auto animate-fade-up delay-1 text-balance">
            {t('subtitle')}
          </p>
          <p className="mt-8 text-muted leading-relaxed max-w-3xl mx-auto animate-fade-up delay-2">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl border border-border bg-surface card-glow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t('mission_title')}</h2>
            <p className="text-muted leading-relaxed">{t('mission')}</p>
          </div>
          <div className="p-8 rounded-2xl border border-border bg-surface card-glow">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
              <Rocket className="w-6 h-6 text-accent-soft" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t('vision_title')}</h2>
            <p className="text-muted leading-relaxed">{t('vision')}</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{tt('title')}</h2>
          <p className="mt-4 text-muted">{tt('subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map(({ name, role }) => {
            const meta = roleMeta[role];
            const Icon = meta.icon;
            return (
              <div
                key={name}
                className="card-glow group p-6 rounded-2xl border border-border bg-surface hover:border-primary/40 text-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}, color-mix(in srgb, ${meta.color} 40%, #0A0E1A))`,
                  }}
                >
                  {initials(name)}
                </div>
                <h3 className="mt-5 font-semibold">{name}</h3>
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                    color: meta.color,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tt(meta.labelKey)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">{t('values_title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="p-6 rounded-2xl border border-border bg-surface text-center card-glow hover:border-accent/40"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent-soft" />
                </div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
          {tc('title')}
        </h2>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 px-8 py-4 mt-8 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all glow"
        >
          {th('cta')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </>
  );
}
