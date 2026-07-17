"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-response";

export type PrelaunchLeadSource =
  | "GENERAL"
  | "PARTNER"
  | "PILOT_KINSHASA_KIKWIT";

type PrelaunchLeadFormProps = {
  source: PrelaunchLeadSource;
  title: string;
  description: string;
  submitLabel: string;
  partner?: boolean;
  routeSurvey?: boolean;
};

export function PrelaunchLeadForm({
  source,
  title,
  description,
  submitLabel,
  partner = false,
  routeSurvey = false,
}: PrelaunchLeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      // Same-origin Next.js proxy → backend (uses API_URL at request time on Vercel)
      const response = await fetch("/api/prelaunch/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          companyName: partner ? data.get("companyName") : undefined,
          preferredRoute: routeSurvey
            ? data.get("preferredRoute") || "Kinshasa - Kikwit"
            : undefined,
          message: data.get("message") || undefined,
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });
      const raw = await response.text();
      let payload: unknown = null;
      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(
          response.ok
            ? "Réponse serveur invalide"
            : "Service d'inscription indisponible. Réessayez dans un instant."
        );
      }
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(payload, "Impossible d'enregistrer votre inscription")
        );
      }
      form.reset();
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'enregistrer votre inscription"
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-xl">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-bold text-slate-950">
          Inscription confirmée
        </h2>
        <p className="mt-2 text-slate-600">
          Merci ! Vous recevrez les prochaines nouvelles du lancement Mobembo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/15 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${source}-name`}>Nom complet</Label>
          <Input
            id={`${source}-name`}
            name="name"
            autoComplete="name"
            minLength={2}
            required
            placeholder="Votre nom"
          />
        </div>

        {partner && (
          <div className="space-y-2">
            <Label htmlFor={`${source}-company`}>Société de transport</Label>
            <Input
              id={`${source}-company`}
              name="companyName"
              minLength={2}
              required
              placeholder="Nom de votre société"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${source}-phone`}>Téléphone / WhatsApp</Label>
            <Input
              id={`${source}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              minLength={9}
              required
              placeholder="+243..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${source}-email`}>E-mail (optionnel)</Label>
            <Input
              id={`${source}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        {routeSurvey && (
          <div className="space-y-2">
            <Label htmlFor={`${source}-route`}>
              Quel trajet souhaitez-vous réserver ensuite ?
            </Label>
            <Input
              id={`${source}-route`}
              name="preferredRoute"
              placeholder="Ex. Kinshasa - Matadi"
            />
          </div>
        )}

        {partner && (
          <div className="space-y-2">
            <Label htmlFor={`${source}-message`}>Votre besoin (optionnel)</Label>
            <textarea
              id={`${source}-message`}
              name="message"
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
              placeholder="Flotte, lignes exploitées, besoin de digitalisation..."
            />
          </div>
        )}

        <div className="hidden" aria-hidden="true">
          <Label htmlFor={`${source}-website`}>Site web</Label>
          <Input
            id={`${source}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label className="flex items-start gap-3 text-xs leading-5 text-slate-600">
          <input
            name="consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-orange-600"
          />
          J’accepte d’être contacté(e) par Mobembo au sujet du pré-lancement.
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
