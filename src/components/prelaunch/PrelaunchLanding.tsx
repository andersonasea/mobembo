import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PrelaunchLeadForm,
  type PrelaunchLeadSource,
} from "@/components/prelaunch/PrelaunchLeadForm";

type Highlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type PrelaunchLandingProps = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  form: {
    source: PrelaunchLeadSource;
    title: string;
    description: string;
    submitLabel: string;
    partner?: boolean;
    routeSurvey?: boolean;
  };
  highlights: Highlight[];
  proofTitle: string;
  proofPoints: string[];
};

export function PrelaunchLanding({
  eyebrow,
  title,
  accent,
  description,
  form,
  highlights,
  proofTitle,
  proofPoints,
}: PrelaunchLandingProps) {
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.4),transparent_38%),linear-gradient(135deg,#0f172a,#020617)]" />
        <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit border-orange-400/30 bg-orange-500/15 text-orange-200">
              {eyebrow}
            </Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {title} <span className="text-orange-400">{accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-orange-400" />
                Accès prioritaire
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-400" />
                Données protégées
              </span>
            </div>
          </div>
          <PrelaunchLeadForm {...form} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-orange-100 bg-orange-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
              Ce qui se prépare
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              {proofTitle}
            </h2>
          </div>
          <ul className="space-y-4">
            {proofPoints.map((point) => (
              <li key={point} className="flex gap-3 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Découvrez les autres accès</p>
            <p className="mt-1 text-sm text-slate-400">
              Voyageurs, trajet pilote et transporteurs partenaires.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/bientot" className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200">
              Voyageurs <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/kinshasa-kikwit" className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200">
              Kinshasa–Kikwit <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/partenaires" className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200">
              Transporteurs <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
