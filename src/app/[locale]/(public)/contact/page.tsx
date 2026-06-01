'use client';

import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import { Send, CheckCircle, AlertCircle, Mail, MapPin, Camera, MessagesSquare, Link2 } from 'lucide-react';

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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="blob bg-primary w-[420px] h-[420px] -top-24 right-0 opacity-20" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up text-balance">{t('title')}</h1>
          <p className="mt-4 text-lg text-muted animate-fade-up delay-1">{t('subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-7 rounded-2xl border border-border bg-surface">
              <h2 className="text-lg font-semibold mb-5">{t('info_title')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t('email_label')}</p>
                    <p className="text-sm font-medium">contact@voltix.dev</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent-soft" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t('location_label')}</p>
                    <p className="text-sm font-medium">{t('location_value')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-6 border-t border-border">
                <p className="text-xs text-muted mb-3">{t('follow')}</p>
                <div className="flex gap-3">
                  {[Camera, MessagesSquare, Link2].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-7 rounded-2xl border border-border bg-surface space-y-5">
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
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow"
              >
                <Send className="w-4 h-4" />
                {loading ? t('sending') : t('send')}
              </button>

              {status === 'success' && (
                <div className="flex items-center gap-2 text-accent-soft text-sm">
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
      </div>
    </section>
  );
}
