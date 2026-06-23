import { Building2, Bus, MapPin, Users, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { isCompanyAdmin, isPlatformAdmin } from "@/lib/admin-access";
import { Card, CardContent } from "@/components/ui/card";
import { BookingTrendChart } from "@/components/admin/BookingTrendChart";
import { PassengerDemographicsChart } from "@/components/admin/PassengerDemographicsChart";
import { fetchServerApi } from "@/lib/server-api";
import type { DashboardStats } from "@/lib/types/public-company";

export const dynamic = "force-dynamic";

const EMPTY_STATS: DashboardStats = {
  companies: 0,
  buses: 0,
  routes: 0,
  users: 0,
  bookings: 0,
};

async function getStats(token?: string | null) {
  return (
    (await fetchServerApi<DashboardStats>("/api/admin/analytics/dashboard-stats", {
      token,
    })) ?? EMPTY_STATS
  );
}

export default async function AdminDashboard() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const companyId = (session?.user as { companyId?: string | null })?.companyId;
  const companyName = (session?.user as { companyName?: string | null })?.companyName;
  const stats = await getStats(session?.user?.backendToken);

  const cards = [
    ...(isPlatformAdmin(role)
      ? [{ label: "Sociétés", value: stats.companies, icon: Building2, color: "bg-blue-100 text-blue-600" }]
      : []),
    { label: "Bus", value: stats.buses, icon: Bus, color: "bg-orange-100 text-orange-600" },
    { label: "Destinations", value: stats.routes, icon: MapPin, color: "bg-green-100 text-green-600" },
    ...(isPlatformAdmin(role)
      ? [{ label: "Utilisateurs", value: stats.users, icon: Users, color: "bg-purple-100 text-purple-600" }]
      : []),
    { label: "Réservations", value: stats.bookings, icon: CreditCard, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        {companyName
          ? `Vue d'ensemble — ${companyName}`
          : "Vue d'ensemble du système Mobembo"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BookingTrendChart />
      <PassengerDemographicsChart />
    </div>
  );
}
