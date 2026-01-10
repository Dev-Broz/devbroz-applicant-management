import { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterSidebar } from '@/components/dashboard/FilterSidebar';
import { ApplicantTable } from '@/components/dashboard/ApplicantTable';
import { DataSourceTabs, ViewTab } from '@/components/dashboard/DataSourceTabs';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { KanbanProjectsList } from '@/components/dashboard/KanbanProjectsList';
import { KanbanProjectView } from '@/components/dashboard/KanbanProjectView';
import { FilterState, Applicant } from '@/types/applicant';
import { useKanbanProjects } from '@/hooks/useKanbanProjects';
import { useTalentPoolApplicants, useWorkWithUsApplicants, useUpdateApplicantStatus } from '@/hooks/useApplicants';
import { seedDatabase } from '@/utils/seedDatabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('talent-pool');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [talentPoolSelected, setTalentPoolSelected] = useState<Set<string>>(new Set());
  const [workWithUsSelected, setWorkWithUsSelected] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogSource, setCreateDialogSource] = useState<'talent-pool' | 'work-with-us'>('talent-pool');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    experienceLevels: [],
    employmentTypes: [],
    searchQuery: '',
  });

  // Fetch data from database
  const { data: talentPool = [], isLoading: talentPoolLoading } = useTalentPoolApplicants();
  const { data: workWithUs = [], isLoading: workWithUsLoading } = useWorkWithUsApplicants();
  const updateStatus = useUpdateApplicantStatus();

  const { projects, createProject, deleteProject, getProject } = useKanbanProjects();

  // Seed database on first load if empty
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const allApplicants = useMemo(() => [...talentPool, ...workWithUs], [talentPool, workWithUs]);

  const filterApplicants = (applicants: Applicant[]) => {
    return applicants.filter((applicant) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          applicant.name.toLowerCase().includes(query) ||
          applicant.email.toLowerCase().includes(query) ||
          applicant.location.toLowerCase().includes(query) ||
          applicant.skills.some((skill) => skill.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(applicant.category)) return false;
      }
      if (filters.experienceLevels.length > 0) {
        if (!filters.experienceLevels.includes(applicant.experience)) return false;
      }
      if (filters.employmentTypes.length > 0) {
        if (!filters.employmentTypes.includes(applicant.employmentType)) return false;
      }
      return true;
    });
  };

  const filteredTalentPool = useMemo(() => filterApplicants(talentPool), [talentPool, filters]);
  const filteredWorkWithUs = useMemo(() => filterApplicants(workWithUs), [workWithUs, filters]);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleCreateKanbanProject = (source: 'talent-pool' | 'work-with-us') => {
    setCreateDialogSource(source);
    setCreateDialogOpen(true);
  };

  const handleConfirmCreateProject = (projectName: string) => {
    const selectedIds = createDialogSource === 'talent-pool' ? talentPoolSelected : workWithUsSelected;
    createProject(projectName, Array.from(selectedIds));
    toast.success(`Created project "${projectName}" with ${selectedIds.size} candidates`);
    
    // Clear selection
    if (createDialogSource === 'talent-pool') {
      setTalentPoolSelected(new Set());
    } else {
      setWorkWithUsSelected(new Set());
    }
    
    // Navigate to kanban projects tab
    setActiveTab('kanban-projects');
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackFromProject = () => {
    setSelectedProjectId(null);
  };

  const handleApplicantsChange = (updatedApplicants: Applicant[]) => {
    // Update status in database for changed applicants
    updatedApplicants.forEach((applicant) => {
      const original = allApplicants.find((a) => a.id === applicant.id);
      if (original && original.status !== applicant.status) {
        updateStatus.mutate({
          id: applicant.id,
          status: applicant.status,
          source: applicant.source,
        });
      }
    });
  };

  const currentProject = selectedProjectId ? getProject(selectedProjectId) : null;

  const isLoading = talentPoolLoading || workWithUsLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    // If viewing a specific kanban project
    if (currentProject) {
      return (
        <KanbanProjectView
          project={currentProject}
          applicants={allApplicants}
          onBack={handleBackFromProject}
          onApplicantsChange={handleApplicantsChange}
        />
      );
    }

    // Otherwise show the appropriate tab content
    switch (activeTab) {
      case 'talent-pool':
        return (
          <ApplicantTable
            applicants={filteredTalentPool}
            dataSource="talent-pool"
            selectedIds={talentPoolSelected}
            onSelectionChange={setTalentPoolSelected}
            onCreateKanbanProject={() => handleCreateKanbanProject('talent-pool')}
          />
        );
      case 'work-with-us':
        return (
          <ApplicantTable
            applicants={filteredWorkWithUs}
            dataSource="work-with-us"
            selectedIds={workWithUsSelected}
            onSelectionChange={setWorkWithUsSelected}
            onCreateKanbanProject={() => handleCreateKanbanProject('work-with-us')}
          />
        );
      case 'kanban-projects':
        return (
          <KanbanProjectsList
            projects={projects}
            onSelectProject={handleSelectProject}
            onDeleteProject={deleteProject}
          />
        );
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />

        <main className={cn("flex-1 p-6", currentProject ? "overflow-visible" : "overflow-auto")}>
          {!currentProject && (
            <div className="mb-6">
              <DataSourceTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                kanbanProjectCount={projects.length}
              />
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        selectedCount={
          createDialogSource === 'talent-pool'
            ? talentPoolSelected.size
            : workWithUsSelected.size
        }
        onConfirm={handleConfirmCreateProject}
      />
    </div>
  );
};

export default Index;
