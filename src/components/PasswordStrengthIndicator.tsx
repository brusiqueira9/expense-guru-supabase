import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements = [
    {
      label: 'Pelo menos 8 caracteres',
      met: password.length >= 8,
    },
    {
      label: 'Pelo menos uma letra maiúscula',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Pelo menos uma letra minúscula',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Pelo menos um número',
      met: /\d/.test(password),
    },
    {
      label: 'Pelo menos um caractere especial',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const strength = requirements.filter(req => req.met).length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage <= 20) return 'bg-red-500';
    if (strengthPercentage <= 40) return 'bg-orange-500';
    if (strengthPercentage <= 60) return 'bg-yellow-500';
    if (strengthPercentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthPercentage <= 20) return 'Senha muito fraca';
    if (strengthPercentage <= 40) return 'Senha fraca';
    if (strengthPercentage <= 60) return 'Senha média';
    if (strengthPercentage <= 80) return 'Senha forte';
    return 'Senha excelente';
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="text-sm font-medium">{getStrengthText()}</span>
        <span className="text-xs sm:text-sm text-gray-500">({strength}/{requirements.length} requisitos)</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            {req.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            )}
            <span className={req.met ? 'text-green-500' : 'text-gray-400'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 