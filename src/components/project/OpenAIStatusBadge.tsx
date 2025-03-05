import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { isOpenAIConfigured, loadOpenAIConfig } from '@/lib/openai-service';

export function OpenAIStatusBadge() {
  const [isConfigured, setIsConfigured] = useState(false);
  
  useEffect(() => {
    // Load configuration on mount
    loadOpenAIConfig();
    setIsConfigured(isOpenAIConfigured());
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      setIsConfigured(isOpenAIConfigured());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  if (isConfigured) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        OpenAI API Configured
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      OpenAI API Not Configured
    </Badge>
  );
} 