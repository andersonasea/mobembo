"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleData {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  availableSeats: number;
  status: string;
  route: {
    departure: string;
    destination: string;
    company: { name: string };
  };
  bus: { plateNumber: string; model: string | null; totalSeats: number };
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
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/schedules").then((r) => r.json()),
      fetch("/api/routes").then((r) => r.json()),
      fetch("/api/buses").then((r) => r.json()),
    ]).then(([scheduleData, routeData, busData]) => {
      setSchedules(scheduleData);
      setRoutes(routeData);
      setBuses(busData);
      setLoading(false);
    });
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

    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    const updated = await fetch("/api/schedules").then((r) => r.json());
    setSchedules(updated);
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
