type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export function getApiData<T>(payload: T | ApiSuccess<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiSuccess<T>).data;
  }
  return payload as T;
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as ApiErrorShape).error;
  if (error?.message) return error.message;
  return fallback;
}
