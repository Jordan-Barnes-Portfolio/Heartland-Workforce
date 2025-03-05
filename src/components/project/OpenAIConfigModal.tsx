import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { loadOpenAIConfig, updateOpenAIConfig, isOpenAIConfigured } from '@/lib/openai-service';

interface OpenAIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenAIConfigModal({ isOpen, onClose }: OpenAIConfigModalProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('1000');
  const [prompt, setPrompt] = useState('');
  
  // Load saved configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      const config = loadOpenAIConfig();
      setApiKey(config.apiKey || '');
      setModel(config.model || 'gpt-3.5-turbo');
      setTemperature(config.temperature.toString() || '0.7');
      setMaxTokens(config.maxTokens.toString() || '1000');
      setPrompt(config.prompt || '');
    }
  }, [isOpen]);
  
  const handleSave = () => {
    try {
      // Validate inputs
      if (!apiKey.trim()) {
        toast({
          title: 'API Key Required',
          description: 'Please enter your OpenAI API key.',
          variant: 'destructive',
        });
        return;
      }
      
      const tempValue = parseFloat(temperature);
      if (isNaN(tempValue) || tempValue < 0 || tempValue > 1) {
        toast({
          title: 'Invalid Temperature',
          description: 'Temperature must be a number between 0 and 1.',
          variant: 'destructive',
        });
        return;
      }
      
      const tokensValue = parseInt(maxTokens);
      if (isNaN(tokensValue) || tokensValue < 1) {
        toast({
          title: 'Invalid Max Tokens',
          description: 'Max tokens must be a positive number.',
          variant: 'destructive',
        });
        return;
      }
      
      // Update configuration
      updateOpenAIConfig({
        apiKey,
        model,
        temperature: tempValue,
        maxTokens: tokensValue,
        prompt: prompt.trim(),
      });
      
      toast({
        title: 'Configuration Saved',
        description: 'Your OpenAI API configuration has been saved.',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save OpenAI configuration:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save configuration. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>OpenAI API Configuration</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API settings for the description enrichment feature.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-3.5-turbo"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temperature" className="text-right">
              Temperature
            </Label>
            <Input
              id="temperature"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="0.7"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxTokens" className="text-right">
              Max Tokens
            </Label>
            <Input
              id="maxTokens"
              type="number"
              min="1"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="1000"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="prompt" className="text-right pt-2">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your system prompt for the enrichment feature"
              className="col-span-3 min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 