import { useState } from 'react';
import { Filter, Briefcase, Clock, Users, ChevronDown, ChevronRight, ChevronLeft, FileText, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { FilterState, JobCategory, ExperienceLevel, EmploymentType } from '@/types/applicant';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableJobs: { id: string; title: string }[];
}

const jobCategories: JobCategory[] = ['Energy Consultant', 'Renewable Energy', 'Business Consultant'];
const experienceLevels: ExperienceLevel[] = ['0-5 Years', '5-10 Years', '10-15 Years', '15+ Years'];
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

export function FilterSidebar({ filters, onFiltersChange, availableJobs }: FilterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const toggleJobId = (jobId: string) => {
    const newJobIds = filters.jobIds.includes(jobId)
      ? filters.jobIds.filter((id) => id !== jobId)
      : [...filters.jobIds, jobId];
    onFiltersChange({ ...filters, jobIds: newJobIds });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      experienceLevels: [],
      employmentTypes: [],
      jobIds: [],
      searchQuery: filters.searchQuery,
    });
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.experienceLevels.length + 
    filters.employmentTypes.length + 
    filters.jobIds.length;

  // Filter content component (reusable for both mobile and desktop)
  const FilterContent = () => (
    <>
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

      {availableJobs.length > 0 && (
        <FilterGroup
          title="Job ID / Title"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        >
          {availableJobs.map((job) => (
            <label
              key={job.id}
              className="flex cursor-pointer items-start gap-2 rounded-md py-1.5 text-sm text-sidebar-foreground hover:text-foreground transition-colors"
            >
              <Checkbox
                checked={filters.jobIds.includes(job.id)}
                onCheckedChange={() => toggleJobId(job.id)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-mono text-xs text-foreground">{job.id}</span>
                {job.title && (
                  <span className="text-xs text-muted-foreground truncate">{job.title}</span>
                )}
              </div>
            </label>
          ))}
        </FilterGroup>
      )}
    </>
  );

  // Desktop collapsed sidebar
  if (isCollapsed) {
    return (
      <>
        {/* Mobile floating filter button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 z-50 md:hidden rounded-full shadow-xl hover:shadow-2xl h-14 w-14 p-0 transition-all duration-300 hover:scale-110"
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
            <SheetHeader className="mb-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-primary" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount} active
                    </Badge>
                  )}
                </SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                    Clear All
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(85vh-100px)] pb-4">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop collapsed state */}
        <aside className="hidden md:flex w-12 shrink-0 border-r border-sidebar-border bg-sidebar items-start justify-center pt-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 relative"
          >
            <ChevronRight className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
            )}
          </Button>
        </aside>
      </>
    );
  }

  // Desktop expanded sidebar
  return (
    <>
        {/* Mobile floating filter button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 z-50 md:hidden rounded-full shadow-xl hover:shadow-2xl h-14 w-14 p-0 transition-all duration-300 hover:scale-110"
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
            <SheetHeader className="mb-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-primary" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount} active
                    </Badge>
                  )}
                </SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                    Clear All
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(85vh-100px)] pb-4">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base text-sidebar-foreground">Filters</span>
          </div>
          <div className="flex items-center gap-1">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs">
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <FilterContent />
      </aside>
    </>
  );
}
