"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

type PeriodPreset = "7d" | "30d" | "90d";

type TrendPoint = {
  date: string;
  label: string;
  count: number;
  revenue: number;
};

type TrendResponse = {
  points: TrendPoint[];
  summary: {
    totalBookings: number;
    totalRevenue: number;
    previousPeriodBookings: number;
    previousPeriodRevenue: number;
    bookingsChangePercent: number | null;
    revenueChangePercent: number | null;
  };
  meta: {
    from: string;
    to: string;
    granularity: "day" | "week" | "month";
    status: string;
  };
};

function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getRange(preset: PeriodPreset): { from: string; to: string; granularity: "day" | "week" | "month" } {
  const to = new Date();
  const from = new Date(to);
  if (preset === "7d") {
    from.setUTCDate(from.getUTCDate() - 6);
    return { from: formatDateOnly(from), to: formatDateOnly(to), granularity: "day" };
  }
  if (preset === "30d") {
    from.setUTCDate(from.getUTCDate() - 29);
    return { from: formatDateOnly(from), to: formatDateOnly(to), granularity: "day" };
  }
  from.setUTCDate(from.getUTCDate() - 89);
  return { from: formatDateOnly(from), to: formatDateOnly(to), granularity: "week" };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-CD", { maximumFractionDigits: 0 }).format(value);
}

function ChangeBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return <p className="text-xs text-gray-500">{label} : —</p>;
  }
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <p className={`flex items-center gap-1 text-xs ${positive ? "text-green-600" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {label} : {positive ? "+" : ""}
      {value}% vs période précédente
    </p>
  );
}

export function BookingTrendChart() {
  const { data: session } = useSession();
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrend = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError("");

    const range = getRange(preset);
    const params = new URLSearchParams({
      from: range.from,
      to: range.to,
      granularity: range.granularity,
      status: "CONFIRMED",
    });

    try {
      const res = await fetch(`/api/admin/analytics/bookings-trend?${params}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(payload, "Impossible de charger la tendance"));
        setData(null);
        return;
      }
      setData(getApiData<TrendResponse>(payload));
    } catch {
      setError("Impossible de charger la tendance");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [preset, session?.user]);

  useEffect(() => {
    loadTrend();
  }, [loadTrend]);

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Tendance des réservations</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Réservations confirmées sur la période sélectionnée</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["7d", "7 jours"],
              ["30d", "30 jours"],
              ["90d", "90 jours"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={preset === key ? "default" : "outline"}
              onClick={() => setPreset(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Réservations</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalBookings}</p>
                <ChangeBadge value={data.summary.bookingsChangePercent} label="Évolution" />
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Revenus (CDF)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalRevenue)}</p>
                <ChangeBadge value={data.summary.revenueChangePercent} label="Évolution" />
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12 }} width={40} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    width={56}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const numeric = Number(value);
                      if (name === "revenue") return [`${formatCurrency(numeric)} CDF`, "Revenus"];
                      return [numeric, "Réservations"];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    name="Réservations"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenus"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
