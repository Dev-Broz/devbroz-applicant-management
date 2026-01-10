import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Applicant, ApplicantStatus } from '@/types/applicant';
import { ApplicantCard } from './ApplicantCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: ApplicantStatus;
  applicants: Applicant[];
  color: string;
}

const statusColors: Record<ApplicantStatus, string> = {
  'New Applicants': 'bg-status-new',
  'Reviewed': 'bg-status-reviewed',
  'Shortlisted': 'bg-status-shortlisted',
  'Archived': 'bg-status-archived',
};

export function KanbanColumn({ status, applicants, color }: KanbanColumnProps) {
  return (
    <div className="flex w-80 shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('h-2.5 w-2.5 rounded-full', statusColors[status])} />
        <h2 className="font-semibold text-foreground">{status}</h2>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {applicants.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 space-y-3 rounded-lg p-2 transition-colors min-h-[200px]',
              snapshot.isDraggingOver ? 'bg-accent/50' : 'bg-transparent'
            )}
          >
            {applicants.map((applicant, index) => (
              <Draggable key={applicant.id} draggableId={applicant.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ApplicantCard applicant={applicant} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {applicants.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
                Drop applicants here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
