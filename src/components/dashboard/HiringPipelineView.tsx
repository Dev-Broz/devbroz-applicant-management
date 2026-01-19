import { ArrowLeft, Download } from 'lucide-react';
import { HiringPipeline, Applicant } from '@/types/applicant';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from './KanbanBoard';
import { toast } from 'sonner';
import { exportApplicantsToCSV } from '@/utils/exportApplicants';

interface HiringPipelineViewProps {
  pipeline: HiringPipeline;
  applicants: Applicant[];
  onBack: () => void;
  onApplicantsChange: (applicants: Applicant[]) => void;
}

export function HiringPipelineView({
  pipeline,
  applicants,
  onBack,
  onApplicantsChange,
}: HiringPipelineViewProps) {
  const pipelineApplicants = applicants.filter((a) =>
    pipeline.applicantIds.includes(a.id)
  );


  const handleDownload = () => {
    const filename = `${pipeline.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}`;
    exportApplicantsToCSV(pipelineApplicants, filename);
    toast.success(`Downloaded ${pipelineApplicants.length} candidates`);
  };

  // Handle changes from the kanban board and merge with full applicant list
  const handleKanbanChange = (updatedPipelineApplicants: Applicant[]) => {
    // Create a map of updated applicants for quick lookup
    const updatedMap = new Map(updatedPipelineApplicants.map(a => [a.id, a]));
    
    // Merge updates with the full applicant list
    const mergedApplicants = applicants.map(applicant => {
      const updated = updatedMap.get(applicant.id);
      return updated || applicant;
    });
    
    onApplicantsChange(mergedApplicants);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pipelines
          </Button>
          <div className="h-6 w-px bg-border" />
          <h2 className="text-xl font-semibold text-foreground">{pipeline.name}</h2>
          <span className="text-sm text-muted-foreground">
            ({pipelineApplicants.length} candidates)
          </span>
        </div>
        <Button
          onClick={handleDownload}
          className="bg-primary hover:bg-primary/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
      <KanbanBoard
        applicants={pipelineApplicants}
        onApplicantsChange={handleKanbanChange}
      />
    </div>
  );
}
