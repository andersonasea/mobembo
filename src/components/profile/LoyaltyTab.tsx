"use client";

import { useEffect, useState } from "react";
import { Gift, Loader2, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";
import {
  TIER_COLORS,
  TIER_LABELS,
  TX_TYPE_LABELS,
  type LoyaltySummary,
} from "@/lib/loyalty";

const LOYALTY_API = "/api/users/me/loyalty";

export function LoyaltyTab() {
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(LOYALTY_API)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(getApiErrorMessage(data, "Impossible de charger vos points"));
          setLoading(false);
          return;
        }
        setSummary(getApiData<LoyaltySummary>(data));
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos points");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !summary) {
    return <p className="text-sm text-red-600">{error || "Données indisponibles"}</p>;
  }

  const tierStart =
    summary.tier === "BRONZE" ? 0 : summary.tier === "SILVER" ? 500 : 2000;
  const tierEnd = summary.nextTier?.at ?? summary.points;
  const barPercent =
    summary.nextTier && tierEnd > tierStart
      ? Math.min(100, Math.round(((summary.points - tierStart) / (tierEnd - tierStart)) * 100))
      : 100;

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">Vos points fidélité</p>
              <p className="text-4xl font-bold text-orange-600">{summary.points}</p>
              <Badge className={`mt-2 ${TIER_COLORS[summary.tier]}`}>
                <Star className="mr-1 h-3 w-3" />
                Palier {TIER_LABELS[summary.tier]}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <p>{summary.stats.confirmedTrips} voyage{summary.stats.confirmedTrips > 1 ? "s" : ""} confirmé{summary.stats.confirmedTrips > 1 ? "s" : ""}</p>
              <p className="mt-1">
                {new Intl.NumberFormat("fr-CD").format(summary.stats.totalSpentCdf)} CDF dépensés
              </p>
            </div>
          </div>

          {summary.nextTier && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-gray-600">
                <span>{TIER_LABELS[summary.tier]}</span>
                <span>
                  {summary.nextTier.remaining} pts vers {TIER_LABELS[summary.nextTier.name]}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${barPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Calculateur bonus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            En moyenne, vous gagnez environ{" "}
            <strong>{summary.calculator.pointsPerTripEstimate} points</strong> par voyage.
          </p>
          {summary.nextTier && summary.calculator.tripsToNextTier > 0 && (
            <p>
              Encore environ{" "}
              <strong>{summary.calculator.tripsToNextTier} voyage{summary.calculator.tripsToNextTier > 1 ? "s" : ""}</strong>{" "}
              pour atteindre le palier {TIER_LABELS[summary.nextTier.name]}.
            </p>
          )}
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <p className="font-medium text-gray-800">Comment gagner des points ?</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>+50 pts par voyage confirmé</li>
              <li>+1 pt par 1 000 CDF dépensés</li>
              <li>+10 pts bonus si plusieurs places</li>
              <li>Bonus palier Argent (+100) et Or (+250)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-orange-600" />
            Récompenses disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.calculator.rewards.map((reward) => (
            <div
              key={reward.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                reward.affordable ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{reward.label}</p>
                <p className="text-sm text-gray-500">{reward.cost} points</p>
              </div>
              {reward.affordable ? (
                <Badge variant="success">Disponible</Badge>
              ) : (
                <span className="text-xs text-gray-500">Encore {reward.remaining} pts</span>
              )}
            </div>
          ))}
          <p className="text-xs text-gray-500">
            L&apos;échange de points contre des réductions sera disponible prochainement.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.transactions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun point pour le moment. Confirmez un voyage pour commencer à cumuler !
            </p>
          ) : (
            <div className="space-y-3">
              {summary.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {TX_TYPE_LABELS[tx.type]} •{" "}
                      {new Date(tx.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.points >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.points >= 0 ? "+" : ""}
                    {tx.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
