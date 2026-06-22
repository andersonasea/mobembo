"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bus, Clock, Loader2, Users } from "lucide-react";
import { TripSearchForm } from "@/components/TripSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import { formatDate, formatPrice } from "@/lib/utils";

interface TripResult {
  id: string;
  departureTime: string;
  availableSeats: number;
  route: {
    id: string;
    departure: string;
    destination: string;
    price: number;
    company: { id: string; name: string };
  };
  bus: { plateNumber: string; model: string | null; totalSeats: number };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const departure = searchParams.get("departure") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const date = searchParams.get("date") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const timeFrom = searchParams.get("timeFrom") ?? "";
  const timeTo = searchParams.get("timeTo") ?? "";

  const [trips, setTrips] = useState<TripResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasQuery = departure && destination && date && maxPrice;

  useEffect(() => {
    if (!hasQuery) return;

    const params = new URLSearchParams({
      departure,
      destination,
      date,
      maxPrice,
    });
    if (timeFrom) params.set("timeFrom", timeFrom);
    if (timeTo) params.set("timeTo", timeTo);

    setLoading(true);
    setError("");

    fetch(toApiUrl(`/api/search/trips?${params.toString()}`))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(getApiErrorMessage(data, "Recherche impossible"));
          setTrips([]);
          return;
        }
        setTrips(getApiData<TripResult[]>(data));
      })
      .catch(() => {
        setError("Erreur de connexion");
        setTrips([]);
      })
      .finally(() => setLoading(false));
  }, [hasQuery, departure, destination, date, maxPrice, timeFrom, timeTo]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-gray-900">Rechercher un billet</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comparez les horaires et tarifs de toutes les sociétés de transport
      </p>

      <div className="mt-6">
        <TripSearchForm
          variant="page"
          initial={{ departure, destination, date, maxPrice, timeFrom, timeTo }}
        />
      </div>

      {!hasQuery && (
        <p className="mt-8 text-center text-gray-500">
          Remplissez le formulaire pour lancer une recherche.
        </p>
      )}

      {hasQuery && (
        <div className="mt-8">
          <p className="text-sm text-gray-600">
            Résultats pour{" "}
            <span className="font-medium text-gray-900">
              {departure} → {destination}
            </span>{" "}
            le {date} • budget max {formatPrice(Number(maxPrice))} / place
          </p>

          {loading && (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {!loading && !error && trips.length === 0 && (
            <div className="mt-12 text-center">
              <Bus className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucun billet trouvé pour ces critères</p>
              <p className="mt-2 text-sm text-gray-400">
                Essayez une autre date, un budget plus élevé ou des villes différentes.
              </p>
            </div>
          )}

          {!loading && trips.length > 0 && (
            <div className="mt-6 space-y-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="transition hover:border-orange-300 hover:shadow-sm">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-600">
                        {trip.route.company.name}
                      </p>
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <span>{trip.route.departure}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span>{trip.route.destination}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(trip.departureTime)}
                        </span>
                        <Badge variant="secondary">
                          <Users className="mr-1 h-3 w-3" />
                          {trip.availableSeats} place{trip.availableSeats > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <p className="text-xl font-bold text-orange-600">
                        {formatPrice(trip.route.price)}
                      </p>
                      <p className="text-xs text-gray-500">par place</p>
                      <Link href={`/schedule/${trip.id}`}>
                        <Button>Réserver</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
