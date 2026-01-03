import { Check, X } from 'lucide-react';
import { getPasswordRequirements } from '@/lib/validations';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const passwordRequirements = getPasswordRequirements(password);

  if (!password) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {passwordRequirements.map((req, i) => (
        <div key={i} className={`flex items-center gap-1.5 text-xs transition-colors ${req.met ? 'text-success' : 'text-on-surface-variant'}`}>
          {req.met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}
