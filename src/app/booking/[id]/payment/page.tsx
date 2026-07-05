"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Loader2, CheckCircle, Smartphone } from "lucide-react";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import { genderLabel, type PassengerDetails } from "@/lib/passenger";

interface BookingData {
  id: string;
  seatsBooked: number;
  seatSelections?: PassengerDetails[];
  totalPrice: number;
  status: string;
  schedule: {
    departureTime: string;
    route: {
      departure: string;
      destination: string;
      company: { name: string };
    };
    bus: { model: string | null; plateNumber: string };
  };
  payment?: {
    id: string;
    status: string;
    method: string;
    transactionRef: string | null;
  };
}

const PAYMENT_METHODS = [
  { id: "MPESA", name: "M-Pesa", color: "bg-red-500" },
  { id: "AIRTEL_MONEY", name: "Airtel Money", color: "bg-red-600" },
  { id: "ORANGE_MONEY", name: "Orange Money", color: "bg-orange-500" },
  { id: "AFRI_MONEY", name: "Afri Money", color: "bg-blue-600" },
] as const;

function isPaymentFullyConfirmed(booking: BookingData): boolean {
  return booking.status === "CONFIRMED" && booking.payment?.status === "SUCCESS";
}

const POLL_STEPS_MS = [3000, 4000, 6000, 8000, 10000, 12000];
const MAX_POLL_DURATION_MS = 180000;

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const backendToken = session?.user?.backendToken;
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [method, setMethod] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(toApiUrl(`/api/bookings/${id}`), {
      headers: backendToken ? { Authorization: `Bearer ${backendToken}` } : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        setBooking(getApiData(data));
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger la réservation");
        setLoading(false);
      });
  }, [backendToken, id]);

  async function fetchBookingStatus(options?: { silent?: boolean }) {
    if (!backendToken) return null;
    if (!options?.silent) setCheckingStatus(true);
    try {
      const res = await fetch(toApiUrl(`/api/bookings/${id}`), {
        headers: { Authorization: `Bearer ${backendToken}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      const updatedBooking = getApiData<BookingData>(data);
      setBooking(updatedBooking);
      if (isPaymentFullyConfirmed(updatedBooking)) {
        setPaymentConfirmed(true);
        setPollTimedOut(false);
      }
      return updatedBooking;
    } catch {
      return null;
    } finally {
      if (!options?.silent) setCheckingStatus(false);
    }
  }

  async function refreshBookingStatus() {
    await fetchBookingStatus();
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setPaying(true);
    setError("");

    try {
      const res = await fetch(toApiUrl("/api/payments"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.user?.backendToken
            ? { Authorization: `Bearer ${session.user.backendToken}` }
            : {}),
        },
        body: JSON.stringify({
          bookingId: id,
          method,
          phoneNumber: phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(getApiErrorMessage(data, "Erreur lors du paiement"));
        setPaying(false);
        return;
      }

      const bookingRes = await fetch(toApiUrl(`/api/bookings/${id}`), {
        headers: backendToken ? { Authorization: `Bearer ${backendToken}` } : undefined,
        cache: "no-store",
      });
      if (bookingRes.ok) {
        const bookingData = await bookingRes.json();
        const updatedBooking = getApiData<BookingData>(bookingData);
        setBooking(updatedBooking);
        if (isPaymentFullyConfirmed(updatedBooking)) {
          setPaymentConfirmed(true);
        }
      }

      setPaymentInitiated(true);
      setPaying(false);
    } catch {
      setError("Erreur de connexion");
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!paymentInitiated || paymentConfirmed) return;
    let cancelled = false;
    const startedAt = Date.now();
    let step = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const pollOnce = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt > MAX_POLL_DURATION_MS) {
        setPollTimedOut(true);
        return;
      }

      const updatedBooking = await fetchBookingStatus({ silent: true });
      if (updatedBooking && isPaymentFullyConfirmed(updatedBooking)) {
        return;
      }

      const waitMs = POLL_STEPS_MS[Math.min(step, POLL_STEPS_MS.length - 1)];
      step += 1;
      timeoutId = setTimeout(pollOnce, waitMs);
    };

    timeoutId = setTimeout(pollOnce, POLL_STEPS_MS[0]);
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [backendToken, id, paymentConfirmed, paymentInitiated]);

  useEffect(() => {
    if (!paymentConfirmed || !booking) return;

    const qrPayload = {
      reservationId: booking.id,
      reservationStatus: booking.status,
      company: booking.schedule.route.company.name,
      departure: booking.schedule.route.departure,
      destination: booking.schedule.route.destination,
      departureTime: booking.schedule.departureTime,
      seats: booking.seatSelections?.length
        ? booking.seatSelections.map((seat) => seat.seatNumber)
        : booking.seatsBooked,
      passengers: booking.seatSelections?.map((seat) => ({
        seatNumber: seat.seatNumber,
        name: seat.passengerName ?? null,
        age: seat.age ?? null,
        gender: seat.gender ?? null,
        needsAssistance: seat.needsAssistance ?? false,
        assistanceNotes: seat.assistanceNotes ?? null,
      })),
      totalPriceCDF: booking.totalPrice,
      paymentStatus: booking.payment?.status ?? "UNKNOWN",
      paymentMethod: booking.payment?.method ?? "UNKNOWN",
      paymentReference: booking.payment?.transactionRef ?? null,
      passenger: {
        id: session?.user?.id ?? null,
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? null,
      },
      generatedAt: new Date().toISOString(),
    };

    QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 420,
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => setQrCodeDataUrl(""));
  }, [booking, paymentConfirmed, session?.user?.email, session?.user?.id, session?.user?.name]);

  function downloadQrCode() {
    if (!qrCodeDataUrl || !booking) return;
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `reservation-${booking.id}.png`;
    link.click();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (paymentInitiated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        {paymentConfirmed ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Paiement confirmé !</h1>
            <p className="mt-3 text-gray-500">
              Votre paiement a été validé. La réservation est confirmée.
            </p>
            {qrCodeDataUrl ? (
              <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-medium text-gray-700">QR code du billet</p>
                <img
                  src={qrCodeDataUrl}
                  alt="QR code de la réservation"
                  className="mx-auto h-56 w-56 rounded-lg border bg-white p-2"
                />
                <Button onClick={downloadQrCode} className="mt-4 w-full" type="button">
                  Télécharger le QR code
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Génération du QR code...</p>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Paiement initié !</h1>
            <p className="mt-3 text-gray-500">
              Une demande de paiement a été envoyée sur votre téléphone.
              Confirmez-la puis patientez quelques secondes.
            </p>
            {pollTimedOut && (
              <p className="mt-4 text-sm text-amber-700">
                La vérification automatique a pris plus de temps que prévu. Si vous avez déjà
                confirmé sur votre téléphone, cliquez ci-dessous.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={checkingStatus}
              onClick={() => void refreshBookingStatus()}
            >
              {checkingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Vérifier le paiement"
              )}
            </Button>
          </>
        )}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-gray-500">Réservation introuvable</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-gray-900">Paiement</h1>

      <div className="mt-8 space-y-6">
        {/* Booking summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Société</span>
                <span className="font-medium">{booking.schedule.route.company.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trajet</span>
                <span className="font-medium">
                  {booking.schedule.route.departure} → {booking.schedule.route.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Départ</span>
                <span className="font-medium">
                  {new Date(booking.schedule.departureTime).toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bus</span>
                <span className="font-medium">
                  {booking.schedule.bus.model || booking.schedule.bus.plateNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Places</span>
                <span className="font-medium">
                  {booking.seatSelections?.length
                    ? booking.seatSelections.map((seat) => seat.seatNumber).join(", ")
                    : booking.seatsBooked}
                </span>
              </div>
              {booking.seatSelections && booking.seatSelections.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-gray-500">Passagers</p>
                  {booking.seatSelections.map((seat) => (
                    <div key={seat.seatNumber} className="rounded-md bg-gray-50 px-3 py-2 text-sm">
                      <p className="font-medium text-gray-900">
                        Place {seat.seatNumber}
                        {seat.passengerName ? ` — ${seat.passengerName}` : ""}
                      </p>
                      <p className="text-gray-600">
                        {seat.age != null ? `${seat.age} ans` : "Âge non renseigné"}
                        {seat.gender ? ` • ${genderLabel(seat.gender)}` : ""}
                        {seat.needsAssistance ? " • Assistance requise" : ""}
                      </p>
                      {seat.needsAssistance && seat.assistanceNotes && (
                        <p className="text-xs text-gray-500">{seat.assistanceNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-orange-600">
                  {new Intl.NumberFormat("fr-CD").format(booking.totalPrice)} CDF
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mode de paiement</CardTitle>
            <CardDescription>Choisissez votre méthode de paiement mobile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setMethod(pm.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      method === pm.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${pm.color} text-white`}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{pm.name}</span>
                  </button>
                ))}
              </div>

              {method && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+243 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-400">
                    Entrez le numéro associé à votre compte{" "}
                    {PAYMENT_METHODS.find((p) => p.id === method)?.name}
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!method || !phone || paying}
              >
                {paying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Payer ${new Intl.NumberFormat("fr-CD").format(booking.totalPrice)} CDF`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
