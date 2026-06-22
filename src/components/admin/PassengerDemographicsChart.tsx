"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import { isPlatformAdmin } from "@/lib/admin-access";
import { genderLabel, type Gender } from "@/lib/passenger";

type PeriodPreset = "7d" | "30d" | "90d";

type RouteOption = {
  id: string;
  departure: string;
  destination: string;
  company?: { id: string; name: string };
};

type TrendPoint = Record<string, string | number>;

type SummaryItem = {
  segment: string;
  count: number;
  percent: number;
};

type DemographicsResponse = {
  genderTrend: TrendPoint[];
  ageTrend: TrendPoint[];
  genderSummary: SummaryItem[];
  ageSummary: SummaryItem[];
  summary: { totalPassengers: number };
  meta: {
    from: string;
    to: string;
    granularity: string;
    routeId: string | null;
  };
};

const GENDER_COLORS: Record<string, string> = {
  MALE: "#2563eb",
  FEMALE: "#db2777",
  OTHER: "#7c3aed",
  PREFER_NOT_TO_SAY: "#6b7280",
  UNKNOWN: "#d1d5db",
};

const AGE_COLORS: Record<string, string> = {
  "0-17": "#22c55e",
  "18-34": "#0ea5e9",
  "35-49": "#f59e0b",
  "50-64": "#ef4444",
  "65+": "#8b5cf6",
  unknown: "#9ca3af",
};

const AGE_LABELS: Record<string, string> = {
  "0-17": "0-17 ans",
  "18-34": "18-34 ans",
  "35-49": "35-49 ans",
  "50-64": "50-64 ans",
  "65+": "65 ans et +",
  unknown: "Non renseigné",
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

function routeLabel(route: RouteOption, showCompany: boolean) {
  const line = `${route.departure} → ${route.destination}`;
  if (showCompany && route.company?.name) {
    return `${line} (${route.company.name})`;
  }
  return line;
}

function genderChartLabel(key: string) {
  if (key === "UNKNOWN") return "Non renseigné";
  return genderLabel(key as Gender);
}

function SummaryPills({ items, labelFn }: { items: SummaryItem[]; labelFn: (s: string) => string }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">Aucune donnée passager sur cette période.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.segment}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
        >
          {labelFn(item.segment)} : {item.count} ({item.percent}%)
        </span>
      ))}
    </div>
  );
}

export function PassengerDemographicsChart() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const showCompany = isPlatformAdmin(role);
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [routeId, setRouteId] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [data, setData] = useState<DemographicsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/routes")
      .then(async (res) => {
        if (!res.ok) return;
        const payload = await res.json();
        setRoutes(getApiData<RouteOption[]>(payload));
      })
      .catch(() => setRoutes([]));
  }, [session?.user]);

  const loadData = useCallback(async () => {
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
    if (routeId) params.set("routeId", routeId);

    try {
      const res = await fetch(`/api/admin/analytics/passenger-demographics?${params}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(payload, "Impossible de charger les données"));
        setData(null);
        return;
      }
      setData(getApiData<DemographicsResponse>(payload));
    } catch {
      setError("Impossible de charger les données");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [preset, routeId, session?.user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedRoute = routes.find((r) => r.id === routeId);
  const genderKeys = data?.genderSummary.map((item) => item.segment) ?? Object.keys(GENDER_COLORS);
  const ageKeys = data?.ageSummary.map((item) => item.segment) ?? Object.keys(AGE_COLORS);

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Tendance par sexe et âge</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              {selectedRoute
                ? `Ligne : ${routeLabel(selectedRoute, showCompany)}`
                : "Toutes les lignes — passagers des réservations confirmées"}
            </p>
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
        </div>

        <div className="max-w-md">
          <label htmlFor="demo-route-filter" className="mb-1 block text-sm font-medium text-gray-700">
            Filtrer par destination
          </label>
          <select
            id="demo-route-filter"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">Toutes les lignes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {routeLabel(route, showCompany)}
              </option>
            ))}
          </select>
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
            <p className="mb-6 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{data.summary.totalPassengers}</span>{" "}
              passager{data.summary.totalPassengers > 1 ? "s" : ""} sur la période
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Par sexe</h3>
                <SummaryPills items={data.genderSummary} labelFn={genderChartLabel} />
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.genderTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={40} />
                      <Tooltip
                        formatter={(value, name) => [Number(value), genderChartLabel(String(name))]}
                      />
                      <Legend formatter={(value) => genderChartLabel(String(value))} />
                      {genderKeys.map((key) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          stackId="gender"
                          fill={GENDER_COLORS[key] ?? "#94a3b8"}
                          name={key}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">Par tranche d&apos;âge</h3>
                <SummaryPills
                  items={data.ageSummary}
                  labelFn={(segment) => AGE_LABELS[segment] ?? segment}
                />
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.ageTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={40} />
                      <Tooltip
                        formatter={(value, name) => [
                          Number(value),
                          AGE_LABELS[String(name)] ?? String(name),
                        ]}
                      />
                      <Legend formatter={(value) => AGE_LABELS[String(value)] ?? String(value)} />
                      {ageKeys.map((key) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          stackId="age"
                          fill={AGE_COLORS[key] ?? "#94a3b8"}
                          name={key}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
