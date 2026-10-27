import { synthesizeLocalTemplate, type DisplayArchetype } from './block-converter';

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
  localFallback?: {
    jsonData: any;
    archetype: DisplayArchetype;
    prompt?: string;
  };
}

export interface GeminiGenerateResult {
  text: string;
  modelUsed: string;
  fallbacksTriggered: string[];
}

const STORAGE_KEY = 'rdf_gemini_api_key';

// Ordered preference list for real, active Gemini models
export const DEFAULT_MODEL_CANDIDATES = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro-latest',
  'gemini-1.0-pro',
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
   * Checks both v1beta and v1 endpoints to ensure maximum compatibility.
   */
  static async discoverModels(apiKey?: string): Promise<string[]> {
    const key = apiKey || this.getStoredApiKey();
    if (!key) {
      return DEFAULT_MODEL_CANDIDATES;
    }

    if (this.cachedDiscoveredModels && this.cachedDiscoveredModels.length > 0) {
      return this.cachedDiscoveredModels;
    }

    for (const apiVer of ['v1beta', 'v1']) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/${apiVer}/models?key=${key}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const models: GeminiModelInfo[] = data.models || [];

        // Filter for models supporting generateContent and normalize name (remove 'models/' prefix)
        const validModels = models
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));

        if (validModels.length > 0) {
          // Sort discovered models according to priority preference
          const sorted = [...DEFAULT_MODEL_CANDIDATES].filter(cand =>
            validModels.includes(cand)
          );

          for (const m of validModels) {
            if (!sorted.includes(m)) {
              sorted.push(m);
            }
          }

          this.cachedDiscoveredModels = sorted;
          return sorted;
        }
      } catch {
        // Try next endpoint version
      }
    }

    return DEFAULT_MODEL_CANDIDATES;
  }

  /**
   * Generates content with automatic fallback across candidate models if one fails.
   * When all remote LLM models fail or return 404, cleanly falls back to the Local Template Synthesizer.
   */
  static async generateWithFallback(
    prompt: string,
    options: GeminiGenerateOptions = {}
  ): Promise<GeminiGenerateResult> {
    const key = options.apiKey || this.getStoredApiKey();
    if (!key) {
      // If no key provided, but local fallback is available, immediately synthesize!
      if (options.localFallback) {
        const fallbackModel = 'Local Template Synthesizer';
        options.onStatusChange?.({
          status: 'completed',
          model: fallbackModel,
          message: 'Synthesizing template with Local Engine...',
        });
        const synthesized = synthesizeLocalTemplate(
          options.localFallback.jsonData,
          options.localFallback.archetype,
          options.localFallback.prompt
        );
        return {
          text: synthesized,
          modelUsed: fallbackModel,
          fallbacksTriggered: [fallbackModel],
        };
      }
      throw new Error('Gemini API key is required. Please configure your key in the settings.');
    }

    // Try to auto-discover models for this specific API key if not yet cached
    let availableModels = this.cachedDiscoveredModels;
    if (!availableModels || availableModels.length === 0) {
      try {
        availableModels = await this.discoverModels(key);
      } catch {
        availableModels = DEFAULT_MODEL_CANDIDATES;
      }
    }
    const modelQueue = availableModels && availableModels.length > 0 ? availableModels : DEFAULT_MODEL_CANDIDATES;

    // Determine candidate model queue
    let candidates: string[] = [];
    if (options.model) {
      candidates = [
        options.model,
        ...modelQueue.filter(m => m !== options.model),
      ];
    } else {
      candidates = [...modelQueue];
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
        
        // Check if error is recoverable via fallback (404, 429, 503, timeout, model not found, quota)
        const isQuotaOrNotFound =
          statusOrMessage.includes('404') ||
          statusOrMessage.includes('429') ||
          statusOrMessage.includes('503') ||
          statusOrMessage.toLowerCase().includes('timeout') ||
          statusOrMessage.toLowerCase().includes('abort') ||
          statusOrMessage.toLowerCase().includes('quota') ||
          statusOrMessage.toLowerCase().includes('not found') ||
          statusOrMessage.toLowerCase().includes('unavailable');

        if (!isQuotaOrNotFound) {
          // If fatal non-retryable error, stop remote cascade
          break;
        }

        // Otherwise loop to next model in fallback list
      }
    }

    // ALL REMOTE MODELS FAILED -> Check if Local Fallback is available
    if (options.localFallback) {
      const fallbackModel = 'Local Intelligent Synthesizer';
      fallbacksTriggered.push(fallbackModel);

      options.onStatusChange?.({
        status: 'fallback',
        model: fallbackModel,
        previousModel: candidates[candidates.length - 1],
        fallbackReason: lastError?.message || 'Remote Gemini models unavailable (404/Quota)',
        message: 'Remote Gemini models unavailable. Successfully switched to Local Template Synthesizer fallback.',
      });

      const synthesized = synthesizeLocalTemplate(
        options.localFallback.jsonData,
        options.localFallback.archetype,
        options.localFallback.prompt
      );

      options.onStatusChange?.({
        status: 'completed',
        model: fallbackModel,
        message: 'Generated verified template with Local Template Synthesizer',
      });

      return {
        text: synthesized,
        modelUsed: fallbackModel,
        fallbacksTriggered,
      };
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
   * Automatically attempts v1beta and v1 API versions on 404.
   */
  private static async callGenerateContent(
    model: string,
    prompt: string,
    apiKey: string,
    options: GeminiGenerateOptions
  ): Promise<string> {
    const apiVersions = ['v1beta', 'v1'];
    let lastErr: Error | null = null;

    for (const apiVer of apiVersions) {
      const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${apiKey}`;

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 25000);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
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

          // If 404 on v1beta, try v1
          if (response.status === 404 && apiVer === 'v1beta') {
            lastErr = new Error(`Gemini API Error (HTTP ${response.status}): ${parsedMessage}`);
            continue;
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
      } catch (err: any) {
        if (err.name === 'AbortError' || err?.message?.includes('aborted')) {
          lastErr = new Error(`Request to model ${model} timed out after 25 seconds.`);
        } else {
          lastErr = err;
        }

        // Only retry on v1 if 404 on v1beta
        if (!String(err?.message || '').includes('404') || apiVer !== 'v1beta') {
          throw lastErr;
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastErr || new Error(`Failed to generate content with ${model}.`);
  }
}
