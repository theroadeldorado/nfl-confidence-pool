import React from 'react';

const variants = {
  primary: 'bg-yellow-500 text-green-900 hover:bg-yellow-400',
  secondary: 'bg-white/20 text-white hover:bg-white/30',
  success: 'bg-green-600 text-white hover:bg-green-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-green-700 hover:bg-green-50',
};

const sizes = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6',
  lg: 'py-4 px-8 text-lg',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-semibold transition
        disabled:bg-gray-400 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};
