"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export function TripSearchForm({ variant = "hero", initial }: TripSearchFormProps) {
  const router = useRouter();
  const isHero = variant === "hero";
  const [departure, setDeparture] = useState(initial?.departure ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIsoDate());
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ?? "");
  const [timeFrom, setTimeFrom] = useState(initial?.timeFrom ?? "");
  const [timeTo, setTimeTo] = useState(initial?.timeTo ?? "");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!departure.trim() || !destination.trim()) {
      setError("Indiquez le départ et la destination");
      return;
    }
    const budget = Number(maxPrice);
    if (!maxPrice || Number.isNaN(budget) || budget <= 0) {
      setError("Indiquez un budget maximum valide");
      return;
    }

    const params = new URLSearchParams({
      departure: departure.trim(),
      destination: destination.trim(),
      date,
      maxPrice: String(budget),
    });
    if (timeFrom) params.set("timeFrom", timeFrom);
    if (timeTo) params.set("timeTo", timeTo);

    router.push(`/search?${params.toString()}`);
  }

  const labelClass = isHero ? "text-orange-100" : "text-gray-700";
  const inputClass = isHero ? "border-white/20 bg-white/95" : "";

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
          <Input
            id="departure"
            placeholder="Ex: Kinshasa"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination" className={labelClass}>
            Destination
          </Label>
          <Input
            id="destination"
            placeholder="Ex: Matadi"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={inputClass}
            required
          />
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className={`mt-3 text-sm ${isHero ? "text-amber-100" : "text-red-600"}`}>{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className={`mt-4 w-full gap-2 sm:w-auto ${
          isHero ? "bg-white text-orange-600 hover:bg-orange-50" : ""
        }`}
      >
        <Search className="h-4 w-4" />
        Rechercher
      </Button>
    </form>
  );
}
