"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiAuthHeaders } from "@/lib/api-auth-headers";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import { formatDate } from "@/lib/utils";

interface CompanyOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface CompanyAdmin {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyId: string | null;
  companyName: string | null;
  createdAt: string;
}

export default function CompanyAdminsPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [admins, setAdmins] = useState<CompanyAdmin[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCompanyId, setFilterCompanyId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    password: "",
  });
  const [error, setError] = useState("");

  const fetchCompanies = useCallback(async () => {
    const res = await fetch(toApiUrl("/api/companies"));
    if (!res.ok) return;
    const data = await res.json();
    setCompanies(getApiData<CompanyOption[]>(data));
  }, []);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const params = filterCompanyId ? `?companyId=${encodeURIComponent(filterCompanyId)}` : "";
    const res = await fetch(toApiUrl(`/api/admin/company-admins${params}`), {
      headers: apiAuthHeaders(token),
    });
    if (res.ok) {
      const data = await res.json();
      setAdmins(getApiData<CompanyAdmin[]>(data));
    }
    setLoading(false);
  }, [filterCompanyId, token]);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!token) return;
    void fetchAdmins();
  }, [fetchAdmins, token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      password: formData.get("password"),
      companyId: formData.get("companyId"),
    };

    const res = await fetch(toApiUrl("/api/admin/company-admins"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...apiAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(getApiErrorMessage(err, "Erreur lors de la création"));
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    void fetchAdmins();
  }

  function startEdit(admin: CompanyAdmin) {
    setEditingId(admin.id);
    setError("");
    setEditForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone ?? "",
      companyId: admin.companyId ?? "",
      password: "",
    });
  }

  async function handleUpdate(adminId: string) {
    setUpdatingId(adminId);
    setError("");

    const payload: Record<string, string> = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      companyId: editForm.companyId,
    };
    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    const res = await fetch(toApiUrl(`/api/admin/company-admins/${adminId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...apiAuthHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(getApiErrorMessage(err, "Erreur lors de la modification"));
      setUpdatingId(null);
      return;
    }

    setUpdatingId(null);
    setEditingId(null);
    void fetchAdmins();
  }

  async function handleDelete(adminId: string) {
    const confirmed = window.confirm(
      "Supprimer cet administrateur ? Il ne pourra plus accéder au back-office."
    );
    if (!confirmed) return;

    setDeletingId(adminId);
    setError("");

    const res = await fetch(toApiUrl(`/api/admin/company-admins/${adminId}`), {
      method: "DELETE",
      headers: apiAuthHeaders(token),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(getApiErrorMessage(err, "Erreur lors de la suppression"));
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    void fetchAdmins();
  }

  const activeCompanies = companies.filter((company) => company.isActive);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admins société</h1>
          <p className="mt-1 text-sm text-gray-500">
            Créez et gérez les comptes administrateurs de chaque société de transport
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un admin
        </Button>
      </div>

      <div className="mt-6 max-w-xs">
        <Label htmlFor="filterCompany">Filtrer par société</Label>
        <select
          id="filterCompany"
          value={filterCompanyId}
          onChange={(e) => setFilterCompanyId(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Toutes les sociétés</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nouvel administrateur société</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input id="name" name="name" required placeholder="Jean Dupont" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required placeholder="admin@societe.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" placeholder="+243 ..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyId">Société *</Label>
                <select
                  id="companyId"
                  name="companyId"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choisir une société
                  </option>
                  {activeCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving || activeCompanies.length === 0}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && !showForm && !editingId && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : admins.length === 0 ? (
        <div className="mt-12 text-center">
          <UserCog className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucun administrateur société enregistré</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {admins.map((admin) => (
            <Card key={admin.id}>
              <CardContent className="p-5">
                {editingId === admin.id ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nouveau mot de passe</Label>
                      <Input
                        type="password"
                        placeholder="Laisser vide pour ne pas changer"
                        value={editForm.password}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Société *</Label>
                      <select
                        value={editForm.companyId}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, companyId: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                      >
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
                    <div className="flex gap-2 sm:col-span-2">
                      <Button
                        type="button"
                        onClick={() => handleUpdate(admin.id)}
                        disabled={updatingId === admin.id}
                      >
                        {updatingId === admin.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        Enregistrer
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      {admin.phone && <p className="text-sm text-gray-500">{admin.phone}</p>}
                      <p className="mt-2 text-xs text-gray-400">
                        Créé le {formatDate(admin.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary">{admin.companyName ?? "Sans société"}</Badge>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => startEdit(admin)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(admin.id)}
                          disabled={deletingId === admin.id}
                        >
                          {deletingId === admin.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
