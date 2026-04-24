const trimmedPublicApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const apiVersionPrefix = "/api/v1";

export function toApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.startsWith("/api/")) {
    path = path.replace(/^\/api/, apiVersionPrefix);
  }

  if (!trimmedPublicApiUrl) {
    return path;
  }

  return `${trimmedPublicApiUrl}${path}`;
}

export function getServerApiUrl(): string {
  return (
    process.env.API_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:4000"
  );
}
