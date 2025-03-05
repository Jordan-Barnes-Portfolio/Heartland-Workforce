import { useState } from 'react';
import { BaseWidget } from './BaseWidget';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import type { Widget } from '@/types/widget';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isAI: boolean;
  status?: 'sending' | 'sent' | 'error';
}

interface AIAssistantWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export function AIAssistantWidget({ widget, onRemove }: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
      isAI: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

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
    <BaseWidget widget={widget} onRemove={onRemove}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
          {isTyping && (
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-white px-4 py-2">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
        <div className="border-t bg-white p-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </BaseWidget>
  );
}