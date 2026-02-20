import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Clock, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

async function getCompanyWithRoutes(id: string) {
  return prisma.transportCompany.findUnique({
    where: { id, isActive: true },
    include: {
      routes: {
        include: {
          _count: { select: { schedules: true } },
        },
        orderBy: { departure: "asc" },
      },
    },
  });
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyWithRoutes(id);

  if (!company) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Retour aux sociétés
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
        {company.description && (
          <p className="mt-2 text-gray-500">{company.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">{company.phone} &middot; {company.email}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Destinations disponibles</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choisissez votre trajet pour voir les horaires disponibles
        </p>
      </div>

      {company.routes.length === 0 ? (
        <div className="mt-12 text-center">
          <MapPin className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucune destination disponible
          </h3>
          <p className="mt-2 text-gray-500">
            Cette société n&apos;a pas encore enregistré de destinations.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {company.routes.map((route) => (
            <Link key={route.id} href={`/destination/${route.id}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-orange-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 text-gray-900">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{route.departure}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{route.destination}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {route.durationMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(route.durationMinutes / 60)}h{route.durationMinutes % 60 > 0 ? `${route.durationMinutes % 60}min` : ""}
                        </span>
                      )}
                      <span>{route._count.schedules} horaire{route._count.schedules > 1 ? "s" : ""}</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      {formatPrice(route.price.toNumber())}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
