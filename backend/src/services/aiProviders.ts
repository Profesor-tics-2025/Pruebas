import { env } from '../config/env.js';

export interface ProviderResult {
  provider: string;
  confidenceScore: number;
  payload: Record<string, unknown>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const simulate = async (provider: string, filePath: string, taskType: string): Promise<ProviderResult> => {
  await wait(500);
  return {
    provider,
    confidenceScore: Number((0.75 + Math.random() * 0.2).toFixed(2)),
    payload: {
      summary: `Resultado simulado para ${taskType} en ${filePath}`,
      providerKeyConfigured:
        (provider === 'openai' && !!env.OPENAI_API_KEY) ||
        (provider === 'google-vision' && !!env.GOOGLE_CLOUD_API_KEY) ||
        (provider === 'aws-rekognition' && !!env.AWS_ACCESS_KEY_ID) ||
        (provider === 'huggingface' && !!env.HUGGINGFACE_API_KEY)
    }
  };
};

export const executeProvider = async (provider: string, filePath: string, taskType: string): Promise<ProviderResult> => {
  if (Math.random() < 0.15) throw new Error(`${provider}: fallo transitorio`);
  return simulate(provider, filePath, taskType);
};

export const executeWithRetry = async (
  providers: string[],
  filePath: string,
  taskType: string,
  maxRetries = 3
): Promise<ProviderResult> => {
  let lastError: Error | undefined;

  for (const provider of providers) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await executeProvider(provider, filePath, taskType);
      } catch (error) {
        lastError = error as Error;
        const backoff = 400 * attempt;
        await wait(backoff);
      }
    }
  }

  throw lastError ?? new Error('No providers available');
};
