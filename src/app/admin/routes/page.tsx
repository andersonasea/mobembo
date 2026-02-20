"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RouteData {
  id: string;
  departure: string;
  destination: string;
  price: number;
  durationMinutes: number | null;
  company: { name: string };
}

interface Company {
  id: string;
  name: string;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/routes").then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([routeData, companyData]) => {
      setRoutes(routeData);
      setCompanies(companyData);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      departure: formData.get("departure"),
      destination: formData.get("destination"),
      price: Number(formData.get("price")),
      durationMinutes: formData.get("durationMinutes") ? Number(formData.get("durationMinutes")) : undefined,
      companyId: formData.get("companyId"),
    };

    const res = await fetch("/api/routes", {
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
    const updated = await fetch("/api/routes").then((r) => r.json());
    setRoutes(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les trajets proposés par les sociétés</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un trajet
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nouveau trajet</CardTitle>
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
                <Label htmlFor="departure">Lieu de départ *</Label>
                <Input id="departure" name="departure" required placeholder="Ex: Kinshasa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input id="destination" name="destination" required placeholder="Ex: Lubumbashi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (CDF) *</Label>
                <Input id="price" name="price" type="number" min="1" required placeholder="Ex: 50000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Durée (minutes)</Label>
                <Input id="durationMinutes" name="durationMinutes" type="number" min="1" placeholder="Ex: 120" />
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
      ) : routes.length === 0 ? (
        <div className="mt-12 text-center">
          <MapPin className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucun trajet enregistré</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{route.departure}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{route.destination}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary">{route.company.name}</Badge>
                  <span className="font-semibold text-orange-600">
                    {new Intl.NumberFormat("fr-CD").format(route.price)} CDF
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
