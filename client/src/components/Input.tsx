import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id: customId,
  className = '',
  ...props
}) => {
  const autoId = useId();
  const id = customId || autoId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border transition-colors bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
          error
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-slate-300 hover:border-slate-400 focus-visible:ring-rose-500 focus:border-rose-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
