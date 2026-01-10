import { Mail, Phone, MapPin, Briefcase, GraduationCap, Linkedin, Globe, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { Applicant } from '@/types/applicant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApplicantDetailModalProps {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicantDetailModal({ applicant, open, onOpenChange }: ApplicantDetailModalProps) {
  if (!applicant) return null;

  const handleViewResume = () => {
    toast.info(`Opening resume for ${applicant.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-primary-foreground',
                applicant.avatarColor
              )}
            >
              {applicant.initials}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {applicant.name}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">{applicant.category}</p>
              <div className="flex flex-wrap gap-2 mt-3">
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
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium border-0',
                    applicant.status === 'Shortlisted' ? 'bg-success/10 text-success' :
                    applicant.status === 'Reviewed' ? 'bg-warning/10 text-warning' :
                    applicant.status === 'Archived' ? 'bg-muted text-muted-foreground' :
                    'bg-info/10 text-info'
                  )}
                >
                  {applicant.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewResume}>
              <FileText className="mr-1.5 h-4 w-4" />
              View Resume
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied: {applicant.appliedDate}</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Professional Details */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Professional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {applicant.currentCompany && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{applicant.currentCompany}</span>
                  </div>
                )}
                {applicant.education && (
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{applicant.education}</span>
                  </div>
                )}
                {applicant.linkedIn && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a href={applicant.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {applicant.portfolio && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={applicant.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Portfolio
                    </a>
                  </div>
                )}
                {applicant.expectedSalary && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Expected: {applicant.expectedSalary}</span>
                  </div>
                )}
                {applicant.noticePeriod && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Notice: {applicant.noticePeriod}</span>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Skills */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs font-normal bg-muted text-muted-foreground border-0"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {applicant.summary && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Professional Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{applicant.summary}</p>
                </section>
              </>
            )}

            {/* Work With Us Specific Fields */}
            {applicant.source === 'work-with-us' && applicant.jobId && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Applied Position</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs bg-muted border-0">
                        {applicant.jobId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{applicant.jobDescription}</p>
                  </div>
                </section>
              </>
            )}

            <Separator />

            {/* Application Form Responses */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4">Application Form Responses</h3>
              <div className="space-y-4">
                {applicant.applicationResponses.map((response, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-2">{response.question}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{response.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
