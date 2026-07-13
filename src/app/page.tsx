import Link from "next/link";
import Image from "next/image";
import {
  Armchair,
  ArrowRight,
  Building2,
  Bus,
  Handshake,
  MapPinned,
  QrCode,
  Shield,
  Smartphone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/CompanyLogo";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { fetchServerApi } from "@/lib/server-api";
import type { PublicCompany } from "@/lib/types/public-company";

export const dynamic = "force-dynamic";

const bookingSteps = [
  {
    icon: Building2,
    title: "Choisir la société de transport",
    desc: "Comparez les transporteurs partenaires disponibles sur Mobembo.",
  },
  {
    icon: MapPinned,
    title: "Choisir le trajet / destination",
    desc: "Sélectionnez votre ville de départ, destination et horaire.",
  },
  {
    icon: Armchair,
    title: "Choisir la place",
    desc: "Réservez le siège qui vous convient avant le départ.",
  },
  {
    icon: QrCode,
    title: "Payer et recevoir le billet QR",
    desc: "Payez via Mobile Money et obtenez votre billet numérique.",
  },
];

const platformHighlights = [
  {
    icon: Handshake,
    title: "Transporteurs partenaires",
    desc: "Mobembo connecte les voyageurs aux sociétés de transport, sans se présenter comme une compagnie de bus.",
  },
  {
    icon: Smartphone,
    title: "Réservation digitale",
    desc: "Tout le parcours se fait en ligne : choix du trajet, place, paiement et billet.",
  },
  {
    icon: Shield,
    title: "Paiement sécurisé",
    desc: "Mobile Money et suivi du paiement pour confirmer votre réservation.",
  },
];

async function getCompanies() {
  return (
    (await fetchServerApi<PublicCompany[]>("/api/companies?isActive=true")) ?? []
  );
}

export default async function HomePage() {
  const companies = await getCompanies();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.45),transparent_34%),linear-gradient(135deg,rgba(124,45,18,0.85),rgba(2,6,23,0.95)_58%)]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-24">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Réservez auprès des transporteurs avec{" "}
              <span className="text-orange-300">Mobembo</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-orange-50">
              Mobembo est une plateforme qui connecte les voyageurs aux sociétés
              de transport partenaires : choisissez votre compagnie, votre
              trajet, votre place, puis payez pour recevoir votre billet QR.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link href="#companies">
                <Button size="lg" className="bg-orange-500 text-white shadow-lg shadow-orange-950/30 hover:bg-orange-600">
                  Réserver maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Rechercher un billet
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  Créer un compte
                </Button>
              </Link>
            </div>
           
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-4/5 overflow-hidden rounded-4xl border border-white/20 shadow-2xl shadow-black/30 sm:aspect-5/4 lg:aspect-4/5">
              <Image
                src="/images/marketing/hero-passenger-smile.png"
                alt="Voyageur utilisant une plateforme de réservation de billets"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-slate-950/75 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                      Réserver, payer et gérer
                    </p>
                    <p className="mt-1 text-sm text-white">
                      Votre billet QR généré après paiement confirmé.
                    </p>
                  </div>
                  <QrCode className="h-10 w-10 text-orange-300" />
                </div>
              </div>
            </div>
           
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Comment ça marche ?
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Un parcours simple
            </h2>
            <p className="mt-3 text-gray-500">
              Mobembo vous guide étape par étape, de la société de transport au
              billet QR final.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bookingSteps.map((step, i) => (
              <Card key={step.title} className="relative overflow-hidden border-orange-100 bg-linear-to-b from-white to-orange-50/40">
                <CardContent className="p-6">
                  <div className="absolute right-4 top-4 text-5xl font-bold text-orange-100">
                    {i + 1}
                  </div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
                  <step.icon className="h-6 w-6" />
                  </div>
                  <div className="relative mt-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                      Étape {i + 1}
                    </div>
                    <h3 className="mt-1 font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{step.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <MarketingImage
                src="/images/marketing/driver.png"
                alt="Professionnel d'une société de transport partenaire"
                className="aspect-4/5 rounded-2xl shadow-lg"
              />
              <MarketingImage
                src="/images/marketing/bus-interior.png"
                alt="Intérieur d'un bus partenaire"
                className="aspect-4/5 rounded-2xl shadow-lg"
              />
            </div>
            <div>
             
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Une interface unique pour accéder aux transporteurs partenaires
              </h2>
              <p className="mt-4 text-gray-600">
                Mobembo ne remplace pas les sociétés de transport : la plateforme
                les rend plus accessibles. Vous choisissez l&apos;opérateur, la
                destination et la place, puis vous payez en ligne pour recevoir un
                billet QR.
              </p>
              <div className="mt-6 grid gap-3">
                {platformHighlights.map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <MarketingImage
                src="/images/marketing/passengers.png"
                alt="Voyageurs utilisant Mobembo pour préparer leur déplacement"
                className="mt-8 aspect-16/7 rounded-2xl shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Companies */}
      <section id="companies" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Sociétés de Transport
            </h2>
            <p className="mt-2 text-gray-500">
              Choisissez la société partenaire avec laquelle vous souhaitez voyager
            </p>
          </div>

          {companies.length === 0 ? (
            <div className="mt-12 text-center">
              <Bus className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucune société disponible
              </h3>
              <p className="mt-2 text-gray-500">
                Les sociétés de transport seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Link key={company.id} href={`/company/${company.id}`} className="block h-full">
                  <Card className="group h-full cursor-pointer transition-all hover:shadow-md hover:border-orange-300">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex items-start gap-4">
                        <CompanyLogo
                          name={company.name}
                          logo={company.logo}
                          className="h-14 w-14 shrink-0 transition-opacity group-hover:opacity-90"
                        />
                        <div className="flex flex-1 flex-col">
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                            {company.name}
                          </h3>

                          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-gray-500">
                            {company.description || "\u00A0"}
                          </p>
                          <div className="mt-auto flex items-center gap-2 pt-3">
                            <Badge variant="secondary">
                              {company._count.routes} destination{company._count.routes > 1 ? "s" : ""}
                            </Badge>
                            <Badge variant="secondary">
                              {company._count.buses} véhicule{company._count.buses > 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
