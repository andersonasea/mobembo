import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { canAccessAdmin, isPlatformAdmin } from "@/lib/admin-access";
import { Building2, Bus, MapPin, Clock, LayoutDashboard, CreditCard } from "lucide-react";

const allAdminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, platformOnly: false },
  { href: "/admin/companies", label: "Sociétés", icon: Building2, platformOnly: true },
  { href: "/admin/buses", label: "Bus", icon: Bus, platformOnly: false },
  { href: "/admin/routes", label: "Destinations", icon: MapPin, platformOnly: false },
  { href: "/admin/schedules", label: "Horaires", icon: Clock, platformOnly: false },
  { href: "/admin/bookings", label: "Réservations", icon: CreditCard, platformOnly: false },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const companyName = (session?.user as { companyName?: string | null })?.companyName;

  if (!session || !canAccessAdmin(role)) {
    redirect("/login");
  }

  const adminLinks = allAdminLinks.filter(
    (link) => !link.platformOnly || isPlatformAdmin(role)
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 border-r border-gray-200 bg-white p-6 lg:block">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Administration</h2>
        {companyName && (
          <p className="mb-6 text-sm text-orange-600">{companyName}</p>
        )}
        {!companyName && <div className="mb-6" />}
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
