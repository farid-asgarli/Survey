import { WelcomeScreen } from '@/components/features/public-survey';
import type { PublicSurvey } from '@/types/public-survey';

interface WelcomeSectionProps {
  survey: PublicSurvey;
  totalQuestions: number;
  onStart: () => void;
}

export function WelcomeSection({ survey, totalQuestions, onStart }: WelcomeSectionProps) {
  return (
    <WelcomeScreen
      title={survey.title}
      description={survey.description}
      welcomeMessage={survey.welcomeMessage}
      questionCount={totalQuestions}
      onStart={onStart}
    />
  );
}
