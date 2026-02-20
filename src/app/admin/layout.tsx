import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Building2, Bus, MapPin, Clock, LayoutDashboard } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Sociétés", icon: Building2 },
  { href: "/admin/buses", label: "Bus", icon: Bus },
  { href: "/admin/routes", label: "Destinations", icon: MapPin },
  { href: "/admin/schedules", label: "Horaires", icon: Clock },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 border-r border-gray-200 bg-white p-6 lg:block">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Administration</h2>
        <nav className="space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}
