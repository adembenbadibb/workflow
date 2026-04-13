import { useTranslations } from 'next-intl';
import { Globe, Cpu, Zap, CheckCircle } from 'lucide-react';

export default function ServicesPage() {
  const t = useTranslations('services');

  const services = [
    {
      key: 'web',
      icon: Globe,
      features: ['Websites & Landing Pages', 'Web Applications', 'E-commerce', 'API Development'],
    },
    {
      key: 'pointage',
      icon: Cpu,
      features: ['Time Tracking', 'Biometric Integration', 'Cloud Dashboard', 'Reports & Analytics'],
    },
    {
      key: 'network',
      icon: Zap,
      features: ['Structured Cabling', 'Network Configuration', 'Security Setup', 'Maintenance & Support'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      <div className="grid gap-8">
        {services.map(({ key, icon: Icon, features }) => (
          <div
            key={key}
            className="p-8 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">{t(`${key}.title`)}</h2>
                <p className="text-muted leading-relaxed mb-4">{t(`${key}.description`)}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
