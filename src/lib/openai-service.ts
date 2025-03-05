import { toast } from '@/hooks/use-toast';

// Default prompt for enriching project descriptions
const DEFAULT_PROMPT = `You are a professional restoration project manager. Enhance the following project description to make it more detailed, professional, and comprehensive. Include specific details about restoration processes, technical terminology, and structured sections covering damage assessment, remediation approach, and timeline considerations. Format the response with bullet points where appropriate:`;

// Configuration for OpenAI API
interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  prompt: string;
}

// Default configuration
const defaultConfig: OpenAIConfig = {
  apiKey: process.env.OPEN_API_KEY?.toString() || "", // This should be set by the user
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  prompt: DEFAULT_PROMPT,
};

// Store the configuration
let openAIConfig: OpenAIConfig = { ...defaultConfig };

/**
 * Update the OpenAI API configuration
 */
export const updateOpenAIConfig = (config: Partial<OpenAIConfig>) => {
  openAIConfig = { ...openAIConfig, ...config };
  
  // Save to localStorage for persistence
  localStorage.setItem('openai_config', JSON.stringify(openAIConfig));
  
  return openAIConfig;
};

/**
 * Load the OpenAI configuration from localStorage
 */
export const loadOpenAIConfig = (): OpenAIConfig => {
  try {
    const savedConfig = localStorage.getItem('openai_config');
    if (savedConfig) {
      openAIConfig = { ...openAIConfig, ...JSON.parse(savedConfig) };
    }
  } catch (error) {
    console.error('Failed to load OpenAI config:', error);
  }
  
  return openAIConfig;
};

/**
 * Check if the OpenAI API key is configured
 */
export const isOpenAIConfigured = (): boolean => {
  return !!openAIConfig.apiKey;
};

/**
 * Enrich a project description using the OpenAI API
 */
export const enrichProjectDescription = async (description: string): Promise<string> => {
  // Load the latest config
  loadOpenAIConfig();
  
  if (!openAIConfig.apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIConfig.apiKey}`
      },
      body: JSON.stringify({
        model: openAIConfig.model,
        messages: [
          {
            role: 'system',
            content: openAIConfig.prompt
          },
          {
            role: 'user',
            content: description
          }
        ],
        temperature: openAIConfig.temperature,
        max_tokens: openAIConfig.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Failed to enrich description with OpenAI:', error);
    throw error;
  }
}; 