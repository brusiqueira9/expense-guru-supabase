import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    
    // Comprimento mínimo
    if (password.length >= 8) strength += 1;
    
    // Presença de números
    if (/\d/.test(password)) strength += 1;
    
    // Presença de letras minúsculas
    if (/[a-z]/.test(password)) strength += 1;
    
    // Presença de letras maiúsculas
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Presença de caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    return strength;
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-emerald-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
        return 'Muito fraca';
      case 1:
        return 'Fraca';
      case 2:
        return 'Média';
      case 3:
        return 'Boa';
      case 4:
        return 'Forte';
      case 5:
        return 'Muito forte';
      default:
        return '';
    }
  };

  const strength = calculateStrength(password);
  const strengthColor = getStrengthColor(strength);
  const strengthText = getStrengthText(strength);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', strengthColor)}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      {password && (
        <p className={cn('text-xs', {
          'text-red-500': strength <= 1,
          'text-orange-500': strength === 2,
          'text-yellow-500': strength === 3,
          'text-green-500': strength === 4,
          'text-emerald-500': strength === 5,
        })}>
          Força da senha: {strengthText}
        </p>
      )}
    </div>
  );
} 