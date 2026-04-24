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

          const payload = getApiData((await response.json()) as {
            data: {
              token: string;
              user: { id: string; name: string; email: string; role: string };
            };
          });

          if (!payload?.token || !payload.user) return null;

          return {
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
            role: payload.user.role,
            backendToken: payload.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
