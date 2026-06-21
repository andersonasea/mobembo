import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/users/me${search}`, { requireAuth: true });
}

export async function PATCH(request: Request) {
  return proxyToBackend(request, "/api/users/me", { requireAuth: true });
}
