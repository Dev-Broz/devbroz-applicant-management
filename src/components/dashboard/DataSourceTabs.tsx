import { Users, Briefcase, Kanban } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type ViewTab = 'talent-pool' | 'work-with-us' | 'kanban-projects';

interface DataSourceTabsProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  kanbanProjectCount: number;
}

export function DataSourceTabs({ activeTab, onTabChange, kanbanProjectCount }: DataSourceTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ViewTab)} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-10 sm:h-12">
        <TabsTrigger
          value="talent-pool"
          className={cn(
            'flex items-center gap-1 sm:gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm',
            'text-xs sm:text-sm font-medium'
          )}
        >
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Talent Pool</span>
          <span className="xs:hidden">Talent</span>
        </TabsTrigger>
        <TabsTrigger
          value="work-with-us"
          className={cn(
            'flex items-center gap-1 sm:gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm',
            'text-xs sm:text-sm font-medium'
          )}
        >
          <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Work With Us</span>
          <span className="xs:hidden">Work</span>
        </TabsTrigger>
        <TabsTrigger
          value="kanban-projects"
          className={cn(
            'flex items-center gap-1 sm:gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm',
            'text-xs sm:text-sm font-medium'
          )}
        >
          <Kanban className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Hiring Pipelines</span>
          <span className="xs:hidden">Pipelines</span>
          {kanbanProjectCount > 0 && (
            <span className="ml-0.5 sm:ml-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {kanbanProjectCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
