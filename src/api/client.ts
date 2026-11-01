import { config } from "../config/config";
import { getDeviceId } from "../storage/deviceId";

export class ApiError extends Error {
  constructor(
    // 0 = no response (offline, timeout).
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryAfterMs?: number,
  ) {
    super(message);
  }
}

// Worth retrying: no response, server errors, rate limits. Never 4xx validation.
export const isRetryable = (e: unknown) => e instanceof ApiError && (e.status === 0 || e.status === 429 || e.status >= 500);

interface RequestOptions {
  method?: "GET" | "POST";
  body?: BodyInit;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

// fetch with a timeout, the device id header, and errors normalised to ApiError.
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? config.requestTimeoutMs);
  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}${path}`, {
      method: opts.method ?? "GET",
      body: opts.body,
      headers: { Accept: "application/json", "X-Device-Id": getDeviceId(), ...opts.headers },
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "network", "No connection");
  } finally {
    clearTimeout(timer);
  }

  const json = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  if (!res.ok) {
    const retryAfter = Number(res.headers.get("retry-after"));
    throw new ApiError(
      res.status,
      json?.error?.code ?? "http_error",
      json?.error?.message ?? `Request failed (${res.status})`,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
    );
  }
  return json as T;
}
