import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Database, BarChart3, Brain, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Applicant } from '@/types/applicant';
import { generateChatResponse } from '@/utils/aiDemoData';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatFullViewProps {
  applicants: Applicant[];
}

const suggestedQuestions = [
  {
    question: "How many applications this week?",
    description: "Get a summary of recent applications",
    icon: BarChart3,
  },
  {
    question: "Show candidates with 5+ years experience",
    description: "Filter by experience level",
    icon: Database,
  },
  {
    question: "What's the category breakdown?",
    description: "Analyze applicants by job category",
    icon: BarChart3,
  },
  {
    question: "How many shortlisted candidates?",
    description: "Check pipeline progress",
    icon: MessageSquare,
  },
];

const thinkingSteps = [
  { icon: Database, text: "Scanning applicant database..." },
  { icon: BarChart3, text: "Analyzing patterns..." },
  { icon: Brain, text: "Generating insights..." },
];

export function AIChatFullView({ applicants }: AIChatFullViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Ask me about your applicants, pipeline statistics, or candidate insights. I can help you analyze trends, find specific candidates, and provide actionable recommendations."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
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

    // Simulate AI processing with thinking animation (2.7s total for all steps)
    await new Promise(resolve => setTimeout(resolve, 2700));

    const response = generateChatResponse(messageText, applicants);
    
    setIsTyping(false);
    setIsStreaming(true);
    setDisplayedContent('');

    // Stream like ChatGPT: small token-ish bursts, variable cadence, punctuation/newline pauses
    const fullMessage = response.message;
    let currentIndex = 0;
    let started = false;

    const streamNext = () => {
      if (currentIndex >= fullMessage.length) {
        setIsStreaming(false);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullMessage
        };
        setMessages(prev => [...prev, assistantMessage]);
        setDisplayedContent('');
        return;
      }

      // Initial tiny delay before the first token (feels more natural)
      if (!started) {
        started = true;
        setTimeout(streamNext, 120 + Math.random() * 180);
        return;
      }

      const remaining = fullMessage.length - currentIndex;
      // Token-ish chunk sizes (mostly small, occasionally larger)
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

      // Base cadence similar to ChatGPT
      let delay = 18 + Math.random() * 42; // 18-60ms

      // Natural pauses
      if (isClausePunct) delay += 90 + Math.random() * 80;
      if (isSentencePunct) delay += 160 + Math.random() * 140;
      if (isEllipsis) delay += 120 + Math.random() * 120;
      if (isNewline) delay += 220 + Math.random() * 180;

      // Occasional micro-think pauses during long responses
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

  const showSuggestions = messages.length <= 2 && !isTyping && !isStreaming;

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
                  <div
                    key={message.id}
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
