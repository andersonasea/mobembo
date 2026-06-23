import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/admin/analytics/dashboard-stats", {
    requireAuth: true,
  });
}
