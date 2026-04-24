import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  return proxyToBackend(request, "/api/companies");
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/api/companies", { requireAuth: true });
}
