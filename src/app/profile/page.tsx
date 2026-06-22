"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, User } from "lucide-react";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { LoyaltyTab } from "@/components/profile/LoyaltyTab";
import { cn } from "@/lib/utils";

type ProfileTabId = "profile" | "loyalty";

const TABS: { id: ProfileTabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profil", icon: User },
  { id: "loyalty", label: "Mes points", icon: Gift },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("profile");

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-gray-900">Mon compte</h1>

      <div className="mt-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "profile" ? <ProfileTab /> : <LoyaltyTab />}
      </div>
    </div>
  );
}
