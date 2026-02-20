import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, ArrowRight, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

async function getRouteWithSchedules(id: string) {
  return prisma.route.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      schedules: {
        where: {
          status: "ACTIVE",
          departureTime: { gte: new Date() },
          availableSeats: { gt: 0 },
        },
        include: {
          bus: { select: { plateNumber: true, model: true, totalSeats: true } },
        },
        orderBy: { departureTime: "asc" },
      },
    },
  });
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const route = await getRouteWithSchedules(id);

  if (!route) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/company/${route.company.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à {route.company.name}
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-orange-600">{route.company.name}</p>
        <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold text-gray-900">
          {route.departure}
          <ArrowRight className="h-6 w-6 text-gray-400" />
          {route.destination}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span className="font-semibold text-lg text-orange-600">
            {formatPrice(route.price.toNumber())} / place
          </span>
          {route.durationMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {Math.floor(route.durationMinutes / 60)}h{route.durationMinutes % 60 > 0 ? `${route.durationMinutes % 60}min` : ""}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Horaires disponibles</h2>
        <p className="mt-1 text-sm text-gray-500">
          Sélectionnez un horaire pour voir les places disponibles et réserver
        </p>
      </div>

      {route.schedules.length === 0 ? (
        <div className="mt-12 text-center">
          <Calendar className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucun horaire disponible
          </h3>
          <p className="mt-2 text-gray-500">
            Il n&apos;y a pas d&apos;horaires disponibles pour ce trajet actuellement.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {route.schedules.map((schedule) => (
            <Link key={schedule.id} href={`/schedule/${schedule.id}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-orange-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(schedule.departureTime)}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span>Bus: {schedule.bus.model || schedule.bus.plateNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={schedule.availableSeats > 10 ? "success" : schedule.availableSeats > 3 ? "warning" : "destructive"}
                      >
                        <Users className="mr-1 h-3 w-3" />
                        {schedule.availableSeats} place{schedule.availableSeats > 1 ? "s" : ""}
                      </Badge>
                      <p className="mt-2 text-sm text-gray-400">
                        sur {schedule.bus.totalSeats}
                      </p>
                    </div>
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
