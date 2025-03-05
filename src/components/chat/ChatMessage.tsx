import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessageProps {
  content: string;
  timestamp: Date;
  isAI: boolean;
  status?: 'sending' | 'sent' | 'error';
}

export function ChatMessage({ content, isAI, status }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'mb-4 flex animate-slideIn items-start gap-3 transition-opacity',
        isAI ? 'mr-12' : 'ml-12 flex-row-reverse'
      )}
    >
      <Avatar className={cn('h-8 w-8 ring-2 ring-white', isAI && 'bg-orange-500')}>
        {isAI ? (
          <>
            <AvatarImage src="https://images.unsplash.com/photo-1675553320995-7f6b0def91b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
            <AvatarFallback>You</AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={cn(
          'group relative max-w-[85%] rounded-lg px-4 py-2 text-sm',
          isAI ? 'bg-white text-gray-900' : 'bg-orange-500 text-white'
        )}
      >
        {content}
        {!isAI && status && (
          <span className="absolute -bottom-5 text-xs text-gray-400">
            {status === 'sending' && 'Sending...'}
            {status === 'sent' && 'Sent'}
            {status === 'error' && 'Failed to send'}
          </span>
        )}
      </div>
    </div>
  );
}