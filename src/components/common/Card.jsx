import React from 'react';

export const Card = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-white rounded-xl shadow-sm',
    dark: 'bg-white/10 backdrop-blur rounded-xl',
    bordered: 'bg-white rounded-xl border border-gray-200',
  };

  return (
    <div className={`${variants[variant]} p-4 ${className}`}>
      {children}
    </div>
  );
};
