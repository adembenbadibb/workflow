'use client';

import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await api.post('/contact', {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
      });
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted">{t('subtitle')}</p>
      </div>

      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              {t('name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={320}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              {t('message')}
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              maxLength={5000}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {loading ? t('sending') : t('send')}
          </button>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-accent text-sm">
              <CheckCircle className="w-4 h-4" />
              {t('success')}
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {t('error')}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
