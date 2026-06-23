import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CompanyLogoProps = {
  name: string;
  logo?: string | null;
  className?: string;
  iconClassName?: string;
};

export function CompanyLogo({ name, logo, className, iconClassName }: CompanyLogoProps) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`Logo ${name}`}
        className={cn("rounded-xl object-contain bg-white p-1", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-orange-100 text-orange-600",
        className
      )}
    >
      <Building2 className={cn("h-7 w-7", iconClassName)} />
    </div>
  );
}
