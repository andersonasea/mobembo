import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/schedules${search}`);
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/schedules", { requireAuth: true });
}
