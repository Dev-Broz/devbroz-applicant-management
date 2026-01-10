import { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterSidebar } from '@/components/dashboard/FilterSidebar';
import { ApplicantTable } from '@/components/dashboard/ApplicantTable';
import { DataSourceTabs, ViewTab } from '@/components/dashboard/DataSourceTabs';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { HiringPipelinesList } from '@/components/dashboard/HiringPipelinesList';
import { HiringPipelineView } from '@/components/dashboard/HiringPipelineView';
import { FilterState, Applicant } from '@/types/applicant';
import { useHiringPipelines } from '@/hooks/useHiringPipelines';
import { useTalentPoolApplicants, useWorkWithUsApplicants, useUpdateApplicantStatus } from '@/hooks/useApplicants';
import { seedDatabase } from '@/utils/seedDatabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('talent-pool');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
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

  const { pipelines, createPipeline, deletePipeline, getPipeline } = useHiringPipelines();

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

  const handleCreatePipeline = (source: 'talent-pool' | 'work-with-us') => {
    setCreateDialogSource(source);
    setCreateDialogOpen(true);
  };

  const handleConfirmCreatePipeline = (pipelineName: string) => {
    const selectedIds = createDialogSource === 'talent-pool' ? talentPoolSelected : workWithUsSelected;
    createPipeline(pipelineName, Array.from(selectedIds));
    toast.success(`Created pipeline "${pipelineName}" with ${selectedIds.size} candidates`);
    
    // Clear selection
    if (createDialogSource === 'talent-pool') {
      setTalentPoolSelected(new Set());
    } else {
      setWorkWithUsSelected(new Set());
    }
    
    // Navigate to hiring pipelines tab
    setActiveTab('hiring-pipelines');
  };

  const handleSelectPipeline = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
  };

  const handleBackFromPipeline = () => {
    setSelectedPipelineId(null);
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

  const currentPipeline = selectedPipelineId ? getPipeline(selectedPipelineId) : null;

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

    // If viewing a specific hiring pipeline
    if (currentPipeline) {
      return (
        <HiringPipelineView
          pipeline={currentPipeline}
          applicants={allApplicants}
          onBack={handleBackFromPipeline}
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
            onCreatePipeline={() => handleCreatePipeline('talent-pool')}
          />
        );
      case 'work-with-us':
        return (
          <ApplicantTable
            applicants={filteredWorkWithUs}
            dataSource="work-with-us"
            selectedIds={workWithUsSelected}
            onSelectionChange={setWorkWithUsSelected}
            onCreatePipeline={() => handleCreatePipeline('work-with-us')}
          />
        );
      case 'hiring-pipelines':
        return (
          <HiringPipelinesList
            pipelines={pipelines}
            onSelectPipeline={handleSelectPipeline}
            onDeletePipeline={deletePipeline}
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

        <main className={cn("flex-1 p-6", currentPipeline ? "overflow-visible" : "overflow-auto")}>
          {!currentPipeline && (
            <div className="mb-6">
              <DataSourceTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                pipelineCount={pipelines.length}
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
        onConfirm={handleConfirmCreatePipeline}
      />
    </div>
  );
};

export default Index;
