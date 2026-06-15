export function apiAuthHeaders(backendToken?: string | null): Record<string, string> {
  if (!backendToken) return {};
  return { Authorization: `Bearer ${backendToken}` };
}
