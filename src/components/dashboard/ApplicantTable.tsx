import { useState } from 'react';
import { FileText, Plus, Eye } from 'lucide-react';
import { Applicant, DataSource } from '@/types/applicant';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ApplicantDetailModal } from './ApplicantDetailModal';

interface ApplicantTableProps {
  applicants: Applicant[];
  dataSource: DataSource;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onCreateKanbanProject: () => void;
}

const statusStyles: Record<string, string> = {
  'New Applicants': 'bg-info/10 text-info border-info/20',
  'Reviewed': 'bg-warning/10 text-warning border-warning/20',
  'Shortlisted': 'bg-success/10 text-success border-success/20',
  'Archived': 'bg-muted text-muted-foreground border-muted',
};

export function ApplicantTable({
  applicants,
  dataSource,
  selectedIds,
  onSelectionChange,
  onCreateKanbanProject,
}: ApplicantTableProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applicants.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(applicants.map((a) => a.id)));
    }
  };

  const handleBulkUpload = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one applicant');
      return;
    }
    toast.success(`Uploading ${selectedIds.size} files to Google Drive`);
    onSelectionChange(new Set());
  };

  const handleViewApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const showJobColumns = dataSource === 'work-with-us';

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
        </p>
        <Button
          onClick={onCreateKanbanProject}
          variant="outline"
          disabled={selectedIds.size === 0}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Create Kanban Project ({selectedIds.size})</span>
          <span className="xs:hidden">Create Project ({selectedIds.size})</span>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-10 sm:w-12">
                <Checkbox
                  checked={selectedIds.size === applicants.length && applicants.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[180px]">Applicant</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[200px]">Contact</TableHead>
              {showJobColumns && (
                <>
                  <TableHead className="font-semibold text-xs sm:text-sm min-w-[200px]">Job ID & Title</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm min-w-[200px]">Job Description</TableHead>
                </>
              )}
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[150px]">Category</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[120px]">Experience</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[100px]">Type</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[120px]">Status</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm min-w-[100px]">Applied</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.map((applicant) => (
              <TableRow
                key={applicant.id}
                className={cn(
                  'transition-colors',
                  selectedIds.has(applicant.id) && 'bg-accent/30'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(applicant.id)}
                    onCheckedChange={() => toggleSelect(applicant.id)}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-semibold text-primary-foreground shrink-0',
                        applicant.avatarColor
                      )}
                    >
                      {applicant.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base text-foreground truncate">{applicant.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{applicant.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm truncate">{applicant.email}</p>
                    <p className="text-xs text-muted-foreground">{applicant.phone}</p>
                  </div>
                </TableCell>
                {showJobColumns && (
                  <>
                    <TableCell>
                      <div className="space-y-0.5 min-w-0">
                        <Badge variant="outline" className="font-mono text-[10px] sm:text-xs bg-muted border-0">
                          {applicant.jobId || '-'}
                        </Badge>
                        {applicant.jobTitle && (
                          <p className="text-xs sm:text-sm text-foreground font-medium truncate">
                            {applicant.jobTitle}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs sm:text-sm max-w-[200px] truncate block">
                        {applicant.jobDescription || '-'}
                      </span>
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <Badge variant="outline" className="font-normal text-xs bg-secondary border-0">
                    {applicant.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs sm:text-sm">{applicant.experience}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-medium border-0',
                      applicant.employmentType === 'Full-time'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-warning/10 text-warning'
                    )}
                  >
                    {applicant.employmentType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] sm:text-xs font-medium', statusStyles[applicant.status])}
                  >
                    {applicant.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{applicant.appliedDate}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewApplicant(applicant)}
                    className="text-muted-foreground hover:text-foreground h-7 sm:h-8 text-xs"
                  >
                    <Eye className="mr-0 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <ApplicantDetailModal
        applicant={selectedApplicant}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
