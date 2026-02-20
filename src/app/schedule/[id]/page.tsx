"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bus, Users, Minus, Plus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleData {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
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

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/schedules/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les informations");
        setLoading(false);
      });
  }, [id]);

  async function handleBooking() {
    if (!session) {
      router.push("/login");
      return;
    }

    setBooking(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: id, seatsBooked: seats }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la réservation");
        setBooking(false);
        return;
      }

      router.push(`/booking/${data.id}/payment`);
    } catch {
      setError("Erreur de connexion");
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-gray-500">Horaire introuvable</p>
      </div>
    );
  }

  const pricePerSeat = schedule.route.price;
  const totalPrice = pricePerSeat * seats;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/destination/${schedule.route.id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux horaires
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-orange-600">{schedule.route.company.name}</p>
        <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold text-gray-900">
          {schedule.route.departure}
          <ArrowRight className="h-5 w-5 text-gray-400" />
          {schedule.route.destination}
        </h1>
      </div>

      <div className="mt-8 space-y-6">
        {/* Bus info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bus className="h-5 w-5 text-orange-600" />
              Informations du bus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Bus</p>
                <p className="font-medium">{schedule.bus.model || schedule.bus.plateNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Plaque</p>
                <p className="font-medium">{schedule.bus.plateNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Départ</p>
                <p className="font-medium">
                  {new Date(schedule.departureTime).toLocaleString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Places disponibles</p>
                <Badge
                  variant={schedule.availableSeats > 10 ? "success" : schedule.availableSeats > 3 ? "warning" : "destructive"}
                >
                  <Users className="mr-1 h-3 w-3" />
                  {schedule.availableSeats} / {schedule.bus.totalSeats}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seat selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nombre de places</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSeats(Math.max(1, seats - 1))}
                disabled={seats <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-4xl font-bold text-gray-900">{seats}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSeats(Math.min(schedule.availableSeats, seats + 1))}
                disabled={seats >= schedule.availableSeats}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-sm text-gray-500">
              {seats} place{seats > 1 ? "s" : ""} &times;{" "}
              {new Intl.NumberFormat("fr-CD").format(pricePerSeat)} CDF
            </p>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total à payer</p>
                <p className="text-3xl font-bold text-orange-600">
                  {new Intl.NumberFormat("fr-CD").format(totalPrice)} CDF
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleBooking}
                disabled={booking}
                className="px-8"
              >
                {booking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Réserver"
                )}
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            {!session && (
              <p className="mt-3 text-sm text-gray-600">
                Vous devez être connecté pour réserver.{" "}
                <Link href="/login" className="font-medium text-orange-600 hover:underline">
                  Se connecter
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
