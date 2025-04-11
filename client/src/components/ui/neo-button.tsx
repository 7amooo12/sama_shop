import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const NeoButton = forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      default: 'border border-gray-700 bg-dark-gray hover:bg-gray-800 text-white',
      primary: 'bg-gradient-to-r from-electric-blue to-vivid-purple hover:brightness-110 text-white shadow-glow',
      ghost: 'hover:bg-gray-800 text-white',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-9 w-9 p-0 text-sm',
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeoButton.displayName = 'NeoButton';

export default NeoButton;