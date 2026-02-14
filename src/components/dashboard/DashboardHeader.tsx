import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-border bg-card px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm sm:text-base">
          R
        </div>
        <span className="text-base sm:text-lg font-semibold text-foreground hidden xs:inline">RecruitHub</span>
      </div>

      <div className="flex-1 max-w-md mx-2 sm:mx-4 md:mx-8">
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 sm:pl-10 bg-background border-border text-sm h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="ml-1 sm:ml-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-xs sm:text-sm font-semibold text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  );
}
