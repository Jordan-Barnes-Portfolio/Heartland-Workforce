export function TypingIndicator() {
  return (
    <div className="flex space-x-1 px-2 py-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
    </div>
  );
}