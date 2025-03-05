import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Folders, 
  Users, 
  Clock, 
  Archive,
  PhoneCall,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isAI: boolean;
  status?: 'sending' | 'sent' | 'error';
}

interface Feature {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 'projects',
    icon: Folders,
    name: 'Projects',
    description: 'Get insights and updates about your ongoing projects',
  },
  {
    id: 'referrals',
    icon: PhoneCall,
    name: 'Referrals',
    description: 'Track and manage your referral partnerships',
  },
  {
    id: 'users',
    icon: Users,
    name: 'Users',
    description: 'Access team member information and roles',
  },
  {
    id: 'timecards',
    icon: Clock,
    name: 'Timecards',
    description: 'Review and manage time tracking data',
  },
  {
    id: 'archived',
    icon: Archive,
    name: 'Archived',
    description: 'Access historical project data and records',
  },
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
      isAI: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adjust chat container height on window resize
  useEffect(() => {
    const updateHeight = () => {
      if (chatContainerRef.current) {
        const viewportHeight = window.innerHeight;
        const headerHeight = 64; // Header height
        const chatHeaderHeight = 72; // Chat header height
        const chatInputHeight = 84; // Chat input height
        const availableHeight = viewportHeight - headerHeight - chatHeaderHeight - chatInputHeight;
        chatContainerRef.current.style.height = `${availableHeight}px`;
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isAI: false,
      status: 'sending',
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm an AI placeholder response. This will be replaced with the actual API integration.",
        timestamp: new Date(),
        isAI: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 overflow-hidden bg-gray-50">
          <div className="flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="border-b bg-white px-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 bg-orange-500">
                  <AvatarImage src="https://images.unsplash.com/photo-1675553320995-7f6b0def91b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Heartland AI Assistant</h2>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedFeatures.size > 0 ? (
                      Array.from(selectedFeatures).map((featureId) => {
                        const feature = features.find((f) => f.id === featureId);
                        if (!feature) return null;
                        return (
                          <Badge
                            key={featureId}
                            variant="secondary"
                            className="gap-1 bg-orange-100 text-orange-700"
                          >
                            <feature.icon className="h-3 w-3" />
                            {feature.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFeature(featureId);
                              }}
                              className="ml-1 rounded-full p-0.5 hover:bg-orange-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-gray-500">No features selected</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                >
                  {isPanelCollapsed ? <ChevronLeft /> : <ChevronRight />}
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto bg-gray-100 p-4"
            >
              <div className="mx-auto max-w-4xl">
                {messages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
                {isTyping && (
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar className="h-8 w-8 bg-orange-500">
                      <AvatarImage src="https://images.unsplash.com/photo-1675553320995-7f6b0def91b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-white px-4 py-2">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t bg-white p-4">
              <div className="mx-auto max-w-4xl">
                <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div 
            className={cn(
              "border-l bg-white transition-all duration-300",
              isPanelCollapsed ? "w-0 opacity-0" : "w-80 opacity-100",
              "hidden lg:block"
            )}
          >
            <div className="h-full overflow-y-auto p-6">
              <h3 className="mb-4 text-lg font-semibold">Assistant Features</h3>
              <div className="space-y-3">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`group w-full rounded-lg border p-3 text-left transition-all hover:border-orange-200 hover:bg-orange-50 ${
                      selectedFeatures.has(feature.id)
                        ? 'border-orange-200 bg-orange-50 ring-2 ring-orange-200'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${
                        selectedFeatures.has(feature.id)
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600'
                      }`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          selectedFeatures.has(feature.id)
                            ? 'text-orange-900'
                            : 'text-gray-900'
                        }`}>
                          {feature.name}
                        </p>
                        <p className={`text-sm ${
                          selectedFeatures.has(feature.id)
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Select multiple features to get specialized assistance across different areas.
                  The AI will tailor its responses based on your selections.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}