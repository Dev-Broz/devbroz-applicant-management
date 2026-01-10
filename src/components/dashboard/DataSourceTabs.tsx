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
      <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-12">
        <TabsTrigger
          value="talent-pool"
          className={cn(
            'flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm',
            'text-sm font-medium'
          )}
        >
          <Users className="h-4 w-4" />
          Talent Pool
        </TabsTrigger>
        <TabsTrigger
          value="work-with-us"
          className={cn(
            'flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm',
            'text-sm font-medium'
          )}
        >
          <Briefcase className="h-4 w-4" />
          Work With Us
        </TabsTrigger>
        <TabsTrigger
          value="kanban-projects"
          className={cn(
            'flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm',
            'text-sm font-medium'
          )}
        >
          <Kanban className="h-4 w-4" />
          Kanban Projects
          {kanbanProjectCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {kanbanProjectCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
