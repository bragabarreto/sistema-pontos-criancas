/**
 * Fetch helper with timeout and automatic retry with exponential backoff.
 *
 * The Neon free tier suspends the database after a few minutes of inactivity;
 * the first request after that can take several seconds or fail. Retrying
 * GET requests with backoff masks these cold starts from the user.
 *
 * Only use for idempotent requests (GET). Do NOT use for POST/PUT/DELETE,
 * as a retry could duplicate the operation.
 */

export interface FetchRetryOptions {
  /** Number of retries after the first attempt (default: 3) */
  retries?: number;
  /** Base delay between retries in ms, doubled each attempt (default: 1500) */
  baseDelayMs?: number;
  /** Timeout per attempt in ms (default: 15000) */
  timeoutMs?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a JSON endpoint, retrying on network errors, timeouts and 5xx responses.
 * @returns Parsed JSON body
 * @throws Error if all attempts fail or the final response is not OK
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: FetchRetryOptions = {}
): Promise<T> {
  const { retries = 3, baseDelayMs = 1500, timeoutMs = 15000 } = options;

  let lastError: Error = new Error('Request failed');

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (response.ok) {
        return (await response.json()) as T;
      }

      // 5xx errors are likely transient (DB cold start) — retry.
      // 4xx errors are permanent — fail immediately.
      if (response.status >= 500) {
        lastError = new Error(`HTTP ${response.status} em ${url}`);
      } else {
        throw new Error(`HTTP ${response.status} em ${url}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('HTTP 4')) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
    } finally {
      clearTimeout(timer);
    }

    if (attempt < retries) {
      await delay(baseDelayMs * Math.pow(2, attempt));
    }
  }

  throw lastError;
}
