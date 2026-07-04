"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserRegistrationTrendChart } from "@/components/admin/UserRegistrationTrendChart";
import { apiAuthHeaders } from "@/lib/api-auth-headers";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import { formatDate } from "@/lib/utils";

type UserRole = "CLIENT" | "ADMIN" | "COMPANY_ADMIN";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  loyaltyTier: string;
  loyaltyPoints: number;
  bookingsCount: number;
  isActive: boolean;
  lastBookingAt: string | null;
  createdAt: string;
}

interface UsersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  activeCount: number;
  newThisMonth: number;
  activeWindowDays: number;
}

const roleLabels: Record<UserRole, string> = {
  CLIENT: "Client",
  ADMIN: "Admin plateforme",
  COMPANY_ADMIN: "Admin société",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"CLIENT" | "ALL">("CLIENT");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      role: roleFilter,
      active: activeFilter,
    });
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(toApiUrl(`/api/admin/users?${params}`), {
        headers: apiAuthHeaders(token),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(json, "Impossible de charger les utilisateurs"));
        setUsers([]);
        return;
      }
      setUsers(getApiData<AdminUser[]>(json));
      setMeta((json.meta as UsersMeta) ?? null);
    } catch {
      setError("Erreur de connexion");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, roleFilter, search, token]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
      <p className="mt-1 text-sm text-gray-500">
        Inscriptions, utilisateurs actifs et recherche par nom, e-mail ou téléphone
      </p>

      {meta && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-gray-900">{meta.total}</p>
              <p className="text-sm text-gray-500">Résultats filtrés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-green-700">{meta.activeCount}</p>
              <p className="text-sm text-gray-500">
                Actifs ({meta.activeWindowDays} derniers jours)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-purple-700">{meta.newThisMonth}</p>
              <p className="text-sm text-gray-500">Nouveaux ce mois</p>
            </CardContent>
          </Card>
        </div>
      )}

      <UserRegistrationTrendChart />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher par nom, e-mail ou téléphone..."
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as "CLIENT" | "ALL");
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="CLIENT">Clients uniquement</option>
              <option value="ALL">Tous les rôles</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value as "all" | "true" | "false");
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Tous</option>
              <option value="true">Actifs seulement</option>
              <option value="false">Inactifs seulement</option>
            </select>
          </form>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-600">{error}</p>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">Utilisateur</th>
                    <th className="px-3 py-2 font-medium">Contact</th>
                    <th className="px-3 py-2 font-medium">Rôle</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 font-medium">Réservations</th>
                    <th className="px-3 py-2 font-medium">Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-3 py-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          Fidélité : {user.loyaltyTier} ({user.loyaltyPoints} pts)
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p>{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone ?? "—"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={user.isActive ? "success" : "secondary"}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <p>{user.bookingsCount}</p>
                        {user.lastBookingAt && (
                          <p className="text-xs text-gray-500">
                            Dernière : {formatDate(user.lastBookingAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Page {meta.page} / {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Précédent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
