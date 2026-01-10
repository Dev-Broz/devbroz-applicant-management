import { useState } from 'react';
import { GripVertical, Mail, MapPin, FileText, Upload, Eye } from 'lucide-react';
import { Applicant } from '@/types/applicant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ApplicantDetailModal } from './ApplicantDetailModal';

interface ApplicantCardProps {
  applicant: Applicant;
  isDragging?: boolean;
}

export function ApplicantCard({ applicant, isDragging }: ApplicantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewResume = () => {
    toast.info(`Opening resume for ${applicant.name}`);
  };

  const handleUploadToDrive = () => {
    toast.success(`Uploaded ${applicant.name}'s file to Google Drive`);
  };

  return (
    <>
    <div
      className={cn(
        'group rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200',
        isDragging ? 'shadow-card-hover ring-2 ring-primary/20' : 'hover:shadow-card-hover'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground',
              applicant.avatarColor
            )}
          >
            {applicant.initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">{applicant.name}</h3>
          <p className="text-sm text-muted-foreground">{applicant.category}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
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
            <Badge variant="outline" className="text-xs font-medium bg-secondary text-secondary-foreground border-0">
              {applicant.experience}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{applicant.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{applicant.location}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {applicant.skills.slice(0, 3).map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="text-xs font-normal bg-muted text-muted-foreground border-0"
          >
            {skill}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={() => setIsModalOpen(true)}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
          onClick={handleUploadToDrive}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          To Drive
        </Button>
      </div>

      <ApplicantDetailModal
        applicant={applicant}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
    </>
  );
}
