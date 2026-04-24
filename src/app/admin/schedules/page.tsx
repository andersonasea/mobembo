"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Loader2, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

interface ScheduleData {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  availableSeats: number;
  status: string;
  route: {
    id: string;
    departure: string;
    destination: string;
    company: { name: string };
  };
  bus: { id: string; plateNumber: string; model: string | null; totalSeats: number };
}

interface RouteData {
  id: string;
  departure: string;
  destination: string;
  company: { name: string };
}

interface BusData {
  id: string;
  plateNumber: string;
  model: string | null;
  totalSeats: number;
  company: { name: string };
}

export default function SchedulesPage() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    routeId: "",
    busId: "",
    departureTime: "",
    arrivalTime: "",
    status: "ACTIVE",
  });
  const [error, setError] = useState("");

  async function loadData() {
    Promise.all([
      fetch(toApiUrl("/api/schedules")).then((r) => r.json()),
      fetch(toApiUrl("/api/routes")).then((r) => r.json()),
      fetch(toApiUrl("/api/buses")).then((r) => r.json()),
    ]).then(([scheduleData, routeData, busData]) => {
      setSchedules(getApiData(scheduleData));
      setRoutes(getApiData(routeData));
      setBuses(getApiData(busData));
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
      routeId: formData.get("routeId"),
      busId: formData.get("busId"),
      departureTime: formData.get("departureTime"),
      arrivalTime: formData.get("arrivalTime") || undefined,
    };

    const res = await fetch(toApiUrl("/api/schedules"), {
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

  function toInputDate(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - tzOffset * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  function startEdit(schedule: ScheduleData) {
    setEditingId(schedule.id);
    setError("");
    setEditForm({
      routeId: schedule.route.id,
      busId: schedule.bus.id,
      departureTime: toInputDate(schedule.departureTime),
      arrivalTime: toInputDate(schedule.arrivalTime),
      status: schedule.status,
    });
  }

  async function handleUpdate(scheduleId: string) {
    setUpdatingId(scheduleId);
    setError("");
    const res = await fetch(toApiUrl(`/api/schedules/${scheduleId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(session?.user?.backendToken
          ? { Authorization: `Bearer ${session.user.backendToken}` }
          : {}),
      },
      body: JSON.stringify({
        routeId: editForm.routeId,
        busId: editForm.busId,
        departureTime: editForm.departureTime,
        arrivalTime: editForm.arrivalTime || undefined,
        status: editForm.status,
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

  async function handleDelete(scheduleId: string) {
    const confirmed = window.confirm("Supprimer cet horaire ? Cette action est irréversible.");
    if (!confirmed) return;

    setDeletingId(scheduleId);
    setError("");
    const res = await fetch(toApiUrl(`/api/schedules/${scheduleId}`), {
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

  const statusLabel: Record<string, string> = {
    ACTIVE: "Actif",
    CANCELLED: "Annulé",
    COMPLETED: "Terminé",
  };

  const statusVariant = (s: string) => {
    if (s === "ACTIVE") return "success" as const;
    if (s === "CANCELLED") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horaires</h1>
          <p className="mt-1 text-sm text-gray-500">Affectez les bus aux trajets avec des horaires précis</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un horaire
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nouvel horaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="routeId">Trajet *</Label>
                <select
                  id="routeId"
                  name="routeId"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un trajet</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.company.name}: {r.departure} → {r.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="busId">Bus *</Label>
                <select
                  id="busId"
                  name="busId"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un bus</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.company.name} - {b.plateNumber} ({b.totalSeats} places)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Heure de départ *</Label>
                <Input id="departureTime" name="departureTime" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Heure d&apos;arrivée</Label>
                <Input id="arrivalTime" name="arrivalTime" type="datetime-local" />
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
      ) : schedules.length === 0 ? (
        <div className="mt-12 text-center">
          <Clock className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucun horaire enregistré</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{schedule.route.company.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-gray-900">
                      <span className="font-medium">{schedule.route.departure}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{schedule.route.destination}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(schedule.departureTime).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Bus: {schedule.bus.model || schedule.bus.plateNumber}</p>
                      <p className="font-medium">{schedule.availableSeats}/{schedule.bus.totalSeats} places</p>
                    </div>
                    <Badge variant={statusVariant(schedule.status)}>
                      {statusLabel[schedule.status] || schedule.status}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => startEdit(schedule)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      disabled={deletingId === schedule.id}
                      onClick={() => handleDelete(schedule.id)}
                    >
                      {deletingId === schedule.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                </div>
                {editingId === schedule.id && (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-3">
                    <select
                      value={editForm.routeId}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, routeId: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sélectionner un trajet</option>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.company.name}: {r.departure} → {r.destination}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.busId}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, busId: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sélectionner un bus</option>
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.company.name} - {b.plateNumber} ({b.totalSeats} places)
                        </option>
                      ))}
                    </select>
                    <Input
                      type="datetime-local"
                      value={editForm.departureTime}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, departureTime: e.target.value }))}
                    />
                    <Input
                      type="datetime-local"
                      value={editForm.arrivalTime}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, arrivalTime: e.target.value }))}
                    />
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="ACTIVE">Actif</option>
                      <option value="CANCELLED">Annulé</option>
                      <option value="COMPLETED">Terminé</option>
                    </select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={updatingId === schedule.id}
                        onClick={() => handleUpdate(schedule.id)}
                      >
                        {updatingId === schedule.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
