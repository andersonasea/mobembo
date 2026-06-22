import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/admin/analytics/passenger-demographics${search}`, {
    requireAuth: true,
  });
}
