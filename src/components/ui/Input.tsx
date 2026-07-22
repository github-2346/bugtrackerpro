import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-black text-white border border-white rounded-lg',
          'placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white',
          'transition-all duration-200 hover:border-white/80',
          error && 'border-white ring-1 ring-white',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-white">{error}</p>
      )}
    </div>
  );
};
