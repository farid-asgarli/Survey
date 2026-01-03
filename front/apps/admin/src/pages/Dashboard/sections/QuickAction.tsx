import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

export function QuickAction({ icon, label, description, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-4 px-4 py-3.5 w-full text-left', 'hover:bg-surface-container-high', 'transition-colors duration-200')}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/60 text-on-primary-container">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-on-surface">{label}</p>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-on-surface-variant" />
    </button>
  );
}
