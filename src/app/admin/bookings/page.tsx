"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

interface BookingData {
  id: string;
  seatsBooked: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  schedule: {
    departureTime: string;
    route: {
      departure: string;
      destination: string;
      company: { id: string; name: string };
    };
    bus: { plateNumber: string; model: string | null };
  };
  payment?: {
    id: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    method: "MPESA" | "AIRTEL_MONEY" | "ORANGE_MONEY" | "AFRI_MONEY";
    transactionRef?: string | null;
  } | null;
}

const bookingStatusLabel: Record<BookingData["status"], string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
};

const paymentStatusLabel: Record<NonNullable<BookingData["payment"]>["status"], string> = {
  PENDING: "Paiement en attente",
  SUCCESS: "Payée",
  FAILED: "Paiement échoué",
};

function bookingStatusVariant(status: BookingData["status"]) {
  if (status === "CONFIRMED") return "success" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "secondary" as const;
}

function paymentStatusVariant(status: NonNullable<BookingData["payment"]>["status"]) {
  if (status === "SUCCESS") return "success" as const;
  if (status === "FAILED") return "destructive" as const;
  return "secondary" as const;
}

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingData["status"]>("ALL");

  useEffect(() => {
    async function fetchBookings() {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(toApiUrl("/api/bookings"), {
          headers: session?.user?.backendToken
            ? { Authorization: `Bearer ${session.user.backendToken}` }
            : undefined,
        });
        const payload = await res.json();
        if (!res.ok) {
          setError(getApiErrorMessage(payload, "Impossible de charger les réservations"));
          setLoading(false);
          return;
        }
        setBookings(getApiData(payload));
      } catch {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [session?.user?.backendToken]);

  const companies = Array.from(
    new Map(
      bookings.map((booking) => [
        booking.schedule.route.company.id,
        booking.schedule.route.company.name,
      ])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  const filteredBookings = bookings.filter((booking) => {
    const companyMatch =
      companyFilter === "ALL" || booking.schedule.route.company.id === companyFilter;
    const statusMatch = statusFilter === "ALL" || booking.status === statusFilter;
    return companyMatch && statusMatch;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
      <p className="mt-1 text-sm text-gray-500">Toutes les réservations avec leur statut</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Filtrer par société</p>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">Toutes les sociétés</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Filtrer par statut</p>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | BookingData["status"])}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="mt-12 text-center">
          <CreditCard className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">Aucune réservation pour ces filtres</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{booking.schedule.route.company.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-gray-900">
                      <span className="font-medium">{booking.schedule.route.departure}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{booking.schedule.route.destination}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Départ: {new Date(booking.schedule.departureTime).toLocaleString("fr-FR")}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Client: {booking.user.name} ({booking.user.email})
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Places: {booking.seatsBooked} • Total:{" "}
                      {new Intl.NumberFormat("fr-CD").format(booking.totalPrice)} CDF
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <Badge variant={bookingStatusVariant(booking.status)}>
                      {bookingStatusLabel[booking.status]}
                    </Badge>
                    {booking.payment ? (
                      <Badge variant={paymentStatusVariant(booking.payment.status)}>
                        {paymentStatusLabel[booking.payment.status]}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pas de paiement</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
