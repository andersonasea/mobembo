"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bus, Users, Loader2, Accessibility } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import {
  GENDER_OPTIONS,
  type PassengerInput,
  validatePassengers,
} from "@/lib/passenger";

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

function createPassengerDefaults(
  seatNumber: number,
  isSingleSeat: boolean,
  userName?: string | null
): PassengerInput {
  return {
    seatNumber,
    passengerName: isSingleSeat ? userName ?? "" : "",
    age: "",
    needsAssistance: false,
    assistanceNotes: "",
  };
}

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Record<number, PassengerInput>>({});
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

  useEffect(() => {
    setPassengers((prev) => {
      const next: Record<number, PassengerInput> = {};
      const isSingleSeat = selectedSeats.length === 1;
      for (const seat of selectedSeats) {
        next[seat] =
          prev[seat] ?? createPassengerDefaults(seat, isSingleSeat, session?.user?.name);
      }
      return next;
    });
  }, [selectedSeats, session?.user?.name]);

  function updatePassenger(seatNumber: number, patch: Partial<PassengerInput>) {
    setPassengers((prev) => {
      const current = prev[seatNumber];
      if (!current) return prev;
      const updated = { ...current, ...patch };
      if (patch.age !== undefined && typeof patch.age === "number" && patch.age >= 65) {
        updated.needsAssistance = true;
      }
      return { ...prev, [seatNumber]: updated };
    });
  }

  async function handleBooking() {
    if (!session) {
      router.push("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      setError("Choisissez au moins une place");
      return;
    }

    const passengerError = validatePassengers(selectedSeats, passengers);
    if (passengerError) {
      setError(passengerError);
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
        body: JSON.stringify({
          scheduleId: id,
          selectedSeats,
          passengers: selectedSeats.map((seat) => {
            const passenger = passengers[seat];
            return {
              seatNumber: seat,
              passengerName: passenger.passengerName?.trim() || undefined,
              gender: passenger.gender,
              age: passenger.age,
              needsAssistance: passenger.needsAssistance,
              assistanceNotes: passenger.needsAssistance
                ? passenger.assistanceNotes?.trim()
                : undefined,
            };
          }),
        }),
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
                  variant={
                    schedule.availableSeats > 10
                      ? "success"
                      : schedule.availableSeats > 3
                        ? "warning"
                        : "destructive"
                  }
                >
                  <Users className="mr-1 h-3 w-3" />
                  {schedule.availableSeats} / {schedule.bus.totalSeats}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {selectedSeats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations des passagers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSeats.map((seatNumber) => {
                const passenger = passengers[seatNumber];
                if (!passenger) return null;
                return (
                  <div
                    key={seatNumber}
                    className="rounded-lg border border-gray-200 p-4 space-y-4"
                  >
                    <p className="font-medium text-gray-900">Place {seatNumber}</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${seatNumber}`}>Nom (optionnel)</Label>
                        <Input
                          id={`name-${seatNumber}`}
                          value={passenger.passengerName ?? ""}
                          onChange={(e) =>
                            updatePassenger(seatNumber, { passengerName: e.target.value })
                          }
                          placeholder="Nom du passager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`age-${seatNumber}`}>Âge *</Label>
                        <Input
                          id={`age-${seatNumber}`}
                          type="number"
                          min={0}
                          max={120}
                          value={passenger.age}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updatePassenger(seatNumber, {
                              age: raw === "" ? "" : Number(raw),
                            });
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`gender-${seatNumber}`}>Sexe</Label>
                        <select
                          id={`gender-${seatNumber}`}
                          value={passenger.gender ?? ""}
                          onChange={(e) =>
                            updatePassenger(seatNumber, {
                              gender: e.target.value
                                ? (e.target.value as PassengerInput["gender"])
                                : undefined,
                            })
                          }
                          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Sélectionner</option>
                          {GENDER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={passenger.needsAssistance}
                        onChange={(e) =>
                          updatePassenger(seatNumber, {
                            needsAssistance: e.target.checked,
                            assistanceNotes: e.target.checked
                              ? passenger.assistanceNotes
                              : "",
                          })
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="flex items-center gap-2">
                        <Accessibility className="h-4 w-4 text-orange-600" />
                        Besoin d&apos;assistance (personnes âgées, mobilité réduite…)
                      </span>
                    </label>
                    {passenger.needsAssistance && (
                      <div className="space-y-2">
                        <Label htmlFor={`assistance-${seatNumber}`}>
                          Type d&apos;assistance *
                        </Label>
                        <Input
                          id={`assistance-${seatNumber}`}
                          value={passenger.assistanceNotes ?? ""}
                          onChange={(e) =>
                            updatePassenger(seatNumber, { assistanceNotes: e.target.value })
                          }
                          placeholder="Ex: aide à l'embarquement, siège prioritaire"
                          required
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="text-xs text-gray-500">
                Les personnes de 65 ans et plus se voient proposer l&apos;assistance
                automatiquement. Ces informations aident la compagnie à préparer
                l&apos;embarquement.
              </p>
            </CardContent>
          </Card>
        )}

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
                disabled={booking || selectedSeats.length === 0}
                className="px-8"
              >
                {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Réserver"}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
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
