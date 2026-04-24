import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/payments", { requireAuth: true });
}
