"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { apiAuthHeaders } from "@/lib/api-auth-headers";
import { toApiUrl } from "@/lib/api-url";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

type PeriodPreset = "7d" | "30d" | "12w" | "12m" | "5y";

type TrendPoint = {
  date: string;
  label: string;
  count: number;
  cumulative: number;
};

type TrendResponse = {
  points: TrendPoint[];
  summary: {
    totalRegistrations: number;
    previousPeriodRegistrations: number;
    changePercent: number | null;
  };
  meta: {
    from: string;
    to: string;
    granularity: "day" | "week" | "month" | "year";
  };
};

const PRESET_LABELS: Record<PeriodPreset, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "12w": "12 semaines",
  "12m": "12 mois",
  "5y": "5 ans",
};

function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getRange(preset: PeriodPreset): {
  from: string;
  to: string;
  granularity: TrendResponse["meta"]["granularity"];
} {
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
  if (preset === "12w") {
    from.setUTCDate(from.getUTCDate() - 7 * 11);
    return { from: formatDateOnly(from), to: formatDateOnly(to), granularity: "week" };
  }
  if (preset === "12m") {
    from.setUTCMonth(from.getUTCMonth() - 11);
    from.setUTCDate(1);
    return { from: formatDateOnly(from), to: formatDateOnly(to), granularity: "month" };
  }
  from.setUTCFullYear(from.getUTCFullYear() - 4);
  from.setUTCMonth(0, 1);
  return { from: formatDateOnly(from), to: formatDateOnly(to), granularity: "year" };
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <p className="text-xs text-gray-500">Évolution : —</p>;
  }
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <p className={`flex items-center gap-1 text-xs ${positive ? "text-green-600" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {positive ? "+" : ""}
      {value}% vs période précédente
    </p>
  );
}

export function UserRegistrationTrendChart() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;
  const [preset, setPreset] = useState<PeriodPreset>("12m");
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrend = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    const range = getRange(preset);
    const params = new URLSearchParams({
      from: range.from,
      to: range.to,
      granularity: range.granularity,
    });

    try {
      const res = await fetch(toApiUrl(`/api/admin/analytics/users-trend?${params}`), {
        headers: apiAuthHeaders(token),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(json, "Impossible de charger les tendances"));
        setData(null);
        return;
      }
      setData(getApiData<TrendResponse>(json));
    } catch {
      setError("Erreur de connexion");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [preset, token]);

  useEffect(() => {
    void fetchTrend();
  }, [fetchTrend]);

  const useBarChart = preset === "12m" || preset === "5y";

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Tendances d&apos;inscription</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESET_LABELS) as PeriodPreset[]).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={preset === key ? "default" : "outline"}
              onClick={() => setPreset(key)}
            >
              {PRESET_LABELS[key]}
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
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : data ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-2xl font-bold text-purple-900">
                  {data.summary.totalRegistrations}
                </p>
                <p className="text-sm text-purple-700">Nouvelles inscriptions</p>
                <ChangeBadge value={data.summary.changePercent} />
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {data.points.at(-1)?.cumulative ?? 0}
                </p>
                <p className="text-sm text-gray-600">Total cumulé sur la période</p>
                <p className="text-xs text-gray-500">
                  {data.meta.from} → {data.meta.to}
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {useBarChart ? (
                  <BarChart data={data.points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Inscriptions" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={data.points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Inscriptions"
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
