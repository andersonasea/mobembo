export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD";
export type LoyaltyTxType = "EARN" | "REDEEM" | "BONUS" | "ADJUST";

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTxType;
  points: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface LoyaltySummary {
  points: number;
  tier: LoyaltyTier;
  nextTier: { name: LoyaltyTier; at: number; remaining: number } | null;
  stats: { confirmedTrips: number; totalSpentCdf: number };
  calculator: {
    pointsPerTripEstimate: number;
    tripsToNextTier: number;
    confirmedTrips: number;
    rewards: Array<{
      id: string;
      label: string;
      cost: number;
      affordable: boolean;
      remaining: number;
    }>;
  };
  transactions: LoyaltyTransaction[];
}

export const TIER_LABELS: Record<LoyaltyTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Argent",
  GOLD: "Or",
};

export const TIER_COLORS: Record<LoyaltyTier, string> = {
  BRONZE: "bg-amber-100 text-amber-800",
  SILVER: "bg-gray-200 text-gray-800",
  GOLD: "bg-yellow-100 text-yellow-900",
};

export const TX_TYPE_LABELS: Record<LoyaltyTxType, string> = {
  EARN: "Gain",
  REDEEM: "Utilisation",
  BONUS: "Bonus",
  ADJUST: "Ajustement",
};
