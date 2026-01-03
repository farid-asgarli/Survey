"use client";

import { useEffect, useMemo } from "react";
import type { PublicSurvey } from "@survey/types";
import { generateThemeCSSVariables } from "@survey/ui";
import { useSurveyStore } from "@/store/survey-store";

interface SurveyClientProps {
  initialSurvey: PublicSurvey;
  shareToken: string;
  apiBaseUrl: string;
}

export function SurveyClient({ initialSurvey, shareToken, apiBaseUrl }: SurveyClientProps) {
  const { survey, viewMode, setSurvey, setApiBaseUrl, setShareToken } = useSurveyStore();

  // Initialize store with server-fetched data
  useEffect(() => {
    setApiBaseUrl(apiBaseUrl);
    setShareToken(shareToken);
    setSurvey(initialSurvey);
  }, [initialSurvey, apiBaseUrl, shareToken, setSurvey, setApiBaseUrl, setShareToken]);

  // Generate theme CSS variables
  const themeStyles = useMemo(() => {
    const theme = survey?.theme || initialSurvey.theme;
    if (!theme) return {};
    return generateThemeCSSVariables(theme);
  }, [survey?.theme, initialSurvey.theme]);

  const displaySurvey = survey || initialSurvey;

  return (
    <div className="min-h-screen" style={themeStyles}>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {viewMode === "welcome" && <WelcomeView survey={displaySurvey} />}
        {viewMode === "questions" && <QuestionsView survey={displaySurvey} />}
        {viewMode === "thank-you" && <ThankYouView survey={displaySurvey} />}
        {viewMode === "error" && <ErrorView />}
      </div>
    </div>
  );
}

// Placeholder components - will be fully implemented in Phase 2/3
function WelcomeView({ survey }: { survey: PublicSurvey }) {
  const { setViewMode } = useSurveyStore();

  return (
    <div className="text-center">
      {survey.theme?.logoUrl && (
        <img
          src={survey.theme.logoUrl}
          alt="Survey logo"
          className="mx-auto mb-6 h-16 object-contain"
        />
      )}
      <h1 className="mb-4 text-3xl font-bold">{survey.title}</h1>
      {survey.description && <p className="mb-6 text-lg text-gray-600">{survey.description}</p>}
      {survey.welcomeMessage && (
        <div
          className="mb-8 prose prose-gray"
          dangerouslySetInnerHTML={{ __html: survey.welcomeMessage }}
        />
      )}
      <button
        onClick={() => setViewMode("questions")}
        className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
      >
        Start Survey
      </button>
    </div>
  );
}

function QuestionsView({ survey }: { survey: PublicSurvey }) {
  const { currentQuestionIndex, setViewMode } = useSurveyStore();
  const currentQuestion = survey.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-500">
        Question {currentQuestionIndex + 1} of {survey.questions.length}
      </div>
      <h2 className="mb-4 text-xl font-semibold">{currentQuestion.text}</h2>
      {currentQuestion.description && (
        <p className="mb-4 text-gray-600">{currentQuestion.description}</p>
      )}

      {/* Question type renderer placeholder */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-gray-500">Question type: {currentQuestion.type}</p>
        <p className="text-sm text-gray-400">(Question renderers will be implemented in Phase 2)</p>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            const store = useSurveyStore.getState();
            if (currentQuestionIndex > 0) {
              store.setCurrentQuestionIndex(currentQuestionIndex - 1);
            }
          }}
          disabled={currentQuestionIndex === 0}
          className="rounded-lg border border-gray-300 px-6 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => {
            const store = useSurveyStore.getState();
            if (currentQuestionIndex < survey.questions.length - 1) {
              store.setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
              setViewMode("thank-you");
            }
          }}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          {currentQuestionIndex < survey.questions.length - 1 ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
}

function ThankYouView({ survey }: { survey: PublicSurvey }) {
  return (
    <div className="text-center">
      <div className="mb-6 text-5xl">🎉</div>
      <h1 className="mb-4 text-2xl font-bold">Thank You!</h1>
      {survey.thankYouMessage ? (
        <div
          className="prose prose-gray mx-auto"
          dangerouslySetInnerHTML={{ __html: survey.thankYouMessage }}
        />
      ) : (
        <p className="text-gray-600">
          Your response has been recorded. Thank you for taking the time to complete this survey.
        </p>
      )}
    </div>
  );
}

function ErrorView() {
  const { error } = useSurveyStore();

  return (
    <div className="text-center">
      <div className="mb-6 text-5xl">😕</div>
      <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-600">
        {error || "We couldn't load the survey. Please try again later."}
      </p>
    </div>
  );
}
