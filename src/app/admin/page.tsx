import { Building2, Bus, MapPin, Users, CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

async function getStats() {
  const [companies, buses, routes, users, bookings] = await Promise.all([
    prisma.transportCompany.count(),
    prisma.bus.count(),
    prisma.route.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
  ]);
  return { companies, buses, routes, users, bookings };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Sociétés", value: stats.companies, icon: Building2, color: "bg-blue-100 text-blue-600" },
    { label: "Bus", value: stats.buses, icon: Bus, color: "bg-orange-100 text-orange-600" },
    { label: "Destinations", value: stats.routes, icon: MapPin, color: "bg-green-100 text-green-600" },
    { label: "Utilisateurs", value: stats.users, icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Réservations", value: stats.bookings, icon: CreditCard, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Vue d&apos;ensemble du système Mobembo</p>

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
    </div>
  );
}
