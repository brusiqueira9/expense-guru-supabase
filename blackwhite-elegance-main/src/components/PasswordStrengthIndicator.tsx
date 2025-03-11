
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState({
    hasLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false
  });
  
  useEffect(() => {
    // Reset state for empty password
    if (!password) {
      setStrength(0);
      setCriteria({
        hasLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecial: false
      });
      return;
    }
    
    // Check criteria
    const newCriteria = {
      hasLength: password.length > 7,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };
    
    setCriteria(newCriteria);
    
    // Calculate strength based on criteria
    const strengthScore = Object.values(newCriteria).filter(Boolean).length;
    setStrength(strengthScore);
  }, [password]);
  
  const getPasswordIcon = () => {
    if (!password) return <Shield className="h-4 w-4 text-gray-400" />;
    if (strength === 4) return <ShieldCheck className="h-4 w-4 text-black animate-pulse" />;
    if (strength >= 2) return <Shield className="h-4 w-4 text-gray-700" />;
    return <ShieldAlert className="h-4 w-4 text-gray-500" />;
  };
  
  return (
    <div className="w-full space-y-2 mt-2">
      <div className="flex gap-1 h-1.5 transition-all duration-500">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level}
            className={cn(
              "h-full w-1/4 transition-all duration-500 rounded-full",
              {
                "bg-gray-200": strength < level,
                "bg-gray-400": strength === 1 && level === 1,
                "bg-gray-600": strength === 2 && level <= 2,
                "bg-gray-800": strength === 3 && level <= 3,
                "bg-black": strength === 4 && level <= 4
              }
            )}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-1.5">
        {getPasswordIcon()}
        <p className="text-xs text-muted-foreground transition-all duration-300">
          {!password && "Digite sua senha"}
          {password && strength === 0 && "Senha muito fraca"}
          {strength === 1 && "Senha fraca"}
          {strength === 2 && "Senha razoável"}
          {strength === 3 && "Senha forte"}
          {strength === 4 && "Senha excelente"}
        </p>
      </div>
      
      {password && (
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 pt-1">
          <div className={`flex items-center gap-1 ${criteria.hasLength ? 'text-black' : ''}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${criteria.hasLength ? 'bg-black' : 'bg-gray-300'}`}></div>
            8+ caracteres
          </div>
          <div className={`flex items-center gap-1 ${criteria.hasUppercase ? 'text-black' : ''}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${criteria.hasUppercase ? 'bg-black' : 'bg-gray-300'}`}></div>
            Letra maiúscula
          </div>
          <div className={`flex items-center gap-1 ${criteria.hasNumber ? 'text-black' : ''}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${criteria.hasNumber ? 'bg-black' : 'bg-gray-300'}`}></div>
            Número
          </div>
          <div className={`flex items-center gap-1 ${criteria.hasSpecial ? 'text-black' : ''}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${criteria.hasSpecial ? 'bg-black' : 'bg-gray-300'}`}></div>
            Caractere especial
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
