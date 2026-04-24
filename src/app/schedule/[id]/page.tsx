"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bus, Users, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

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
  seatSelections?: { seatNumber: number }[];
}

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(toApiUrl(`/api/schedules/${id}`))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(getApiErrorMessage(data, "Impossible de charger les informations"));
          setLoading(false);
          return;
        }
        setSchedule(getApiData(data));
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

    if (selectedSeats.length === 0) {
      setError("Choisissez au moins une place");
      setBooking(false);
      return;
    }

    setBooking(true);
    setError("");

    try {
      const res = await fetch(toApiUrl("/api/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.user?.backendToken
            ? { Authorization: `Bearer ${session.user.backendToken}` }
            : {}),
        },
        body: JSON.stringify({ scheduleId: id, selectedSeats }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(getApiErrorMessage(data, "Erreur lors de la réservation"));
        setBooking(false);
        return;
      }

      router.push(`/booking/${getApiData<{ id: string }>(data).id}/payment`);
    } catch {
      setError("Erreur de connexion");
      setBooking(false);
    }
  }

  function toggleSeat(seatNumber: number) {
    if (!schedule) return;
    const takenSet = new Set((schedule.seatSelections ?? []).map((s) => s.seatNumber));
    if (takenSet.has(seatNumber)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber].sort((a, b) => a - b)
    );
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
  const totalPrice = pricePerSeat * selectedSeats.length;
  const takenSeats = new Set((schedule.seatSelections ?? []).map((s) => s.seatNumber));
  const allSeatNumbers = Array.from({ length: schedule.bus.totalSeats }, (_, i) => i + 1);

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
            <CardTitle className="text-lg">Choisir les places</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
              {allSeatNumbers.map((seatNumber) => {
                const isTaken = takenSeats.has(seatNumber);
                const isSelected = selectedSeats.includes(seatNumber);
                return (
                  <button
                    key={seatNumber}
                    type="button"
                    disabled={isTaken || booking}
                    onClick={() => toggleSeat(seatNumber)}
                    className={`rounded-md border px-2 py-2 text-sm font-medium transition ${
                      isTaken
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : isSelected
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-sm text-gray-500">
              {selectedSeats.length} place{selectedSeats.length > 1 ? "s" : ""} &times;{" "}
              {new Intl.NumberFormat("fr-CD").format(pricePerSeat)} CDF
            </p>
            {selectedSeats.length > 0 && (
              <p className="mt-1 text-center text-sm text-gray-500">
                Places choisies: {selectedSeats.join(", ")}
              </p>
            )}
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
