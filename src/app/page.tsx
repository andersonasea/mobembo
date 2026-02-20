import Link from "next/link";
import { Bus, MapPin, Clock, CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function getCompanies() {
  return prisma.transportCompany.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { routes: true, buses: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const companies = await getCompanies();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Voyagez avec <span className="text-amber-200">Mobembo</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-orange-100">
              Réservez votre billet de bus en quelques clics. Choisissez votre
              société de transport, votre destination et votre horaire.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="#companies">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg">
                  Réserver maintenant
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/30 bg-orange-600 text-white hover:bg-white/10">
                  Créer un compte
                </Button>
              </Link>
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
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                          <Bus className="h-7 w-7" />
                        </div>
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
