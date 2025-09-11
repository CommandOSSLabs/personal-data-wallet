export interface ModelConfig {
  id: string // Internal identifier
  providerId: string // Actual model name to send to backend
  name: string // Display name
  provider: string // Provider name (Google, OpenAI, etc.)
  description: string
  available: boolean
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    providerId: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Fast and efficient AI model',
    available: true
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    providerId: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning and analysis',
    available: true
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    providerId: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Quick responses for simple tasks',
    available: true
  },
  'gpt-4': {
    id: 'gpt-4',
    providerId: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'OpenAI\'s powerful language model',
    available: false
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    providerId: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable Claude model',
    available: false
  },
  'llama-3': {
    id: 'llama-3',
    providerId: 'llama-3-70b',
    name: 'Llama 3',
    provider: 'Meta',
    description: 'Open source language model',
    available: false
  }
}

// Default model to use
export const DEFAULT_MODEL_ID = 'gemini-2.0-flash'

// Get the provider ID (actual model name) for a given model ID
export const getProviderModelId = (modelId: string): string => {
  return MODEL_CONFIGS[modelId]?.providerId || DEFAULT_MODEL_ID
}

// Get all available models
export const getAvailableModels = () => {
  return Object.values(MODEL_CONFIGS).filter(model => model.available)
}