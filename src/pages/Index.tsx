import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterSidebar } from '@/components/dashboard/FilterSidebar';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ApplicantTable } from '@/components/dashboard/ApplicantTable';
import { mockApplicants } from '@/data/applicants';
import { FilterState, Applicant } from '@/types/applicant';

const Index = () => {
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    experienceLevels: [],
    employmentTypes: [],
    searchQuery: '',
  });

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          applicant.name.toLowerCase().includes(query) ||
          applicant.email.toLowerCase().includes(query) ||
          applicant.location.toLowerCase().includes(query) ||
          applicant.skills.some((skill) => skill.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(applicant.category)) return false;
      }

      // Experience filter
      if (filters.experienceLevels.length > 0) {
        if (!filters.experienceLevels.includes(applicant.experience)) return false;
      }

      // Employment type filter
      if (filters.employmentTypes.length > 0) {
        if (!filters.employmentTypes.includes(applicant.employmentType)) return false;
      }

      return true;
    });
  }, [applicants, filters]);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />

        <main className="flex-1 overflow-auto p-6">
          {viewMode === 'board' ? (
            <KanbanBoard
              applicants={filteredApplicants}
              onApplicantsChange={setApplicants}
            />
          ) : (
            <ApplicantTable applicants={filteredApplicants} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
