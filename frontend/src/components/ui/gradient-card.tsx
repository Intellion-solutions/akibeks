
import React from 'react';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'purple' | 'orange' | 'green';
}

export const GradientCard: React.FC<GradientCardProps> = ({ 
  children, 
  className,
  gradient = 'blue'
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200',
    purple: 'bg-gradient-to-br from-purple-50 via-white to-purple-50 border-purple-200',
    orange: 'bg-gradient-to-br from-orange-50 via-white to-orange-50 border-orange-200',
    green: 'bg-gradient-to-br from-green-50 via-white to-green-50 border-green-200'
  };

  return (
    <div className={cn(
      'rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300',
      gradientClasses[gradient],
      className
    )}>
      {children}
    </div>
  );
};
