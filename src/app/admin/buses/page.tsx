"use client";

import { useEffect, useState } from "react";
import { Bus, Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

interface BusData {
  id: string;
  plateNumber: string;
  model: string | null;
  totalSeats: number;
  company: { id: string; name: string };
}

interface Company {
  id: string;
  name: string;
}

export default function BusesPage() {
  const { data: session } = useSession();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    plateNumber: "",
    model: "",
    totalSeats: 1,
    companyId: "",
  });
  const [error, setError] = useState("");

  async function loadData() {
    Promise.all([
      fetch(toApiUrl("/api/buses")).then((r) => r.json()),
      fetch(toApiUrl("/api/companies")).then((r) => r.json()),
    ]).then(([busData, companyData]) => {
      setBuses(getApiData(busData));
      setCompanies(getApiData(companyData));
      setLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      plateNumber: formData.get("plateNumber"),
      model: formData.get("model") || undefined,
      totalSeats: Number(formData.get("totalSeats")),
      companyId: formData.get("companyId"),
    };

    const res = await fetch(toApiUrl("/api/buses"), {
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
    await loadData();
  }

  async function handleDelete(busId: string) {
    const confirmed = window.confirm("Supprimer ce bus ? Cette action est irréversible.");
    if (!confirmed) return;

    setDeletingId(busId);
    setError("");
    const res = await fetch(toApiUrl(`/api/buses/${busId}`), {
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
    await loadData();
  }

  function startEdit(bus: BusData) {
    setEditingId(bus.id);
    setError("");
    setEditForm({
      plateNumber: bus.plateNumber,
      model: bus.model ?? "",
      totalSeats: bus.totalSeats,
      companyId: bus.company.id,
    });
  }

  async function handleUpdate(busId: string) {
    setUpdatingId(busId);
    setError("");
    const res = await fetch(toApiUrl(`/api/buses/${busId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(session?.user?.backendToken
          ? { Authorization: `Bearer ${session.user.backendToken}` }
          : {}),
      },
      body: JSON.stringify({
        plateNumber: editForm.plateNumber,
        model: editForm.model || undefined,
        totalSeats: Number(editForm.totalSeats),
        companyId: editForm.companyId,
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
    await loadData();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl  font-bold text-gray-900">Bus</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les bus des sociétés de transport</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un bus
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nouveau bus</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyId">Société *</Label>
                <select
                  id="companyId"
                  name="companyId"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner une société</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Numéro de plaque *</Label>
                <Input id="plateNumber" name="plateNumber" required placeholder="Ex: KIN-1234-AB" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input id="model" name="model" placeholder="Ex: Mercedes Sprinter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Nombre de places *</Label>
                <Input id="totalSeats" name="totalSeats" type="number" min="1" required placeholder="Ex: 50" />
              </div>
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
      ) : buses.length === 0 ? (
        <div className="mt-12 text-center">
          <Bus className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucun bus enregistré</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {buses.map((bus) => (
            <Card key={bus.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bus.plateNumber}</h3>
                    <p className="text-sm text-gray-500">{bus.model || "—"}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary">{bus.company.name}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">{bus.totalSeats} places</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => startEdit(bus)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      disabled={deletingId === bus.id}
                      onClick={() => handleDelete(bus.id)}
                    >
                      {deletingId === bus.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                </div>
                {editingId === bus.id && (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-3">
                    <Input
                      value={editForm.plateNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, plateNumber: e.target.value }))}
                      placeholder="Numéro de plaque"
                    />
                    <Input
                      value={editForm.model}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, model: e.target.value }))}
                      placeholder="Modèle"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={editForm.totalSeats}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, totalSeats: Number(e.target.value || 1) }))
                      }
                      placeholder="Nombre de places"
                    />
                    <select
                      value={editForm.companyId}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, companyId: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sélectionner une société</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={updatingId === bus.id}
                        onClick={() => handleUpdate(bus.id)}
                      >
                        {updatingId === bus.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
