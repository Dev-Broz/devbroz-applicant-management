import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Database, BarChart3, Brain, MessageSquare, Filter, Save, MapPin, Briefcase, Clock, Users, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Applicant, AIFilterCriteria, CustomFilter } from '@/types/applicant';
import { generateChatResponse, parseAIQueryToFilter } from '@/utils/aiDemoData';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  candidates?: Applicant[];
  filterCriteria?: AIFilterCriteria;
  originalQuery?: string;
}

interface AIChatFullViewProps {
  applicants: Applicant[];
  onApplyFilter: (criteria: AIFilterCriteria, matchedIds: string[]) => void;
  onSaveFilter: (filter: Omit<CustomFilter, 'id' | 'createdAt'>, matchedIds: string[]) => void;
}

const suggestedQuestions = [
  {
    question: "List candidates with experience preparing client reports or presentations for energy projects.",
    description: "Find candidates with reporting skills",
    icon: Briefcase,
  },
  {
    question: "How many candidates have interacted directly with clients or stakeholders?",
    description: "Client-facing experience count",
    icon: Users,
  },
  {
    question: "List candidates who have done carbon accounting or emissions analysis.",
    description: "Carbon and sustainability expertise",
    icon: Leaf,
  },
  {
    question: "What's the category breakdown?",
    description: "Analyze applicants by job category",
    icon: BarChart3,
  },
];

const thinkingSteps = [
  { icon: Database, text: "Scanning applicant database..." },
  { icon: BarChart3, text: "Analyzing patterns..." },
  { icon: Brain, text: "Generating insights..." },
];

