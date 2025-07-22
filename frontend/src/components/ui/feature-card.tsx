
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconColor?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  className,
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className={cn(
      'group p-6 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
      className
    )}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn(
          'p-3 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-110 transition-transform duration-300',
          iconColor
        )}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
