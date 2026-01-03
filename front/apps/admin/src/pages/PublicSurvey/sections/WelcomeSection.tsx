import { WelcomeScreen } from '@/components/features/public-survey';
import type { PublicSurvey } from '@/types/public-survey';

interface WelcomeSectionProps {
  survey: PublicSurvey;
  totalQuestions: number;
  onStart: () => void;
  isStarting?: boolean;
}

export function WelcomeSection({ survey, totalQuestions, onStart, isStarting }: WelcomeSectionProps) {
  return (
    <WelcomeScreen
      title={survey.title}
      description={survey.description}
      welcomeMessage={survey.welcomeMessage}
      questionCount={totalQuestions}
      onStart={onStart}
      isStarting={isStarting}
      logoUrl={survey.theme?.logoUrl}
      logoSize={survey.theme?.logoSize}
      showLogoBackground={survey.theme?.showLogoBackground}
      logoBackgroundColor={survey.theme?.logoBackgroundColor}
      brandingTitle={survey.theme?.brandingTitle}
      brandingSubtitle={survey.theme?.brandingSubtitle}
    />
  );
}