export function AIChatFullView({ applicants, onApplyFilter, onSaveFilter }: AIChatFullViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Ask me about your applicants, like \"show me top candidates with 8+ years in solar cell design\" and I'll find matching candidates you can filter on the dashboard or save for later."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingCandidates, setPendingCandidates] = useState<Applicant[] | null>(null);
  const [pendingCriteria, setPendingCriteria] = useState<AIFilterCriteria | null>(null);
  const [pendingQuery, setPendingQuery] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, displayedContent, thinkingStep]);

  // Animate through thinking steps
  useEffect(() => {
    if (isTyping && thinkingStep < thinkingSteps.length - 1) {
      const timer = setTimeout(() => {
        setThinkingStep(prev => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isTyping, thinkingStep]);

  // Check if query is asking for candidates
  const isCandidateQuery = (query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    const candidateIndicators = [
      'show', 'find', 'search', 'candidates', 'applicants', 'top', 
      'with', 'experience', 'years', 'solar', 'energy', 'consultant',
      'developer', 'engineer', 'analyst', 'manager', 'senior', 'junior'
    ];
    return candidateIndicators.filter(ind => lowerQuery.includes(ind)).length >= 2;
  };

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setThinkingStep(0);
    setPendingCandidates(null);
    setPendingCriteria(null);
    setPendingQuery('');

    // Simulate AI processing with thinking animation (2.7s total for all steps)
    await new Promise(resolve => setTimeout(resolve, 2700));

    let response: { message: string; data?: Record<string, unknown> };
    let candidates: Applicant[] | undefined;
    let filterCriteria: AIFilterCriteria | undefined;

    // Check if this is a candidate search query
    if (isCandidateQuery(messageText)) {
      const result = parseAIQueryToFilter(messageText, applicants);
      response = { message: result.summary };
      candidates = result.matches;
      filterCriteria = result.filterCriteria;
      setPendingCandidates(result.matches);
      setPendingCriteria(result.filterCriteria);
      setPendingQuery(messageText);
    } else {
      response = generateChatResponse(messageText, applicants);
    }
    
    setIsTyping(false);
    setIsStreaming(true);
    setDisplayedContent('');

    // Stream like ChatGPT
    const fullMessage = response.message;
    let currentIndex = 0;
    let started = false;

    const streamNext = () => {
      if (currentIndex >= fullMessage.length) {
        setIsStreaming(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullMessage,
          candidates,
          filterCriteria,
          originalQuery: candidates ? messageText : undefined
        };
        setMessages(prev => [...prev, assistantMessage]);
        setDisplayedContent('');
        return;
      }

      if (!started) {
        started = true;
        setTimeout(streamNext, 120 + Math.random() * 180);
        return;
      }

      const remaining = fullMessage.length - currentIndex;
      const chunkSize = Math.min(
        remaining,
        Math.random() < 0.12 ? 6 : Math.random() < 0.35 ? 3 : 1
      );

      currentIndex += chunkSize;
      const nextText = fullMessage.slice(0, currentIndex);
      setDisplayedContent(nextText);

      const lastChar = nextText[nextText.length - 1] ?? '';
      const lastTwo = nextText.slice(-2);

      const isNewline = lastChar === '\n';
      const isSentencePunct = /[.!?]/.test(lastChar);
      const isClausePunct = /[,;:]/.test(lastChar);
      const isEllipsis = lastTwo === '..' || nextText.slice(-3) === '...';

      let delay = 18 + Math.random() * 42;
      if (isClausePunct) delay += 90 + Math.random() * 80;
      if (isSentencePunct) delay += 160 + Math.random() * 140;
      if (isEllipsis) delay += 120 + Math.random() * 120;
      if (isNewline) delay += 220 + Math.random() * 180;
      if (fullMessage.length > 240 && Math.random() < 0.03) {
        delay += 220 + Math.random() * 260;
      }

      setTimeout(streamNext, delay);
    };

    streamNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyFilter = (message: Message) => {
    if (message.filterCriteria && message.candidates) {
      onApplyFilter(message.filterCriteria, message.candidates.map(c => c.id));
    }
  };

  const handleSaveFilter = (message: Message) => {
    if (message.filterCriteria && message.candidates && message.originalQuery) {
      onSaveFilter(
        {
          name: '',
          filterCriteria: message.filterCriteria,
          originalQuery: message.originalQuery,
          matchedApplicantIds: message.candidates.map(c => c.id),
        },
        message.candidates.map(c => c.id)
      );
    }
  };

  const showSuggestions = messages.length <= 2 && !isTyping && !isStreaming;

  const CandidateCard = ({ candidate }: { candidate: Applicant }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-violet-500/30 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn(candidate.avatarColor, "text-white text-sm font-medium")}>
          {candidate.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{candidate.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {candidate.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {candidate.experience}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 max-w-[120px]">
        {candidate.skills.slice(0, 2).map(skill => (
          <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about your applicants and get instant insights
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Messages Column */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 border-border">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={cn(
                        'flex animate-fade-in',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 mr-3">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-5 py-3',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>

                    {/* Candidate cards for search results */}
                    {message.candidates && message.candidates.length > 0 && (
                      <div className="mt-4 ml-11 space-y-3">
                        <div className="grid gap-2">
                          {message.candidates.slice(0, 5).map(candidate => (
                            <CandidateCard key={candidate.id} candidate={candidate} />
                          ))}
                        </div>
                        {message.candidates.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{message.candidates.length - 5} more candidates
                          </p>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyFilter(message)}
                            className="gap-2"
                          >
                            <Filter className="h-4 w-4" />
                            Filter on Dashboard
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveFilter(message)}
                            className="gap-2 border-violet-500/30 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                          >
                            <Save className="h-4 w-4" />
                            Save as Custom Filter
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Thinking animation */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 mr-3">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl bg-muted px-5 py-4">
                      <div className="flex flex-col gap-3">
                        {thinkingSteps.map((step, index) => {
                          const StepIcon = step.icon;
                          const isActive = index === thinkingStep;
                          const isComplete = index < thinkingStep;
                          
                          return (
                            <div 
                              key={index}
                              className={cn(
                                "flex items-center gap-3 transition-all duration-300",
                                isActive ? "text-violet-500" : isComplete ? "text-muted-foreground" : "text-muted-foreground/40"
                              )}
                            >
                              <div className={cn(
                                "flex h-6 w-6 items-center justify-center",
                                isActive && "animate-pulse"
                              )}>
                                {isActive ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <StepIcon className={cn("h-5 w-5", isComplete && "text-green-500")} />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm transition-all duration-200",
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

                {/* Streaming text */}
                {isStreaming && displayedContent && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 mr-3">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl bg-muted px-5 py-3">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {displayedContent}
                        <span className="inline-block w-2 h-5 ml-1 bg-violet-500 animate-pulse rounded-sm" />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your applicants..."
                  className="flex-1 h-12 text-base"
                  disabled={isTyping || isStreaming}
                />
                <Button 
                  size="lg"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping || isStreaming}
                  className="h-12 px-6 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Suggested Questions Sidebar */}
        {showSuggestions && (
          <div className="w-80 shrink-0">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggested Questions</h3>
            <div className="space-y-3">
              {suggestedQuestions.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.question}
                    onClick={() => handleSend(item.question)}
                    className="p-4 cursor-pointer transition-all duration-200 hover:border-violet-500/50 hover:shadow-md hover:shadow-violet-500/10 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-violet-500/10 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-violet-600 transition-colors">
                          {item.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
