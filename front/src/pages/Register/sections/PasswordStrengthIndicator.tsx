import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPasswordRequirements, calculatePasswordStrength } from '@/lib/validations';

interface PasswordStrengthIndicatorProps {
  password: string;
}

/**
 * PasswordStrengthIndicator
 * Displays password strength meter and requirements checklist
 */
export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const passwordRequirements = getPasswordRequirements(password);
  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="mt-3 space-y-3">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300 rounded-full', passwordStrength.color)}
            style={{ width: `${((passwordStrength.score + 1) / 5) * 100}%` }}
          />
        </div>
        <span
          className={cn(
            'text-xs font-semibold',
            passwordStrength.score >= 3 ? 'text-success' : passwordStrength.score >= 2 ? 'text-warning' : 'text-error'
          )}
        >
          {passwordStrength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-xl bg-surface-container/50">
        {passwordRequirements.map((req, i) => (
          <div key={i} className={cn('flex items-center gap-2 text-xs transition-colors', req.met ? 'text-success' : 'text-on-surface-variant')}>
            {req.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
