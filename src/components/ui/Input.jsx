import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-dark-surface border border-dark-border focus:border-purple-500',
  error: 'bg-dark-surface border border-red-500 focus:border-red-600',
};

const Input = forwardRef(
  (
    {
      label,
      helperText,
      error,
      className,
      variant = 'default',
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const inputVariant = error ? variants.error : variants[variant];

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              'w-full px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors',
              inputVariant,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p
            className={`mt-1 text-sm ${
              error ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

