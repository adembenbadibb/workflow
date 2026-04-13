import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold">
              VOLTI<span className="text-primary">X</span> Systems
            </span>
          </div>
          <p className="text-sm text-muted">{t('tagline')}</p>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} VOLTIX Systems. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
