/**
 * Dynamic OG Image Generation for Survey Pages
 *
 * This generates custom Open Graph images for each survey,
 * including the survey title and optional branding.
 *
 * Note: Uses native fetch for edge runtime compatibility
 */

import { ImageResponse } from 'next/og';
import { config } from '@/lib/config';

// Route segment config
export const runtime = 'edge';
export const alt = 'Survey';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface OGImageProps {
  params: Promise<{ shareToken: string }>;
}

// Type for survey response (minimal fields needed for OG image)
interface SurveyForOG {
  title: string;
  description?: string;
  questions?: { length: number }[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    logoUrl?: string;
    brandingTitle?: string;
  };
}

// Simplified fetch for edge runtime (don't import from @survey/api-client)
async function fetchSurveyForOG(shareToken: string): Promise<SurveyForOG> {
  const response = await fetch(`${config.apiBaseUrl}/api/public/surveys/${shareToken}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: config.cache.ogImageRevalidate },
  });

  if (!response.ok) {
    throw new Error(`Survey not found: ${response.status}`);
  }

  return response.json();
}

export default async function OGImage({ params }: OGImageProps) {
  const { shareToken } = await params;

  try {
    const survey = await fetchSurveyForOG(shareToken);

    const primaryColor = survey.theme?.primaryColor || '#0061a4';
    const backgroundColor = survey.theme?.backgroundColor || '#fdfcff';
    const textColor = survey.theme?.textColor || '#1b1b1f';

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor,
          padding: '60px',
        }}
      >
        {/* Decorative element */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: primaryColor,
          }}
        />

        {/* Logo if available */}
        {survey.theme?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={survey.theme.logoUrl}
            alt=""
            width={120}
            height={60}
            style={{
              objectFit: 'contain',
              marginBottom: '32px',
            }}
          />
        )}

        {/* Branding title */}
        {survey.theme?.brandingTitle && (
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: primaryColor,
              marginBottom: '16px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {survey.theme.brandingTitle}
          </div>
        )}

        {/* Survey title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: textColor,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          {survey.title}
        </div>

        {/* Description */}
        {survey.description && (
          <div
            style={{
              fontSize: '24px',
              color: textColor,
              opacity: 0.7,
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            {survey.description.length > 120 ? `${survey.description.slice(0, 120)}...` : survey.description}
          </div>
        )}

        {/* Question count badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '40px',
            padding: '12px 24px',
            borderRadius: '100px',
            backgroundColor: primaryColor,
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          {survey.questions?.length || 0} question
          {(survey.questions?.length || 0) !== 1 ? 's' : ''}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '16px',
            color: textColor,
            opacity: 0.4,
          }}
        >
          Survey Platform
        </div>
      </div>,
      {
        ...size,
      }
    );
  } catch {
    // Fallback OG image for failed survey fetches
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fdfcff',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#1b1b1f',
          }}
        >
          Survey
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#44474e',
            marginTop: '16px',
          }}
        >
          Take a survey and share your feedback
        </div>
      </div>,
      {
        ...size,
      }
    );
  }
}
