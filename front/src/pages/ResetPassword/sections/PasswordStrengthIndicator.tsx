import { calculatePasswordStrength } from '@/utils/validators';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const passwordStrength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
          style={{ width: `${((passwordStrength.score + 1) / 5) * 100}%` }}
        />
      </div>
      <span
        className={`text-xs font-medium ${
          passwordStrength.score >= 3 ? 'text-success' : passwordStrength.score >= 2 ? 'text-warning' : 'text-error'
        }`}
      >
        {passwordStrength.label}
      </span>
    </div>
  );
}
