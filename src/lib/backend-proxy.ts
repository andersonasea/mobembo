import { auth } from "@/lib/auth";
import { getServerApiUrl } from "@/lib/api-url";

type ProxyOptions = {
  requireAuth?: boolean;
};

export async function proxyToBackend(
  request: Request,
  path: string,
  options?: ProxyOptions
): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  if (options?.requireAuth) {
    const session = await auth();
    const token = session?.user?.backendToken;
    if (!token) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getServerApiUrl()}${path}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
  });

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: response.headers,
  });
}
