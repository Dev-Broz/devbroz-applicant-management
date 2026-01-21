import { useState, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FilterSidebar } from '@/components/dashboard/FilterSidebar';
import { ApplicantTable } from '@/components/dashboard/ApplicantTable';
import { DataSourceTabs, ViewTab } from '@/components/dashboard/DataSourceTabs';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { HiringPipelinesList } from '@/components/dashboard/HiringPipelinesList';
import { HiringPipelineView } from '@/components/dashboard/HiringPipelineView';
import { AIChatFullView } from '@/components/dashboard/AIChatFullView';
import { AIShortlistDialog } from '@/components/dashboard/AIShortlistDialog';
import { SaveCustomFilterDialog } from '@/components/dashboard/SaveCustomFilterDialog';
import { FilterState, Applicant, AIFilterCriteria, CustomFilter } from '@/types/applicant';
import { useHiringPipelines } from '@/hooks/useHiringPipelines';
import { useTalentPoolApplicants, useWorkWithUsApplicants, useUpdateApplicantStatus } from '@/hooks/useApplicants';
import { useCustomFilters, useSaveCustomFilter, useDeleteCustomFilter } from '@/hooks/useCustomFilters';
import { seedDatabase } from '@/utils/seedDatabase';
import { isSemanticQuery, getSemanticMatches, criteriaToExperienceLevels } from '@/utils/aiDemoData';
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
  const [aiShortlistOpen, setAIShortlistOpen] = useState(false);
  const [aiShortlistSource, setAIShortlistSource] = useState<'talent-pool' | 'work-with-us'>('talent-pool');
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    experienceLevels: [],
    employmentTypes: [],
    searchQuery: '',
  });
  
  // AI Filter state
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [activeCustomFilterId, setActiveCustomFilterId] = useState<string | null>(null);
  
  // Save filter dialog state
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [pendingFilterData, setPendingFilterData] = useState<{
    criteria: AIFilterCriteria;
    query: string;
    matchedIds: string[];
  } | null>(null);

  // Fetch data from database
  const { data: talentPool = [], isLoading: talentPoolLoading } = useTalentPoolApplicants();
  const { data: workWithUs = [], isLoading: workWithUsLoading } = useWorkWithUsApplicants();
  const updateStatus = useUpdateApplicantStatus();
  
  // Custom filters
  const { data: customFilters = [] } = useCustomFilters();
  const saveCustomFilter = useSaveCustomFilter();
  const deleteCustomFilter = useDeleteCustomFilter();

  const { pipelines, createPipeline, deletePipeline, getPipeline } = useHiringPipelines();

  // Seed database on first load if empty
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  // Trigger semantic search animation when user submits
  const handleSearchSubmit = () => {
    const query = filters.searchQuery;
    if (isSemanticQuery(query)) {
      setIsSemanticSearching(true);
      // Simulate AI processing time (6s for demo visibility)
      setTimeout(() => {
        setSubmittedSearchQuery(query);
        setIsSemanticSearching(false);
      }, 6000);
    } else {
      setSubmittedSearchQuery(query);
    }
  };

  // Clear submitted search when input is cleared
  useEffect(() => {
    if (!filters.searchQuery) {
      setSubmittedSearchQuery('');
    }
  }, [filters.searchQuery]);

  const allApplicants = useMemo(() => [...talentPool, ...workWithUs], [talentPool, workWithUs]);

  // Check if current search is semantic (based on submitted query)
  const isSemanticSearchActive = useMemo(() => {
    return submittedSearchQuery.length > 2 && isSemanticQuery(submittedSearchQuery);
  }, [submittedSearchQuery]);

  const filterApplicants = (applicants: Applicant[]) => {
    let filtered = applicants;
    
    // If AI matched IDs are set, filter by those first
    if (aiMatchedIds && aiMatchedIds.length > 0) {
      filtered = applicants.filter(a => aiMatchedIds.includes(a.id));
    } else if (isSemanticSearchActive && !isSemanticSearching) {
      // If semantic search is active, use AI matching
      const semanticMatches = getSemanticMatches(submittedSearchQuery, applicants);
      if (semanticMatches.length > 0) {
        filtered = semanticMatches;
      }
    } else if (submittedSearchQuery && !isSemanticSearching) {
      // Regular text search
      const query = submittedSearchQuery.toLowerCase();
      filtered = applicants.filter((applicant) => {
        return (
          applicant.name.toLowerCase().includes(query) ||
          applicant.email.toLowerCase().includes(query) ||
          applicant.location.toLowerCase().includes(query) ||
          applicant.skills.some((skill) => skill.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply other filters
    return filtered.filter((applicant) => {
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(applicant.category)) return false;
      }
      if (filters.experienceLevels.length > 0) {
        if (!filters.experienceLevels.includes(applicant.experience)) return false;
      }
      if (filters.employmentTypes.length > 0) {
        if (!filters.employmentTypes.includes(applicant.employmentType)) return false;
      }
      // Job ID filter (for Work With Us)
      if (filters.jobId && applicant.source === 'work-with-us') {
        const jobIdLower = filters.jobId.toLowerCase();
        if (!applicant.jobId?.toLowerCase().includes(jobIdLower)) return false;
      }
      return true;
    });
  };

  const filteredTalentPool = useMemo(() => filterApplicants(talentPool), [talentPool, filters, isSemanticSearchActive, submittedSearchQuery, aiMatchedIds]);
  const filteredWorkWithUs = useMemo(() => filterApplicants(workWithUs), [workWithUs, filters, isSemanticSearchActive, submittedSearchQuery, aiMatchedIds]);

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

  const handleAIShortlist = (source: 'talent-pool' | 'work-with-us') => {
    setAIShortlistSource(source);
    setAIShortlistOpen(true);
  };

  const handleAIShortlistCreatePipeline = (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    const pipelineName = `AI Shortlist - ${new Date().toLocaleDateString()}`;
    createPipeline(pipelineName, selectedIds);
    toast.success(`Created pipeline "${pipelineName}" with ${selectedIds.length} AI-matched candidates`);
    setActiveTab('hiring-pipelines');
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

  // AI Chat handlers
  const handleApplyAIFilter = (criteria: AIFilterCriteria, matchedIds: string[]) => {
    // Set the matched IDs for filtering
    setAiMatchedIds(matchedIds);
    
    // Apply criteria to standard filters
    setFilters(prev => ({
      ...prev,
      categories: criteria.categories || [],
      experienceLevels: criteria.experienceLevels || criteriaToExperienceLevels(criteria.minExperienceYears),
      employmentTypes: criteria.employmentTypes || [],
    }));
    
    // Clear any active custom filter
    setActiveCustomFilterId(null);
    
    // Switch to talent pool tab
    setActiveTab('talent-pool');
    
    toast.success(`Showing ${matchedIds.length} candidates matching your AI search`);
  };

  const handleOpenSaveFilterDialog = (filter: Omit<CustomFilter, 'id' | 'createdAt'>, matchedIds: string[]) => {
    setPendingFilterData({
      criteria: filter.filterCriteria,
      query: filter.originalQuery || '',
      matchedIds,
    });
    setSaveFilterDialogOpen(true);
  };

  const handleSaveCustomFilter = (filter: Omit<CustomFilter, 'id' | 'createdAt'>) => {
    saveCustomFilter.mutate(filter, {
      onSuccess: () => {
        toast.success(`Filter "${filter.name}" saved successfully`);
        setSaveFilterDialogOpen(false);
        setPendingFilterData(null);
      },
      onError: () => {
        toast.error('Failed to save filter');
      },
    });
  };

  const handleApplyCustomFilter = (filter: CustomFilter) => {
    // Set matched IDs if available
    if (filter.matchedApplicantIds && filter.matchedApplicantIds.length > 0) {
      setAiMatchedIds(filter.matchedApplicantIds);
    } else {
      setAiMatchedIds(null);
    }
    
    // Apply filter criteria
    setFilters(prev => ({
      ...prev,
      categories: filter.filterCriteria.categories || [],
      experienceLevels: filter.filterCriteria.experienceLevels || criteriaToExperienceLevels(filter.filterCriteria.minExperienceYears),
      employmentTypes: filter.filterCriteria.employmentTypes || [],
    }));
    
    // Set active custom filter
    setActiveCustomFilterId(filter.id);
    
    // Switch to talent pool
    setActiveTab('talent-pool');
    
    toast.success(`Applied filter "${filter.name}"`);
  };

  const handleDeleteCustomFilter = (filterId: string) => {
    deleteCustomFilter.mutate(filterId, {
      onSuccess: () => {
        toast.success('Filter deleted');
        // Clear active filter if it was the deleted one
        if (activeCustomFilterId === filterId) {
          setActiveCustomFilterId(null);
          setAiMatchedIds(null);
        }
      },
      onError: () => {
        toast.error('Failed to delete filter');
      },
    });
  };

  // Clear AI filter when switching tabs or changing filters manually
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Clear AI matched IDs when user manually changes filters
    if (aiMatchedIds) {
      setAiMatchedIds(null);
      setActiveCustomFilterId(null);
    }
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
            onAIShortlist={() => handleAIShortlist('talent-pool')}
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
            onAIShortlist={() => handleAIShortlist('work-with-us')}
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
      case 'ai-assistant':
        return (
          <AIChatFullView 
            applicants={allApplicants} 
            onApplyFilter={handleApplyAIFilter}
            onSaveFilter={handleOpenSaveFilterDialog}
          />
        );
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        isSemanticSearch={isSemanticQuery(filters.searchQuery)}
        isSearching={isSemanticSearching}
        onChatOpen={() => setActiveTab('ai-assistant')}
      />

      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          customFilters={customFilters}
          activeCustomFilterId={activeCustomFilterId}
          onApplyCustomFilter={handleApplyCustomFilter}
          onDeleteCustomFilter={handleDeleteCustomFilter}
          onClearFilters={() => {
            setFilters({
              categories: [],
              experienceLevels: [],
              employmentTypes: [],
              searchQuery: '',
              jobId: undefined,
            });
            setAiMatchedIds(null);
            setActiveCustomFilterId(null);
          }}
          dataSource={activeTab === 'work-with-us' ? 'work-with-us' : 'talent-pool'}
        />

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

      <AIShortlistDialog
        open={aiShortlistOpen}
        onOpenChange={setAIShortlistOpen}
        applicants={aiShortlistSource === 'talent-pool' ? talentPool : workWithUs}
        onCreatePipeline={handleAIShortlistCreatePipeline}
      />

      {pendingFilterData && (
        <SaveCustomFilterDialog
          open={saveFilterDialogOpen}
          onOpenChange={setSaveFilterDialogOpen}
          originalQuery={pendingFilterData.query}
          filterCriteria={pendingFilterData.criteria}
          matchedCount={pendingFilterData.matchedIds.length}
          matchedApplicantIds={pendingFilterData.matchedIds}
          onSave={handleSaveCustomFilter}
        />
      )}
    </div>
  );
};

export default Index;
