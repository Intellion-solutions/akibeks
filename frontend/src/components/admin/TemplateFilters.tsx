
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar, DollarSign } from "lucide-react";

interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  valueRange: string;
  dateRange: string;
}

interface TemplateFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalTemplates: number;
  filteredCount: number;
}

const TemplateFilters = ({ filters, onFiltersChange, totalTemplates, filteredCount }: TemplateFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      valueRange: 'all',
      dateRange: 'all'
    });
    setShowAdvanced(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.valueRange !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and basic controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates by name or ID..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredCount} of {totalTemplates} templates
              {filters.search && ` for "${filters.search}"`}
            </span>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sortBy" className="text-xs">Sort by:</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="template_name">Name</SelectItem>
                    <SelectItem value="grand_total">Total Value</SelectItem>
                    <SelectItem value="updated_at">Last Modified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Template Value Range
                  </Label>
                  <Select
                    value={filters.valueRange}
                    onValueChange={(value) => updateFilter('valueRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Values</SelectItem>
                      <SelectItem value="0-100000">KSh 0 - 100K</SelectItem>
                      <SelectItem value="100000-500000">KSh 100K - 500K</SelectItem>
                      <SelectItem value="500000-1000000">KSh 500K - 1M</SelectItem>
                      <SelectItem value="1000000-5000000">KSh 1M - 5M</SelectItem>
                      <SelectItem value="5000000+">KSh 5M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date Created
                  </Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => updateFilter('dateRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filters display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {filters.search && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: "{filters.search}"
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilter('search', '')}
                      />
                    </Badge>
                  )}
                  {filters.valueRange !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Value: {filters.valueRange === '5000000+' ? 'KSh 5M+' : 
                               filters.valueRange.replace('-', ' - KSh ').replace(/(\d+)/g, (match) => 
                                 parseInt(match).toLocaleString())}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilter('valueRange', 'all')}
                      />
                    </Badge>
                  )}
                  {filters.dateRange !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Date: {filters.dateRange}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilter('dateRange', 'all')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateFilters;
