import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({
  loading = false,
  children,
  loadingText,
  className,
  disabled,
  variant = 'default',
  size = 'default',
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(
        'relative transition-all duration-200 group',
        loading && 'cursor-not-allowed opacity-80',
        className
      )}
      disabled={loading || disabled}
      variant={variant}
      size={size}
      {...props}
    >
      <span
        className={cn(
          'flex items-center justify-center gap-2 transition-all duration-200',
          loading && 'opacity-0'
        )}
      >
        {children}
      </span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </span>
      )}
    </Button>
  );
} 