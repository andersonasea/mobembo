import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { getServerApiUrl } from "@/lib/api-url";
import { getApiData } from "@/lib/api-response";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await fetch(`${getServerApiUrl()}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) return null;

          const payload = getApiData<{
            token: string;
            user: {
              id: string;
              name: string;
              email: string;
              role: string;
              companyId?: string | null;
              companyName?: string | null;
              imageUrl?: string | null;
            };
          }>(await response.json());

          if (!payload?.token || !payload.user) return null;

          return {
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
            role: payload.user.role,
            companyId: payload.user.companyId ?? null,
            companyName: payload.user.companyName ?? null,
            hasImage: !!payload.user.imageUrl,
            backendToken: payload.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
