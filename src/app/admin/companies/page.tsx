"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  description: string | null;
  isActive: boolean;
  _count: { buses: number; routes: number };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCompanies = useCallback(async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
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
    };

    const res = await fetch("/api/companies", {
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
    fetchCompanies();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sociétés de Transport</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les sociétés ayant souscrit au système</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
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
                <Input id="name" name="name" required placeholder="Nom de la société" />
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.email}</p>
                    <p className="text-sm text-gray-500">{company.phone}</p>
                    {company.address && (
                      <p className="text-sm text-gray-400">{company.address}</p>
                    )}
                  </div>
                  <Badge variant={company.isActive ? "success" : "destructive"}>
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary">{company._count.buses} bus</Badge>
                  <Badge variant="secondary">{company._count.routes} destination(s)</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
