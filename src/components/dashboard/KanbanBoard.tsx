import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Applicant, ApplicantStatus } from '@/types/applicant';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  applicants: Applicant[];
  onApplicantsChange: (applicants: Applicant[]) => void;
}

const statuses: ApplicantStatus[] = ['New Applicants', 'Reviewed', 'Shortlisted', 'Archived'];

export function KanbanBoard({ applicants, onApplicantsChange }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedApplicants = applicants.map((applicant) => {
      if (applicant.id === draggableId) {
        return {
          ...applicant,
          status: destination.droppableId as ApplicantStatus,
        };
      }
      return applicant;
    });

    onApplicantsChange(updatedApplicants);
  };

  const getApplicantsByStatus = (status: ApplicantStatus) => {
    return applicants.filter((a) => a.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 pb-4">
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
