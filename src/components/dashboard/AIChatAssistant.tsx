import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Database, BarChart3, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Applicant } from '@/types/applicant';
import { generateChatResponse } from '@/utils/aiDemoData';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicants: Applicant[];
}

const suggestedQuestions = [
  "How many applications this week?",
  "Show candidates with 5+ years experience",
  "What's the category breakdown?",
  "How many shortlisted candidates?",
];

const thinkingSteps = [
  { icon: Database, text: "Scanning applicant database..." },
  { icon: BarChart3, text: "Analyzing patterns..." },
  { icon: Brain, text: "Generating insights..." },
];

export function AIChatAssistant({ open, onOpenChange, applicants }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Ask me about your applicants, pipeline statistics, or candidate insights."
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
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

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

  if (!open) return null;

  const CurrentThinkingIcon = thinkingSteps[thinkingStep]?.icon || Brain;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-xl border border-border bg-card shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Applicant insights</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="h-80 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex animate-fade-in',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-4 py-2.5 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {/* Thinking animation */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[85%] rounded-xl bg-muted px-4 py-3 text-sm">
                <div className="flex flex-col gap-2">
                  {thinkingSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === thinkingStep;
                    const isComplete = index < thinkingStep;
                    
                    return (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-center gap-2 transition-all duration-300",
                          isActive ? "text-violet-500" : isComplete ? "text-muted-foreground" : "text-muted-foreground/40"
                        )}
                      >
                        <div className={cn(
                          "flex h-5 w-5 items-center justify-center",
                          isActive && "animate-pulse"
                        )}>
                          {isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <StepIcon className={cn("h-4 w-4", isComplete && "text-green-500")} />
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

          {/* Streaming text */}
          {isStreaming && displayedContent && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[85%] rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground">
                <p className="whitespace-pre-wrap">
                  {displayedContent}
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-violet-500 animate-pulse" />
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-xs text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about applicants..."
            className="flex-1"
            disabled={isTyping || isStreaming}
          />
          <Button 
            size="icon" 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping || isStreaming}
            className="bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
