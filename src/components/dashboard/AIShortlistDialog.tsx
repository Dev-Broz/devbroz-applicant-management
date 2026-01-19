import { useState } from 'react';
import { Sparkles, Loader2, Check, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Applicant } from '@/types/applicant';
import { getAIShortlistMatches, ShortlistMatch } from '@/utils/aiDemoData';
import { cn } from '@/lib/utils';

interface AIShortlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicants: Applicant[];
  onCreatePipeline: (selectedIds: string[]) => void;
}

export function AIShortlistDialog({
  open,
  onOpenChange,
  applicants,
  onCreatePipeline,
}: AIShortlistDialogProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState<ShortlistMatch[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    setMatches([]);
    setSelectedIds(new Set());
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const results = getAIShortlistMatches(jobDescription, applicants);
    setMatches(results);
    setSelectedIds(new Set(results.slice(0, 5).map(m => m.applicant.id)));
    setIsAnalyzing(false);
    setHasAnalyzed(true);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCreatePipeline = () => {
    onCreatePipeline(Array.from(selectedIds));
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setJobDescription('');
    setMatches([]);
    setSelectedIds(new Set());
    setHasAnalyzed(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-success';
    if (score >= 30) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI-Assisted Shortlisting
          </DialogTitle>
          <DialogDescription>
            Describe your ideal candidate and let AI find the best matches from your applicant pool.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Job Description / Requirements
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="E.g., Looking for a senior solar project engineer with 5+ years of experience in renewable energy. Must have project management skills and experience with large-scale PV installations..."
              className="min-h-[100px] resize-none"
              disabled={isAnalyzing}
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="w-full bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing candidates...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze & Find Matches
              </>
            )}
          </Button>

          {/* Results */}
          {hasAnalyzed && !isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">
                  {matches.length > 0 
                    ? `Found ${matches.length} matching candidates`
                    : 'No strong matches found'}
                </h4>
                {matches.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>

              {matches.length > 0 && (
                <ScrollArea className="h-64 rounded-lg border border-border">
                  <div className="space-y-2 p-3">
                    {matches.map((match) => (
                      <div
                        key={match.applicant.id}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer',
                          selectedIds.has(match.applicant.id)
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        )}
                        onClick={() => toggleSelect(match.applicant.id)}
                      >
                        <Checkbox
                          checked={selectedIds.has(match.applicant.id)}
                          onCheckedChange={() => toggleSelect(match.applicant.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground',
                                match.applicant.avatarColor
                              )}
                            >
                              {match.applicant.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {match.applicant.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {match.applicant.category} • {match.applicant.experience}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                'shrink-0 font-semibold',
                                getScoreColor(match.score)
                              )}
                            >
                              {match.score}% match
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {match.reasons.map((reason, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                <Check className="mr-1 h-3 w-3" />
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Create Pipeline Button */}
              {matches.length > 0 && (
                <Button
                  onClick={handleCreatePipeline}
                  disabled={selectedIds.size === 0}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Pipeline with {selectedIds.size} Candidates
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
