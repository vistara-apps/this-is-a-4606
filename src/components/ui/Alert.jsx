import React from 'react';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const variants = {
  info: {
    container: 'bg-blue-500/10 border-blue-500/30',
    icon: <Info className="text-blue-400" />,
    text: 'text-blue-400',
  },
  success: {
    container: 'bg-green-500/10 border-green-500/30',
    icon: <CheckCircle className="text-green-400" />,
    text: 'text-green-400',
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30',
    icon: <AlertTriangle className="text-yellow-400" />,
    text: 'text-yellow-400',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30',
    icon: <AlertCircle className="text-red-400" />,
    text: 'text-red-400',
  },
};

const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  onClose,
  className,
  ...props
}) => {
  const { container, icon: defaultIcon, text } = variants[variant];

  return (
    <div
      className={twMerge(
        'rounded-lg border p-4',
        container,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        {icon !== false && (
          <div className="flex-shrink-0 mr-3">
            {icon || defaultIcon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium ${text} mb-1`}>{title}</h3>
          )}
          <div className={`text-sm ${text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${text} hover:text-white transition-colors`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

