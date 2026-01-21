import { useState } from 'react';
import { Filter, Briefcase, Clock, Users, ChevronDown, ChevronRight, Sparkles, Trash2, X, Hash } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterState, JobCategory, ExperienceLevel, EmploymentType, CustomFilter } from '@/types/applicant';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  customFilters?: CustomFilter[];
  activeCustomFilterId?: string | null;
  onApplyCustomFilter?: (filter: CustomFilter) => void;
  onDeleteCustomFilter?: (filterId: string) => void;
  onClearFilters?: () => void;
  dataSource?: 'talent-pool' | 'work-with-us';
}

const jobCategories: JobCategory[] = ['Energy Consultant', 'Renewable Energy', 'Business Consultant'];
const experienceLevels: ExperienceLevel[] = ['Fresher', '5-10 Years', '10-15 Years', '15+ Years'];
const employmentTypes: EmploymentType[] = ['Full-time', 'Freelance'];

interface FilterGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterGroup({ title, icon, children, defaultOpen = true }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="mt-1 space-y-1 pl-8">{children}</div>
      </div>
    </div>
  );
}

export function FilterSidebar({ 
  filters, 
  onFiltersChange, 
  customFilters = [],
  activeCustomFilterId,
  onApplyCustomFilter,
  onDeleteCustomFilter,
  onClearFilters,
  dataSource = 'talent-pool',
}: FilterSidebarProps) {
  const toggleCategory = (category: JobCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleExperience = (level: ExperienceLevel) => {
    const newLevels = filters.experienceLevels.includes(level)
      ? filters.experienceLevels.filter((l) => l !== level)
      : [...filters.experienceLevels, level];
    onFiltersChange({ ...filters, experienceLevels: newLevels });
  };

  const toggleEmployment = (type: EmploymentType) => {
    const newTypes = filters.employmentTypes.includes(type)
      ? filters.employmentTypes.filter((t) => t !== type)
      : [...filters.employmentTypes, type];
    onFiltersChange({ ...filters, employmentTypes: newTypes });
  };

  const handleJobIdChange = (value: string) => {
    onFiltersChange({ ...filters, jobId: value || undefined });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.experienceLevels.length > 0 || 
    filters.employmentTypes.length > 0 ||
    !!filters.jobId ||
    !!activeCustomFilterId;

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sidebar-foreground">Filters</span>
        </div>
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Custom Filters Section */}
      {customFilters.length > 0 && (
        <FilterGroup
          title="Custom Filters"
          icon={<Sparkles className="h-4 w-4 text-violet-500" />}
          defaultOpen={true}
        >
          <div className="space-y-2">
            {customFilters.map((filter) => (
              <div
                key={filter.id}
                className={cn(
                  'group relative rounded-lg border p-2.5 cursor-pointer transition-all',
                  activeCustomFilterId === filter.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                    : 'border-transparent hover:border-violet-500/30 hover:bg-muted/50'
                )}
                onClick={() => onApplyCustomFilter?.(filter)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      activeCustomFilterId === filter.id ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'
                    )}>
                      {filter.name}
                    </p>
                    {filter.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {filter.description}
                      </p>
                    )}
                    {filter.matchedApplicantIds && (
                      <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                        {filter.matchedApplicantIds.length} candidates
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomFilter?.(filter.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup
        title="Job Category"
        icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
      >
        {jobCategories.map((category) => (
          <label
            key={category}
            className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 text-sm text-sidebar-foreground hover:text-foreground transition-colors"
          >
            <Checkbox
              checked={filters.categories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span>{category}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup
        title="Experience Level"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      >
        {experienceLevels.map((level) => (
          <label
            key={level}
            className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 text-sm text-sidebar-foreground hover:text-foreground transition-colors"
          >
            <Checkbox
              checked={filters.experienceLevels.includes(level)}
              onCheckedChange={() => toggleExperience(level)}
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span>{level}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup
        title="Employment Type"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      >
        {employmentTypes.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 text-sm text-sidebar-foreground hover:text-foreground transition-colors"
          >
            <Checkbox
              checked={filters.employmentTypes.includes(type)}
              onCheckedChange={() => toggleEmployment(type)}
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span>{type}</span>
          </label>
        ))}
      </FilterGroup>

      {dataSource === 'work-with-us' && (
        <FilterGroup
          title="Job ID"
          icon={<Hash className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="pr-2">
            <Input
              type="text"
              placeholder="Search by Job ID..."
              value={filters.jobId || ''}
              onChange={(e) => handleJobIdChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </FilterGroup>
      )}
    </aside>
  );
}
