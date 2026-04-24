import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/bookings/${id}`, { requireAuth: true });
}
