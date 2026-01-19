import { Search, Bell, Settings, Sparkles, MessageCircle, Database, Brain, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSemanticSearch?: boolean;
  isSearching?: boolean;
  onChatOpen?: () => void;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  isSemanticSearch = false,
  isSearching = false,
  onChatOpen,
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
            placeholder="Search applicants or try 'solar project engineer'..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 pr-10 bg-background border-border transition-all duration-300",
              isSemanticSearch && "border-violet-500/50 ring-2 ring-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
            )}
          />
          {/* AI Search Indicator */}
          {isSemanticSearch && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSearching ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                      </div>
                    ) : (
                      <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-card border-border">
                  <div className="flex items-center gap-2 text-xs">
                    <Brain className="h-3 w-3 text-violet-500" />
                    <span>AI Semantic Search Active</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Semantic Search Progress Bar */}
        {isSemanticSearch && isSearching && (
          <div className="absolute left-0 right-0 mt-1 mx-auto max-w-md px-8">
            <div className="flex items-center gap-2 rounded-lg bg-muted/80 backdrop-blur-sm px-3 py-2 text-xs animate-fade-in">
              <div className="flex items-center gap-1.5">
                <Database className="h-3 w-3 text-violet-500 animate-pulse" />
                <span className="text-muted-foreground">Analyzing resumes...</span>
              </div>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-[shimmer_1s_ease-in-out_infinite]" 
                     style={{ width: '60%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground relative"
                onClick={onChatOpen}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                  <Sparkles className="h-2 w-2 text-white" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">AI Chat Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
