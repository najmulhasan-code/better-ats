/**
 * Unified LLM Client
 * 
 * Provides a unified interface for both Anthropic Claude and OpenAI GPT models.
 * Tries Anthropic first, falls back to OpenAI if Anthropic fails or is unavailable.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize clients (only if API keys are available)
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Model configurations
const ANTHROPIC_MODELS = [
  process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20241022',
  'claude-sonnet-4-20250514',
  'claude-3-5-sonnet',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
  'claude-opus-4-20250514',
  'sonnet',
  'haiku',
].filter((m, i, arr) => arr.indexOf(m) === i); // Remove duplicates

const OPENAI_MODELS = [
  process.env.OPENAI_MODEL?.trim() || 'gpt-4o',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
];

export interface LLMResponse {
  content: string;
  model: string;
  provider: 'anthropic' | 'openai';
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string; // Override default model selection
  preferProvider?: 'anthropic' | 'openai' | 'auto'; // 'auto' tries anthropic first
}

/**
 * Call LLM with automatic fallback from Anthropic to OpenAI
 */
export async function callLLM(
  prompt: string,
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const {
    temperature = 0.3,
    maxTokens = 4096,
    preferProvider = 'auto',
  } = options;

  const errors: Array<{ provider: string; error: any }> = [];

  // Try Anthropic first (if available and preferred)
  if (anthropic && (preferProvider === 'auto' || preferProvider === 'anthropic')) {
    const modelsToTry = options.model 
      ? [options.model, ...ANTHROPIC_MODELS.filter(m => m !== options.model)]
      : ANTHROPIC_MODELS;

    for (const model of modelsToTry) {
      try {
        console.log(`[LLM] Attempting Anthropic model: "${model}"`);
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const responseText = message.content[0].type === 'text' 
          ? message.content[0].text 
          : '{}';

        console.log(`[LLM] ✅ Successfully used Anthropic model: "${model}"`);
        return {
          content: responseText,
          model: model,
          provider: 'anthropic',
        };
      } catch (error: any) {
        // Check if it's a model not found error
        const errorMessage = (error?.message || error?.error?.message || '').toLowerCase();
        const errorStr = JSON.stringify(error).toLowerCase();
        const isModelNotFound = 
          errorMessage.includes('not_found_error') ||
          errorMessage.includes('model:') ||
          errorMessage.includes('404') ||
          errorStr.includes('not_found_error') ||
          (error?.status === 404);

        if (isModelNotFound) {
          console.warn(`[LLM] Anthropic model "${model}" not available (404/not_found), trying next...`);
          errors.push({ provider: 'anthropic', error });
          continue; // Try next Anthropic model
        }
        
        // For other errors (auth, rate limit, etc.), log and continue to OpenAI
        console.warn(`[LLM] Anthropic error with "${model}":`, error.message || error);
        errors.push({ provider: 'anthropic', error });
        break; // Stop trying Anthropic models, move to OpenAI
      }
    }
  }

  // Fallback to OpenAI (if available)
  if (openai && (preferProvider === 'auto' || preferProvider === 'openai')) {
    const modelsToTry = options.model 
      ? [options.model, ...OPENAI_MODELS.filter(m => m !== options.model)]
      : OPENAI_MODELS;

    for (const model of modelsToTry) {
      try {
        console.log(`[LLM] Attempting OpenAI model: "${model}"`);
        const completion = await openai.chat.completions.create({
          model: model,
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        console.log(`[LLM] ✅ Successfully used OpenAI model: "${model}"`);
        return {
          content: responseText,
          model: model,
          provider: 'openai',
        };
      } catch (error: any) {
        // Check if it's a model not found error
        const errorMessage = (error?.message || '').toLowerCase();
        const isModelNotFound = 
          errorMessage.includes('not found') ||
          errorMessage.includes('invalid model') ||
          errorMessage.includes('model_not_found') ||
          (error?.status === 404);

        if (isModelNotFound) {
          console.warn(`[LLM] OpenAI model "${model}" not available, trying next...`);
          errors.push({ provider: 'openai', error });
          continue; // Try next OpenAI model
        }
        
        // For other errors, log and try next model
        console.warn(`[LLM] OpenAI error with "${model}":`, error.message || error);
        errors.push({ provider: 'openai', error });
        continue; // Try next OpenAI model
      }
    }
  }

  // All providers/models failed
  const errorMessages = errors.map(e => `${e.provider}: ${e.error?.message || 'Unknown error'}`).join('; ');
  throw new Error(
    `LLM call failed: All providers and models failed. ` +
    `Errors: ${errorMessages}. ` +
    `Please check your API keys (ANTHROPIC_API_KEY or OPENAI_API_KEY) and model availability.`
  );
}

/**
 * Check if any LLM provider is available
 */
export function isLLMAvailable(): boolean {
  return !!(anthropic || openai);
}

/**
 * Get available providers
 */
export function getAvailableProviders(): Array<'anthropic' | 'openai'> {
  const providers: Array<'anthropic' | 'openai'> = [];
  if (anthropic) providers.push('anthropic');
  if (openai) providers.push('openai');
  return providers;
}

