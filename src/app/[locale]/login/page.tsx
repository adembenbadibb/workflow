'use client';

import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).toLowerCase().trim();
    const password = formData.get('password') as string;

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      window.location.href = '/dashboard';
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">
              VOLTI<span className="text-primary">X</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="you@voltix.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('signing_in') : t('sign_in')}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-400/10">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
