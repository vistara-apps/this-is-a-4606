import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  secondary: 'bg-dark-surface hover:bg-dark-border text-white',
  outline: 'bg-transparent border border-dark-border hover:border-purple-500 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

const sizes = {
  sm: 'py-1 px-3 text-sm',
  md: 'py-2 px-4',
  lg: 'py-3 px-6 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        'rounded-lg transition-colors font-medium flex items-center justify-center',
        variants[variant],
        sizes[size],
        (disabled || isLoading) && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;

