/**
 * Client-side Google Gemini REST API service with automated model discovery and multi-tier fallback.
 * Keys are stored locally in the browser to maintain strict user privacy.
 */

export interface GeminiModelInfo {
  name: string;
  displayName: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

export type GeminiStatus =
  | 'idle'
  | 'discovering'
  | 'connecting'
  | 'generating'
  | 'fallback'
  | 'validating'
  | 'completed'
  | 'error';

export interface GeminiStatusUpdate {
  status: GeminiStatus;
  model: string;
  message?: string;
  previousModel?: string;
  fallbackReason?: string;
}

export interface GeminiGenerateOptions {
  apiKey?: string;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
  onStatusChange?: (update: GeminiStatusUpdate) => void;
  onToken?: (token: string) => void;
}

export interface GeminiGenerateResult {
  text: string;
  modelUsed: string;
  fallbacksTriggered: string[];
}

const STORAGE_KEY = 'rdf_gemini_api_key';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Ordered preference list for models
export const DEFAULT_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export class GeminiClient {
  private static cachedDiscoveredModels: string[] | null = null;

  /**
   * Retrieves the stored API key from localStorage.
   */
  static getStoredApiKey(): string {
    try {
      const storage = typeof window !== 'undefined' ? window.localStorage : (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
      return storage ? storage.getItem(STORAGE_KEY) || '' : '';
    } catch {
      return '';
    }
  }

  /**
   * Saves the API key to localStorage.
   */
  static setStoredApiKey(key: string): void {
    try {
      const storage = typeof window !== 'undefined' ? window.localStorage : (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
      if (!storage) return;
      if (!key.trim()) {
        storage.removeItem(STORAGE_KEY);
      } else {
        storage.setItem(STORAGE_KEY, key.trim());
      }
    } catch {
      // Ignored if storage quota exceeded or disabled
    }
  }

  /**
   * Clears the API key from localStorage.
   */
  static clearStoredApiKey(): void {
    try {
      const storage = typeof window !== 'undefined' ? window.localStorage : (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
      if (storage) {
        storage.removeItem(STORAGE_KEY);
      }
      this.cachedDiscoveredModels = null;
    } catch {
      // Ignored
    }
  }

  /**
   * Queries the Gemini API to list all available models for the given API key.
   */
  static async discoverModels(apiKey?: string): Promise<string[]> {
    const key = apiKey || this.getStoredApiKey();
    if (!key) {
      throw new Error('API key is required to discover Gemini models.');
    }

    if (this.cachedDiscoveredModels && this.cachedDiscoveredModels.length > 0) {
      return this.cachedDiscoveredModels;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/models?key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list models: HTTP ${response.status}`);
      }

      const data = await response.json();
      const models: GeminiModelInfo[] = data.models || [];

      // Filter for models supporting generateContent and normalize name (remove 'models/' prefix)
      const validModels = models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''));

      // Sort discovered models according to priority preference
      const sorted = [...DEFAULT_MODEL_CANDIDATES].filter(cand =>
        validModels.includes(cand)
      );

      // Append any other discovered models not in the default list
      for (const m of validModels) {
        if (!sorted.includes(m)) {
          sorted.push(m);
        }
      }

      this.cachedDiscoveredModels = sorted.length > 0 ? sorted : DEFAULT_MODEL_CANDIDATES;
      return this.cachedDiscoveredModels;
    } catch {
      // If discover fails, fallback gracefully to default candidate list
      return DEFAULT_MODEL_CANDIDATES;
    }
  }

  /**
   * Generates content with automatic fallback across candidate models if one fails.
   */
  static async generateWithFallback(
    prompt: string,
    options: GeminiGenerateOptions = {}
  ): Promise<GeminiGenerateResult> {
    const key = options.apiKey || this.getStoredApiKey();
    if (!key) {
      throw new Error('Gemini API key is required. Please configure your key in the settings.');
    }

    // Determine candidate model queue
    let candidates: string[] = [];
    if (options.model) {
      candidates = [
        options.model,
        ...DEFAULT_MODEL_CANDIDATES.filter(m => m !== options.model),
      ];
    } else {
      candidates = [...DEFAULT_MODEL_CANDIDATES];
    }

    const fallbacksTriggered: string[] = [];
    let lastError: Error | null = null;

    for (let i = 0; i < candidates.length; i++) {
      const currentModel = candidates[i];
      const isFallback = i > 0;

      if (isFallback) {
        fallbacksTriggered.push(currentModel);
        options.onStatusChange?.({
          status: 'fallback',
          model: currentModel,
          previousModel: candidates[i - 1],
          fallbackReason: lastError?.message || 'Previous model returned an error',
          message: `Falling back to model ${currentModel}...`,
        });
      } else {
        options.onStatusChange?.({
          status: 'connecting',
          model: currentModel,
          message: `Connecting to ${currentModel}...`,
        });
      }

      try {
        options.onStatusChange?.({
          status: 'generating',
          model: currentModel,
          message: `Generating template with ${currentModel}...`,
        });

        const result = await this.callGenerateContent(currentModel, prompt, key, options);

        options.onStatusChange?.({
          status: 'completed',
          model: currentModel,
          message: `Generation completed with ${currentModel}`,
        });

        return {
          text: result,
          modelUsed: currentModel,
          fallbacksTriggered,
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const statusOrMessage = lastError.message;
        
        // Check if error is recoverable via fallback (404, 429, 503, model not found, quota)
        const isQuotaOrNotFound =
          statusOrMessage.includes('404') ||
          statusOrMessage.includes('429') ||
          statusOrMessage.includes('503') ||
          statusOrMessage.toLowerCase().includes('quota') ||
          statusOrMessage.toLowerCase().includes('not found') ||
          statusOrMessage.toLowerCase().includes('unavailable');

        if (!isQuotaOrNotFound && i === candidates.length - 1) {
          // If it's a non-retryable fatal error (e.g. invalid API key 400/401/403), throw immediately
          break;
        }

        // Otherwise loop to next model in fallback list
      }
    }

    options.onStatusChange?.({
      status: 'error',
      model: candidates[candidates.length - 1],
      message: lastError ? lastError.message : 'All Gemini candidate models failed.',
    });

    throw lastError || new Error('All Gemini candidate models failed.');
  }

  /**
   * Low-level call to Gemini generateContent endpoint.
   */
  private static async callGenerateContent(
    model: string,
    prompt: string,
    apiKey: string,
    options: GeminiGenerateOptions
  ): Promise<string> {
    const url = `${API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.4,
        maxOutputTokens: options.maxOutputTokens ?? 4096,
      },
    };

    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    if (options.jsonMode) {
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedMessage = '';
      try {
        const errJson = JSON.parse(errText);
        parsedMessage = errJson.error?.message || errText;
      } catch {
        parsedMessage = errText;
      }
      throw new Error(`Gemini API Error (HTTP ${response.status}): ${parsedMessage}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate) {
      throw new Error('Gemini API returned no response candidates.');
    }

    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Gemini response was blocked by safety filters.');
    }

    const textPart = candidate.content?.parts?.[0]?.text;
    if (typeof textPart !== 'string') {
      throw new Error('Gemini API returned response without text content.');
    }

    if (options.onToken) {
      options.onToken(textPart);
    }

    return textPart;
  }
}
