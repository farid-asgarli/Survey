import { FileQuestion } from 'lucide-react';
import { headers } from 'next/headers';
import { resolveLanguage, t } from '@/lib/i18n';

export default async function NotFound() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const lang = resolveLanguage(null, acceptLanguage);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container">
            <FileQuestion className="w-10 h-10 text-on-surface-variant" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold text-on-surface font-heading">{t('error.notFound.title', lang)}</h1>

        {/* Description */}
        <p className="text-on-surface-variant mb-8">{t('error.notFound.description', lang)}</p>

        {/* Actions */}
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant/60">{t('error.notFound.hint', lang)}</p>
        </div>
      </div>
    </div>
  );
}
