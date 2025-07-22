
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backTo?: string;
  actions?: React.ReactNode;
}

const AdminPageHeader = ({ 
  title, 
  description, 
  icon, 
  backTo = '/admin/dashboard',
  actions 
}: AdminPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            {icon && <span className="mr-3">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
