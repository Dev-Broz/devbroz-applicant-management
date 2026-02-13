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
import { applicationsApi } from '@/services/api';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('talent-pool');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [talentPool, setTalentPool] = useState<Applicant[]>([]);
  const [workWithUs, setWorkWithUs] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
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

  const { projects, createProject, deleteProject, getProject } = useKanbanProjects();

  // Fetch data from Firebase via backend API
  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        const response = await applicationsApi.getAll({ limit: 200 });
        
        console.log('API Response:', response);
        
        if (response.success && response.data.length > 0) {
          const allApplicants = response.data;
          console.log('All applicants:', allApplicants.length);
          
          // Filter by job ID:
          // Tab 1 (Talent Pool): J-001, J-002 (Apply Unsolicited/Talent Pool)
          // Tab 2 (Work With Us): All other job IDs (Job Listings)
          const TALENT_POOL_JOB_IDS = ['J-001', 'J-002'];
          
          const talentPoolApplicants = allApplicants.filter(app => 
            TALENT_POOL_JOB_IDS.includes(app.jobId)
          );
          
          const workWithUsApplicants = allApplicants.filter(app => 
            !TALENT_POOL_JOB_IDS.includes(app.jobId)
          );
          
          setTalentPool(talentPoolApplicants);
          setWorkWithUs(workWithUsApplicants);
          
          console.log(`Talent Pool (J-001, J-002): ${talentPoolApplicants.length} applicants`);
          console.log(`Work With Us (other job IDs): ${workWithUsApplicants.length} applicants`);
          
          toast.success(`Loaded ${allApplicants.length} applicants from Firebase`);
        } else {
          console.log('No applications found in Firebase');
          toast.info('No applications found in database');
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        toast.error('Failed to load applications from Firebase');
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Combine both tabs for Kanban view (all applicants)
  const allApplicants = useMemo(() => [...talentPool, ...workWithUs], [talentPool, workWithUs]);

  const filterApplicants = (applicants: Applicant[]) => {
    return applicants.filter((applicant) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        
        // Ensure skills is an array
        const skills = Array.isArray(applicant.skills) 
          ? applicant.skills 
          : (typeof applicant.skills === 'string' ? [applicant.skills] : []);
        
        const matchesSearch =
          applicant.name.toLowerCase().includes(query) ||
          applicant.email.toLowerCase().includes(query) ||
          applicant.location.toLowerCase().includes(query) ||
          skills.some((skill) => skill.toLowerCase().includes(query));
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
    // Update both data sources based on the applicant's source field
    const updatedTalentPool = talentPool.map((tp) => {
      const updated = updatedApplicants.find((a) => a.id === tp.id);
      return updated || tp;
    });
    const updatedWorkWithUs = workWithUs.map((wwu) => {
      const updated = updatedApplicants.find((a) => a.id === wwu.id);
      return updated || wwu;
    });
    setTalentPool(updatedTalentPool);
    setWorkWithUs(updatedWorkWithUs);
  };

  const currentProject = selectedProjectId ? getProject(selectedProjectId) : null;

  const renderContent = () => {
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

        <main className="flex-1 overflow-auto p-6">
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
