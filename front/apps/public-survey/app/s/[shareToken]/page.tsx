import { fetchPublicSurveySSR } from "@survey/api-client";
import { config } from "@/lib/config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyClient } from "./survey-client";

interface SurveyPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: SurveyPageProps): Promise<Metadata> {
  const { shareToken } = await params;

  try {
    const survey = await fetchPublicSurveySSR(
      config.apiBaseUrl,
      shareToken,
      config.defaultLanguage,
      { revalidate: 60 } // Cache for 60 seconds
    );

    return {
      title: survey.title,
      description: survey.description || `Take the ${survey.title} survey`,
      openGraph: {
        title: survey.title,
        description: survey.description || `Take the ${survey.title} survey`,
        type: "website",
        // Add OG image if theme has one
        ...(survey.theme?.logoUrl && {
          images: [{ url: survey.theme.logoUrl }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: survey.title,
        description: survey.description || `Take the ${survey.title} survey`,
      },
    };
  } catch {
    return {
      title: "Survey",
      description: "Take a survey",
    };
  }
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { shareToken } = await params;

  try {
    // Fetch survey data on the server
    const survey = await fetchPublicSurveySSR(
      config.apiBaseUrl,
      shareToken,
      config.defaultLanguage,
      { revalidate: 60 }
    );

    return (
      <SurveyClient
        initialSurvey={survey}
        shareToken={shareToken}
        apiBaseUrl={config.apiBaseUrl}
      />
    );
  } catch (error) {
    console.error("Failed to fetch survey:", error);
    notFound();
  }
}
