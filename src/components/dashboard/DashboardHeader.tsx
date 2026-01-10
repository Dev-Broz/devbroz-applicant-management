import { Search, LayoutGrid, Table2, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'board' | 'table';
  onViewModeChange: (mode: 'board' | 'table') => void;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          R
        </div>
        <span className="text-lg font-semibold text-foreground">RecruitHub</span>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border bg-muted p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('board')}
            className={cn(
              'h-8 px-3',
              viewMode === 'board' ? 'bg-card shadow-sm' : 'hover:bg-transparent'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('table')}
            className={cn(
              'h-8 px-3',
              viewMode === 'table' ? 'bg-card shadow-sm' : 'hover:bg-transparent'
            )}
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  );
}
