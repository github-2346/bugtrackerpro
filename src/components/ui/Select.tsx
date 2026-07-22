import React from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
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
      <select
        className={cn(
          'w-full px-4 py-3 bg-black text-white border border-white rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-white',
          'transition-all duration-200 hover:border-white/80 appearance-none cursor-pointer',
          error && 'border-white ring-1 ring-white',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-white">{error}</p>
      )}
    </div>
  );
};
