"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toApiUrl } from "@/lib/api-url";
import { getApiData } from "@/lib/api-response";
import { cn } from "@/lib/utils";

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type TripSearchFormProps = {
  variant?: "hero" | "page";
  initial?: {
    departure?: string;
    destination?: string;
    date?: string;
    maxPrice?: string;
    timeFrom?: string;
    timeTo?: string;
  };
};

type RouteLocations = {
  departures: string[];
  destinations: string[];
};

export function TripSearchForm({ variant = "hero", initial }: TripSearchFormProps) {
  const router = useRouter();
  const isHero = variant === "hero";
  const [departure, setDeparture] = useState(initial?.departure ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIsoDate());
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ?? "");
  const [timeFrom, setTimeFrom] = useState(initial?.timeFrom ?? "");
  const [timeTo, setTimeTo] = useState(initial?.timeTo ?? "");
  const [departures, setDepartures] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(toApiUrl("/api/search/locations"))
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setDepartures(getApiData<RouteLocations>(data).departures);
      })
      .catch(() => {})
      .finally(() => setLoadingLocations(false));
  }, []);

  useEffect(() => {
    if (!departure) {
      setDestinations([]);
      setDestination("");
      return;
    }

    setLoadingDestinations(true);
    const params = new URLSearchParams({ departure });
    fetch(toApiUrl(`/api/search/locations?${params.toString()}`))
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const next = getApiData<RouteLocations>(data).destinations;
        setDestinations(next);
        setDestination((current) =>
          current && next.includes(current) ? current : next.length === 1 ? next[0]! : ""
        );
      })
      .catch(() => setDestinations([]))
      .finally(() => setLoadingDestinations(false));
  }, [departure]);

  function handleDepartureChange(value: string) {
    setDeparture(value);
    setDestination("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!departure || !destination) {
      setError("Choisissez le départ et la destination");
      return;
    }
    const budget = Number(maxPrice);
    if (!maxPrice || Number.isNaN(budget) || budget <= 0) {
      setError("Indiquez un budget maximum valide");
      return;
    }

    const params = new URLSearchParams({
      departure,
      destination,
      date,
      maxPrice: String(budget),
    });
    if (timeFrom) params.set("timeFrom", timeFrom);
    if (timeTo) params.set("timeTo", timeTo);

    router.push(`/search?${params.toString()}`);
  }

  const labelClass = isHero ? "text-orange-100" : "text-gray-700";
  const fieldClass = cn(
    "flex h-10 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500",
    isHero ? "border-white/20 bg-white/95" : "border-gray-300 bg-white"
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isHero
          ? "mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:p-6"
          : "rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="departure" className={labelClass}>
            Départ
          </Label>
          <select
            id="departure"
            value={departure}
            onChange={(e) => handleDepartureChange(e.target.value)}
            className={fieldClass}
            required
            disabled={loadingLocations}
          >
            <option value="">
              {loadingLocations ? "Chargement..." : "Choisir une ville"}
            </option>
            {departures.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination" className={labelClass}>
            Destination
          </Label>
          <select
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={fieldClass}
            required
            disabled={!departure || loadingDestinations}
          >
            <option value="">
              {!departure
                ? "Choisissez d'abord le départ"
                : loadingDestinations
                  ? "Chargement..."
                  : destinations.length === 0
                    ? "Aucune destination"
                    : "Choisir une ville"}
            </option>
            {destinations.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className={labelClass}>
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            min={todayIsoDate()}
            onChange={(e) => setDate(e.target.value)}
            className={isHero ? "border-white/20 bg-white/95" : ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice" className={labelClass}>
            Budget max (par place)
          </Label>
          <Input
            id="maxPrice"
            type="number"
            min={1}
            placeholder="CDF"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={isHero ? "border-white/20 bg-white/95" : ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeFrom" className={labelClass}>
            À partir de (optionnel)
          </Label>
          <Input
            id="timeFrom"
            type="time"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
            className={isHero ? "border-white/20 bg-white/95" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeTo" className={labelClass}>
            Jusqu&apos;à (optionnel)
          </Label>
          <Input
            id="timeTo"
            type="time"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
            className={isHero ? "border-white/20 bg-white/95" : ""}
          />
        </div>
      </div>

      {error && (
        <p className={`mt-3 text-sm ${isHero ? "text-amber-100" : "text-red-600"}`}>{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={loadingLocations || !departure || !destination}
        className={`mt-4 w-full gap-2 sm:w-auto ${
          isHero ? "bg-white text-orange-600 hover:bg-orange-50" : ""
        }`}
      >
        {loadingLocations ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        Rechercher
      </Button>
    </form>
  );
}
