import { ThankYouScreen } from '@/components/features/public-survey';

interface ThankYouSectionProps {
  message?: string;
}

export function ThankYouSection({ message }: ThankYouSectionProps) {
  return <ThankYouScreen message={message} />;
}
