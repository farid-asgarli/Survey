import { fetchPublicSurveySSR, type ApiError } from '@survey/api-client';
import { config } from '@/lib/config';
import { resolveLanguage, createTranslator, type SupportedLanguage } from '@/lib/i18n';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { SurveyClient } from './survey-client';
import { LinkErrorView, mapBackendErrorToType } from '@/components/LinkErrorView';

interface SurveyPageProps {
  params: Promise<{
    shareToken: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params, searchParams }: SurveyPageProps): Promise<Metadata> {
  const { shareToken } = await params;
  const { lang: queryLang } = await searchParams;
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  // Resolve language (will be refined after we know available languages)
  const initialLang = resolveLanguage(queryLang, acceptLanguage);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  try {
    const survey = await fetchPublicSurveySSR(config.apiBaseUrl, shareToken, initialLang, { revalidate: config.cache.surveyRevalidate });

    // Build canonical URL
    const canonicalUrl = `${baseUrl}/s/${shareToken}`;

    return {
      title: survey.title,
      description: survey.description || `Take the ${survey.title} survey`,
      alternates: {
        canonical: canonicalUrl,
        languages: survey.availableLanguages.reduce(
          (acc, lang) => ({
            ...acc,
            [lang]: `${baseUrl}/s/${shareToken}?lang=${lang}`,
          }),
          {}
        ),
      },
      openGraph: {
        title: survey.title,
        description: survey.description || `Take the ${survey.title} survey`,
        type: 'website',
        url: canonicalUrl,
        locale: survey.language,
        alternateLocale: survey.availableLanguages.filter((l) => l !== survey.language),
        siteName: survey.theme?.brandingTitle || 'Survey Platform',
        ...(survey.theme?.logoUrl && {
          images: [{ url: survey.theme.logoUrl, alt: survey.title }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: survey.title,
        description: survey.description || `Take the ${survey.title} survey`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: 'Survey',
      description: 'Take a survey',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function SurveyPage({ params, searchParams }: SurveyPageProps) {
  const { shareToken } = await params;
  const { lang: queryLang } = await searchParams;
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  // Initial language resolution
  const initialLang = resolveLanguage(queryLang, acceptLanguage);

  // Fetch survey data on the server
  let finalSurvey;
  let language: SupportedLanguage;

  try {
    const survey = await fetchPublicSurveySSR(config.apiBaseUrl, shareToken, initialLang, { revalidate: config.cache.surveyRevalidate });
    console.log('survey_response_data', survey);
    // Refine language based on survey's available languages
    language = resolveLanguage(queryLang, acceptLanguage, survey.availableLanguages) as SupportedLanguage;

    // If the refined language differs and survey supports it, refetch with correct language
    // This handles the case where user's detected language isn't in survey's available languages
    finalSurvey =
      language !== initialLang && survey.availableLanguages.includes(language)
        ? await fetchPublicSurveySSR(config.apiBaseUrl, shareToken, language, {
            revalidate: config.cache.surveyRevalidate,
          })
        : survey;
  } catch (error) {
    console.error('Failed to fetch survey:', error);

    // Handle specific API errors with localized messages
    const apiError = error as ApiError;
    if (apiError?.message) {
      // Determine language for error page
      const errorLang = resolveLanguage(queryLang, acceptLanguage) as SupportedLanguage;
      const t = createTranslator(errorLang);
      const errorType = mapBackendErrorToType(apiError.message);

      // For 404 errors, use Next.js not found
      if (apiError.status === 404 && errorType === 'notFound') {
        notFound();
      }

      // Show specific error page for link-related errors
      return <LinkErrorView errorType={errorType} t={t} />;
    }

    // Fallback to not found for unknown errors
    notFound();
  }

  return <SurveyClient initialSurvey={finalSurvey} shareToken={shareToken} apiBaseUrl={config.apiBaseUrl} language={language} />;
}
