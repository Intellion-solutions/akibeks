
import React from 'react';
import { cn } from '@/lib/utils';
import { Image, Building, User } from 'lucide-react';

interface PlaceholderImageProps {
  type?: 'testimonial' | 'project' | 'team' | 'company' | 'general';
  className?: string;
  width?: number;
  height?: number;
  name?: string;
}

const getPlaceholderContent = (type: string, name?: string) => {
  switch (type) {
    case 'testimonial':
      return {
        icon: User,
        text: name ? name.substring(0, 2).toUpperCase() : 'CL',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      };
    case 'project':
      return {
        icon: Building,
        text: name ? name.substring(0, 2).toUpperCase() : 'PR',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    case 'team':
      return {
        icon: User,
        text: name ? name.substring(0, 2).toUpperCase() : 'TM',
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600'
      };
    case 'company':
      return {
        icon: Building,
        text: name ? name.substring(0, 2).toUpperCase() : 'CO',
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600'
      };
    default:
      return {
        icon: Image,
        text: 'IMG',
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600'
      };
  }
};

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  type = 'general',
  className,
  width = 64,
  height = 64,
  name
}) => {
  const { icon: Icon, text, bgColor, iconColor } = getPlaceholderContent(type, name);

  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300',
        bgColor,
        className
      )}
      style={{ width, height }}
    >
      <div className="text-center">
        <Icon className={cn('mx-auto mb-1', iconColor)} size={Math.min(width, height) * 0.3} />
        <span className={cn('text-xs font-medium', iconColor)}>{text}</span>
      </div>
    </div>
  );
};
