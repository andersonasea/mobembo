"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Building2, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/CompanyLogo";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import { readImageAsDataUrl } from "@/lib/read-image-data-url";

interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  description: string | null;
  logo: string | null;
  isActive: boolean;
  _count: { buses: number; routes: number };
}

type LogoFieldProps = {
  name: string;
  logo: string | null;
  onChange: (logo: string | null) => void;
  onError: (message: string) => void;
};

function LogoField({ name, logo, onChange, onError }: LogoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      onChange(await readImageAsDataUrl(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Impossible de lire l'image");
    }
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>Logo de la société</Label>
      <div className="flex flex-wrap items-center gap-4">
        <CompanyLogo name={name || "Société"} logo={logo} className="h-16 w-16" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            {logo ? "Changer le logo" : "Ajouter un logo"}
          </Button>
          {logo && (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
              Supprimer
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-gray-500">JPEG, PNG ou WebP — max 350 Ko</p>
    </div>
  );
}

export default function CompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createLogo, setCreateLogo] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    logo: null as string | null,
    isActive: true,
  });
  const [error, setError] = useState("");

  const fetchCompanies = useCallback(async () => {
    const res = await fetch(toApiUrl("/api/companies"));
    const data = await res.json();
    setCompanies(getApiData(data));
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchCompanies(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address") || undefined,
      description: formData.get("description") || undefined,
      ...(createLogo ? { logo: createLogo } : {}),
    };

    const res = await fetch(toApiUrl("/api/companies"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.user?.backendToken
          ? { Authorization: `Bearer ${session.user.backendToken}` }
          : {}),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(getApiErrorMessage(err, "Erreur lors de la création"));
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    setCreateLogo(null);
    setCreateName("");
    fetchCompanies();
  }

  function startEdit(company: Company) {
    setEditingId(company.id);
    setError("");
    setEditForm({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address ?? "",
      description: company.description ?? "",
      logo: company.logo,
      isActive: company.isActive,
    });
  }

  async function handleUpdate(companyId: string) {
    setUpdatingId(companyId);
    setError("");

    const res = await fetch(toApiUrl(`/api/companies/${companyId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(session?.user?.backendToken
          ? { Authorization: `Bearer ${session.user.backendToken}` }
          : {}),
      },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address || undefined,
        description: editForm.description || undefined,
        isActive: editForm.isActive,
        logo: editForm.logo,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(getApiErrorMessage(err, "Erreur lors de la modification"));
      setUpdatingId(null);
      return;
    }

    setUpdatingId(null);
    setEditingId(null);
    fetchCompanies();
  }

  async function handleDelete(companyId: string) {
    const confirmed = window.confirm("Supprimer cette société ? Cette action est irréversible.");
    if (!confirmed) return;

    setDeletingId(companyId);
    setError("");
    const res = await fetch(toApiUrl(`/api/companies/${companyId}`), {
      method: "DELETE",
      headers: session?.user?.backendToken
        ? { Authorization: `Bearer ${session.user.backendToken}` }
        : undefined,
    });

    if (!res.ok) {
      const err = await res.json();
      setError(getApiErrorMessage(err, "Erreur lors de la suppression"));
      setDeletingId(null);
      return;
    }

    setDeletingId(null);
    fetchCompanies();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sociétés de Transport</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les sociétés ayant souscrit au système</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setCreateLogo(null);
            setCreateName("");
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nouvelle société</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Nom de la société"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required placeholder="contact@societe.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" name="phone" required placeholder="+243 ..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" name="address" placeholder="Adresse physique" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Brève description de la société" />
              </div>
              <LogoField
                name={createName}
                logo={createLogo}
                onChange={setCreateLogo}
                onError={setError}
              />
              {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
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

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : companies.length === 0 ? (
        <div className="mt-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucune société enregistrée</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {companies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <CompanyLogo name={company.name} logo={company.logo} className="h-12 w-12 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.email}</p>
                      <p className="text-sm text-gray-500">{company.phone}</p>
                      {company.address && (
                        <p className="text-sm text-gray-400">{company.address}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={company.isActive ? "success" : "destructive"}>
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary">{company._count.buses} bus</Badge>
                  <Badge variant="secondary">{company._count.routes} destination(s)</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => startEdit(company)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    disabled={deletingId === company.id}
                    onClick={() => handleDelete(company.id)}
                  >
                    {deletingId === company.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Supprimer
                  </Button>
                </div>
                {editingId === company.id && (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-3">
                    <LogoField
                      name={editForm.name}
                      logo={editForm.logo}
                      onChange={(logo) => setEditForm((prev) => ({ ...prev, logo }))}
                      onError={setError}
                    />
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom"
                    />
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                    />
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Téléphone"
                    />
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse"
                    />
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))
                        }
                      />
                      Société active
                    </label>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={updatingId === company.id}
                        onClick={() => handleUpdate(company.id)}
                      >
                        {updatingId === company.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
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
