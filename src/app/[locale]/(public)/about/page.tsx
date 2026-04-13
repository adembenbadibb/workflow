import { useTranslations } from 'next-intl';
import { Target, Eye, Award, Clock } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const values = [
    { icon: Award, text: t('value_1') },
    { icon: Eye, text: t('value_2') },
    { icon: Target, text: t('value_3') },
    { icon: Clock, text: t('value_4') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* Description */}
      <div className="max-w-3xl mx-auto mb-16">
        <p className="text-lg text-muted leading-relaxed">{t('description')}</p>
      </div>

      {/* Vision */}
      <div className="p-8 rounded-2xl border border-border bg-surface mb-16">
        <h2 className="text-2xl font-bold mb-4">{t('vision_title')}</h2>
        <p className="text-muted leading-relaxed">{t('vision')}</p>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">{t('values_title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="p-6 rounded-xl border border-border bg-surface text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
