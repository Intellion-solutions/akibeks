
import { Building2 } from "lucide-react";

interface LogoProps {
  variant?: "default" | "white" | "compact";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ variant = "default", size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl"
  };

  const textColorClasses = {
    default: "text-gray-900",
    white: "text-white",
    compact: "text-gray-900"
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <img 
          src="/lovable-uploads/36449ecf-a66d-4784-8ffb-6eb18390ec8f.png" 
          alt="AKIBEKS Engineering Solutions"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} ${textColorClasses[variant]} leading-tight`}>
            AKIBEKS
          </span>
          <span className={`font-medium text-blue-600 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'} leading-tight`}>
            ENGINEERING SOLUTIONS
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
