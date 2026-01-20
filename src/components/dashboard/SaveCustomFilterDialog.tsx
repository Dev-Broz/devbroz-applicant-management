import { useState } from 'react';
import { Save, Sparkles, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CustomFilter, AIFilterCriteria } from '@/types/applicant';

interface SaveCustomFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalQuery: string;
  filterCriteria: AIFilterCriteria;
  matchedCount: number;
  matchedApplicantIds: string[];
  onSave: (filter: Omit<CustomFilter, 'id' | 'createdAt'>) => void;
}

export function SaveCustomFilterDialog({
  open,
  onOpenChange,
  originalQuery,
  filterCriteria,
  matchedCount,
  matchedApplicantIds,
  onSave,
}: SaveCustomFilterDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      filterCriteria,
      originalQuery,
      matchedApplicantIds,
    });
    
    // Reset form
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Save Custom Filter
          </DialogTitle>
          <DialogDescription>
            Save this AI-generated filter for quick access in the future.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original Query Preview */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">AI Query</p>
            <p className="text-sm text-foreground italic">"{originalQuery}"</p>
          </div>

          {/* Match count badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {matchedCount} candidates match
            </Badge>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filter Name *</Label>
            <Input
              id="filter-name"
              placeholder="e.g., Solar Experts 8+ Years"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <Label htmlFor="filter-description">Description (optional)</Label>
            <Textarea
              id="filter-description"
              placeholder="Add notes to help you remember what this filter is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim()}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
