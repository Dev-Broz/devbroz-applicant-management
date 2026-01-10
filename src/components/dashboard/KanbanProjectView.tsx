import { ArrowLeft } from 'lucide-react';
import { KanbanProject, Applicant } from '@/types/applicant';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from './KanbanBoard';

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        <div className="h-6 w-px bg-border" />
        <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
        <span className="text-sm text-muted-foreground">
          ({projectApplicants.length} candidates)
        </span>
      </div>
      <KanbanBoard
        applicants={projectApplicants}
        onApplicantsChange={onApplicantsChange}
      />
    </div>
  );
}
