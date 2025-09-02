import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = ({
  children,
  className,
  title,
  description,
  footer,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {description && (
            <p className="text-gray-400 text-sm">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-dark-border">{footer}</div>}
    </div>
  );
};

export default Card;

