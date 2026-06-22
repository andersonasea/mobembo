import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/search/trips${search}`);
}
