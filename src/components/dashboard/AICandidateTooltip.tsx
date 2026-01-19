import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Applicant } from '@/types/applicant';
import { generateCandidateSummary } from '@/utils/aiDemoData';
import { cn } from '@/lib/utils';

interface AICandidateTooltipProps {
  applicant: Applicant;
  children: ReactNode;
}

export function AICandidateTooltip({ applicant, children }: AICandidateTooltipProps) {
  const { summary, strengths, highlights } = generateCandidateSummary(applicant);

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0 overflow-hidden" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        {/* Header with AI indicator */}
        <div className="flex items-center gap-2 border-b border-border bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-2.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-medium text-violet-600">AI Summary</span>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Candidate Header */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground',
                applicant.avatarColor
              )}
            >
              {applicant.initials}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{applicant.name}</h4>
              <p className="text-xs text-muted-foreground">{applicant.category}</p>
            </div>
          </div>

          {/* AI Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>

          {/* Key Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Key Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((strength) => (
                  <Badge
                    key={strength}
                    variant="secondary"
                    className="text-xs font-normal bg-primary/10 text-primary border-0"
                  >
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Highlights</p>
              <ul className="space-y-1">
                {highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Badge variant="outline" className="text-xs font-normal">
              {applicant.employmentType}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {applicant.experience}
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              {applicant.status}
            </Badge>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
