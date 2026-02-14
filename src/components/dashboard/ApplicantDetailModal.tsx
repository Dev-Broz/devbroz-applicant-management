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
    // Open the sample resume PDF in a new tab
    window.open('/Sample Resume.pdf', '_blank');
  };

  // Clean phone number - remove leading quotes and extra characters
  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/^['"`]+/, '').trim();
  };

  // Format answer to remove array brackets and quotes
  const formatAnswer = (answer: string): string => {
    if (!answer) return '';
    
    // Check if the answer looks like a JSON array (starts with [ and ends with ])
    const trimmed = answer.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          // Join array items with comma and space
          return parsed.join(', ');
        }
      } catch (e) {
        // If parsing fails, just remove the brackets manually
        return trimmed.slice(1, -1).replace(/"/g, '').replace(/,/g, ', ');
      }
    }
    
    return answer;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] w-[calc(100vw-2rem)] sm:w-full p-0 gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border pr-12">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-lg sm:text-xl font-bold text-primary-foreground shrink-0',
                applicant.avatarColor
              )}
            >
              {applicant.initials}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground pr-4">
                {applicant.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{applicant.category}</p>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
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
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={handleViewResume} className="w-full sm:w-auto">
                  <FileText className="mr-1.5 h-4 w-4" />
                  <span className="hidden xs:inline">View Resume</span>
                  <span className="xs:hidden">Resume</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="break-all">{applicant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{cleanPhoneNumber(applicant.phone)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{applicant.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="whitespace-nowrap">Applied: {applicant.appliedDate}</span>
                </div>
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
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs bg-muted border-0">
                        {applicant.jobId}
                      </Badge>
                    </div>
                    {applicant.jobTitle && (
                      <p className="text-base font-semibold text-foreground mb-2">{applicant.jobTitle}</p>
                    )}
                    <p className="text-sm text-muted-foreground break-words">{applicant.jobDescription}</p>
                  </div>
                </section>
              </>
            )}

            <Separator />

            {/* Application Form Responses */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">Application Form Responses</h3>
              <div className="space-y-3 sm:space-y-4">
                {applicant.applicationResponses.map((response, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-3 sm:p-4">
                    <p className="text-sm font-medium text-foreground mb-1.5 sm:mb-2">{response.question}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">{formatAnswer(response.answer)}</p>
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
