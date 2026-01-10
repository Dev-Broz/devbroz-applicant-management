import { useState } from 'react';
import { Filter, Briefcase, Clock, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterState, JobCategory, ExperienceLevel, EmploymentType } from '@/types/applicant';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
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
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="mt-1 space-y-1 pl-8">{children}</div>
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
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

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4">
      <div className="flex items-center gap-2 mb-6 px-2">
        <Filter className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sidebar-foreground">Filters</span>
      </div>

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
    </aside>
  );
}
