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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {applicants.length} applicants
        </p>
        <Button
          onClick={onCreateKanbanProject}
          variant="outline"
          disabled={selectedIds.size === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Kanban Project ({selectedIds.size})
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === applicants.length && applicants.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="font-semibold">Applicant</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              {showJobColumns && (
                <>
                  <TableHead className="font-semibold">Job ID</TableHead>
                  <TableHead className="font-semibold">Job Description</TableHead>
                </>
              )}
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Experience</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Applied</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
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
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground',
                        applicant.avatarColor
                      )}
                    >
                      {applicant.initials}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{applicant.name}</p>
                      <p className="text-xs text-muted-foreground">{applicant.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm">{applicant.email}</p>
                    <p className="text-xs text-muted-foreground">{applicant.phone}</p>
                  </div>
                </TableCell>
                {showJobColumns && (
                  <>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs bg-muted border-0">
                        {applicant.jobId || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[200px] truncate block">
                        {applicant.jobDescription || '-'}
                      </span>
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <Badge variant="outline" className="font-normal bg-secondary border-0">
                    {applicant.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{applicant.experience}</span>
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
                    className={cn('text-xs font-medium', statusStyles[applicant.status])}
                  >
                    {applicant.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{applicant.appliedDate}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewApplicant(applicant)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ApplicantDetailModal
        applicant={selectedApplicant}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
