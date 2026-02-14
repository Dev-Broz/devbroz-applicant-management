import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Applicant, ApplicantStatus } from '@/types/applicant';
import { KanbanColumn } from './KanbanColumn';
import { projectsApi } from '@/services/api';
import { toast } from 'sonner';

interface KanbanBoardProps {
  applicants: Applicant[];
  onApplicantsChange: (applicants: Applicant[]) => void;
}

const statuses: ApplicantStatus[] = ['New Applicants', 'Reviewed', 'Shortlisted', 'Archived'];

export function KanbanBoard({ applicants, onApplicantsChange }: KanbanBoardProps) {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ApplicantStatus;
    
    // Optimistically update UI
    const updatedApplicants = applicants.map((applicant) => {
      if (applicant.id === draggableId) {
        return {
          ...applicant,
          status: newStatus,
        };
      }
      return applicant;
    });

    onApplicantsChange(updatedApplicants);
    
    // Sync status to Firebase
    try {
      await projectsApi.updateApplicantStatus(draggableId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status in Firebase:', error);
      toast.error('Failed to sync status to database');
      // Revert on error
      onApplicantsChange(applicants);
    }
  };

  const getApplicantsByStatus = (status: ApplicantStatus) => {
    return applicants.filter((a) => a.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applicants={getApplicantsByStatus(status)}
            color=""
          />
        ))}
      </div>
    </DragDropContext>
  );
}
