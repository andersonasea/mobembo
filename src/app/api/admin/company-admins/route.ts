import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/admin/company-admins", { requireAuth: true });
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/admin/company-admins", { requireAuth: true });
}
