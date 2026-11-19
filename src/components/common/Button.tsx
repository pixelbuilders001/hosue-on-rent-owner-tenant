import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'emerald' | 'dark';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-xs focus:ring-emerald-500',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus:ring-emerald-500',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 focus:ring-slate-400',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500',
  outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs focus:ring-slate-300',
  ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 focus:ring-slate-300',
  dark: 'bg-slate-900 hover:bg-black active:bg-slate-950 text-white shadow-xs focus:ring-slate-700'
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-[11px] font-semibold rounded-lg gap-1.5',
  sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm font-bold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm sm:text-base font-bold rounded-2xl gap-2.5'
};

const spinnerSizes: Record<ButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 select-none
        focus:outline-hidden focus:ring-2 focus:ring-offset-1
        ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.98]'}
        ${fullWidth ? 'w-full' : ''}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={spinnerSizes[size]} className="animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
