import { MarketingImage } from "@/components/marketing/MarketingImage";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
};

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12">{children}</div>
      <div className="relative hidden lg:block">
        <MarketingImage
          src="/images/marketing/bus-interior.png"
          alt="Intérieur confortable d'un bus Mobembo"
          className="h-full min-h-[calc(100vh-4rem)]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/70 via-orange-900/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-sm font-medium uppercase tracking-wider text-orange-200">
            Mobembo
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight">
            Réservez votre place en quelques clics
          </h2>
          <p className="mt-3 max-w-md text-sm text-orange-50/90">
            Voyagez confortablement avec les sociétés de transport partenaires.
          </p>
        </div>
      </div>
    </div>
  );
}
