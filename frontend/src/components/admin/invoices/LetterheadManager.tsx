
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Eye } from "lucide-react";

interface LetterheadConfig {
  enabled: boolean;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  headerColor: string;
  template: 'professional' | 'modern' | 'classic';
}

interface LetterheadManagerProps {
  letterheadConfig: LetterheadConfig;
  updateLetterheadConfig: (config: LetterheadConfig) => void;
}

const LetterheadManager = ({ letterheadConfig, updateLetterheadConfig }: LetterheadManagerProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleConfigChange = (field: keyof LetterheadConfig, value: any) => {
    updateLetterheadConfig({
      ...letterheadConfig,
      [field]: value
    });
  };

  const templateOptions = [
    { value: 'professional', label: 'Professional - Clean & Corporate' },
    { value: 'modern', label: 'Modern - Bold & Contemporary' },
    { value: 'classic', label: 'Classic - Traditional & Elegant' }
  ];

  const colorOptions = [
    { value: '#1e40af', label: 'Professional Blue' },
    { value: '#059669', label: 'Success Green' },
    { value: '#dc2626', label: 'Corporate Red' },
    { value: '#7c3aed', label: 'Creative Purple' },
    { value: '#ea580c', label: 'Energy Orange' },
    { value: '#374151', label: 'Classic Gray' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Letterhead Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="letterhead-enabled"
            checked={letterheadConfig.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
          <Label htmlFor="letterhead-enabled">Enable Letterhead</Label>
        </div>

        {letterheadConfig.enabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={letterheadConfig.companyName}
                  onChange={(e) => handleConfigChange('companyName', e.target.value)}
                  placeholder="AKIBEKS Engineering Solutions"
                />
              </div>
              <div>
                <Label htmlFor="template">Template Style</Label>
                <Select value={letterheadConfig.template} onValueChange={(value) => handleConfigChange('template', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={letterheadConfig.address}
                onChange={(e) => handleConfigChange('address', e.target.value)}
                placeholder="123 Business Street, Nairobi, Kenya"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={letterheadConfig.phone}
                  onChange={(e) => handleConfigChange('phone', e.target.value)}
                  placeholder="+254 123 456 789"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={letterheadConfig.email}
                  onChange={(e) => handleConfigChange('email', e.target.value)}
                  placeholder="info@akibeks.com"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={letterheadConfig.website}
                  onChange={(e) => handleConfigChange('website', e.target.value)}
                  placeholder="www.akibeks.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="header-color">Header Color</Label>
                <Select value={letterheadConfig.headerColor} onValueChange={(value) => handleConfigChange('headerColor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="logo-upload">Company Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // In a real app, you'd upload this to storage
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          handleConfigChange('logo', e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview && (
              <Card className="p-4 bg-gray-50">
                <div className="bg-white p-6 rounded border shadow-sm">
                  <div 
                    className="border-b-4 pb-4 mb-4"
                    style={{ borderColor: letterheadConfig.headerColor }}
                  >
                    <div className="flex items-center justify-between">
                      {letterheadConfig.logo && (
                        <img 
                          src={letterheadConfig.logo} 
                          alt="Company Logo" 
                          className="h-12 w-auto"
                        />
                      )}
                      <div className="text-right">
                        <h1 
                          className="text-2xl font-bold"
                          style={{ color: letterheadConfig.headerColor }}
                        >
                          {letterheadConfig.companyName || 'Company Name'}
                        </h1>
                        <div className="text-sm text-gray-600 mt-2">
                          {letterheadConfig.address && <p>{letterheadConfig.address}</p>}
                          <p>
                            {letterheadConfig.phone && <span>{letterheadConfig.phone}</span>}
                            {letterheadConfig.phone && letterheadConfig.email && <span> | </span>}
                            {letterheadConfig.email && <span>{letterheadConfig.email}</span>}
                          </p>
                          {letterheadConfig.website && <p>{letterheadConfig.website}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-gray-500 py-8">
                    Invoice content will appear here...
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LetterheadManager;
