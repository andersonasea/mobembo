import Link from "next/link";
import Image from "next/image";
import { Bus, MapPin, Clock, CreditCard, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/CompanyLogo";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { fetchServerApi } from "@/lib/server-api";
import type { PublicCompany } from "@/lib/types/public-company";

export const dynamic = "force-dynamic";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-100">
              Billetterie bus en ligne
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Voyagez avec <span className="text-amber-200">Mobembo</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-orange-50">
              Réservez votre billet de bus en quelques clics. Choisissez votre
              société de transport, votre destination et votre horaire.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link href="#companies">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg">
                  Réserver maintenant
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 shadow-2xl sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="/images/marketing/hero-passenger-smile.png"
                alt="Passager affichant son billet Mobembo avec QR code"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/50 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur sm:block">
              <p className="text-xs font-medium text-orange-600">Paiement Mobile Money</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">Billet confirmé en quelques secondes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Bus, title: "Choisir une société", desc: "Parcourez les sociétés de transport disponibles" },
              { icon: MapPin, title: "Choisir la destination", desc: "Sélectionnez votre trajet parmi les destinations" },
              { icon: Clock, title: "Choisir l'horaire", desc: "Trouvez l'horaire qui vous convient le mieux" },
              { icon: CreditCard, title: "Payer & Voyager", desc: "Payez via Mobile Money et recevez votre billet" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                    Étape {i + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
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
                alt="Chauffeur professionnel Mobembo"
                className="aspect-[4/5] rounded-2xl shadow-lg"
              />
              <MarketingImage
                src="/images/marketing/bus-motion.png"
                alt="Bus en route vers votre destination"
                className="aspect-[4/5] rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                <Shield className="h-4 w-4" />
                Voyagez en confiance
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Un service fiable, du guichet à la route
              </h2>
              <p className="mt-4 text-gray-600">
                Mobembo connecte les voyageurs aux sociétés de transport avec une
                expérience simple : recherche, réservation, paiement et billet
                numérique avec QR code.
              </p>
              <MarketingImage
                src="/images/marketing/passengers.png"
                alt="Passagers à bord d'un bus"
                className="mt-8 aspect-[16/7] rounded-2xl shadow-md"
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
              Choisissez votre société de transport pour commencer la réservation
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
                          className="h-14 w-14 flex-shrink-0 transition-opacity group-hover:opacity-90"
                        />
                        <div className="flex flex-1 flex-col">
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
                            {company.name}
                          </h3>

                          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-gray-500">
                            {company.description || "\u00A0"}
                          </p>
                          <div className="mt-auto flex items-center gap-2 pt-3">
                            <Badge variant="secondary">
                              {company._count.routes} destination{company._count.routes > 1 ? "s" : ""}
                            </Badge>
                            <Badge variant="secondary">
                              {company._count.buses} bus
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
