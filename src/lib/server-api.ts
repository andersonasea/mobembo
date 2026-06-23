import { unstable_noStore as noStore } from "next/cache";
import { getServerApiUrl } from "@/lib/api-url";
import { getApiData } from "@/lib/api-response";
import { apiAuthHeaders } from "@/lib/api-auth-headers";

type FetchServerApiOptions = {
  token?: string | null;
};

export async function fetchServerApi<T>(
  path: string,
  options?: FetchServerApiOptions
): Promise<T | null> {
  noStore();
  const base = getServerApiUrl();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...apiAuthHeaders(options?.token),
  };

  const res = await fetch(`${base}${path}`, { cache: "no-store", headers });
  if (res.status === 404) return null;
  if (!res.ok) return null;

  const body = await res.json();
  return getApiData<T>(body);
}
