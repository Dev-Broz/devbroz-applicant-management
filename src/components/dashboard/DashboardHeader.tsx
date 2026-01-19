import { useState, useEffect } from 'react';
import { Search, Bell, Settings, Sparkles, MessageCircle, Database, Brain, Loader2, FileSearch, Users, Check } from 'lucide-react';
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
  onSearchSubmit?: () => void;
  isSemanticSearch?: boolean;
  isSearching?: boolean;
  onChatOpen?: () => void;
}

const searchSteps = [
  { icon: Database, text: "Scanning database..." },
  { icon: FileSearch, text: "Parsing query..." },
  { icon: Users, text: "Matching profiles..." },
  { icon: Brain, text: "Ranking results..." },
];

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isSemanticSearch = false,
  isSearching = false,
  onChatOpen,
}: DashboardHeaderProps) {
  const [searchStep, setSearchStep] = useState(0);

  // Animate through search steps
  useEffect(() => {
    if (!isSearching) {
      setSearchStep(0);
      return;
    }
    
    if (searchStep < searchSteps.length - 1) {
      const timer = setTimeout(() => {
        setSearchStep(prev => prev + 1);
      }, 1400); // ~1.4s per step for 6s total
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchStep]);
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
            placeholder="Search applicants or try 'solar project engineer'... (press Enter)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSearchSubmit) {
                onSearchSubmit();
              }
            }}
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
        
        {/* Semantic Search Progress Panel */}
        {isSemanticSearch && isSearching && (
          <div className="absolute left-0 right-0 mt-1 mx-auto max-w-md px-8 z-20">
            <div className="rounded-lg border border-violet-500/30 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">AI Semantic Search</span>
                <span className="text-xs text-muted-foreground">
                  {searchStep + 1}/{searchSteps.length}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((searchStep + 1) / searchSteps.length) * 100}%` }}
                />
              </div>
              
              {/* Step indicators */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {searchSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === searchStep;
                  const isComplete = index < searchStep;
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center gap-1.5 transition-all duration-300",
                        isActive ? "text-violet-500" : isComplete ? "text-muted-foreground" : "text-muted-foreground/40"
                      )}
                    >
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center",
                        isActive && "animate-pulse"
                      )}>
                        {isActive ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isComplete ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <StepIcon className="h-3 w-3" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs transition-all duration-200",
                        isActive && "font-medium"
                      )}>
                        {step.text}
                      </span>
                    </div>
                  );
                })}
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
