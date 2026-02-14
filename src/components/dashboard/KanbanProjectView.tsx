import { ArrowLeft, Upload } from 'lucide-react';
import { KanbanProject, Applicant } from '@/types/applicant';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from './KanbanBoard';
import { toast } from 'sonner';

interface KanbanProjectViewProps {
  project: KanbanProject;
  applicants: Applicant[];
  onBack: () => void;
  onApplicantsChange: (applicants: Applicant[]) => void;
}

export function KanbanProjectView({
  project,
  applicants,
  onBack,
  onApplicantsChange,
}: KanbanProjectViewProps) {
  const projectApplicants = applicants.filter((a) =>
    project.applicantIds.includes(a.id)
  );

  const handleUploadToDrive = () => {
    toast.success(`Uploading ${projectApplicants.length} candidates from "${project.name}" to Google Drive`);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 sm:ml-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Back to Projects</span>
            <span className="xs:hidden">Back</span>
          </Button>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">{project.name}</h2>
            <span className="text-sm text-muted-foreground">
              ({projectApplicants.length} candidate{projectApplicants.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        <Button
          onClick={handleUploadToDrive}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          size="sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Upload to Google Drive</span>
          <span className="sm:hidden">Upload to Drive</span>
        </Button>
      </div>
      <KanbanBoard
        applicants={projectApplicants}
        onApplicantsChange={onApplicantsChange}
      />
    </div>
  );
}
