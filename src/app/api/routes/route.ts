import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/routes${search}`);
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/routes", { requireAuth: true });
}
