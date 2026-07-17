import type { Metadata } from "next";
import { BarChart3, Bus, LayoutDashboard } from "lucide-react";
import { PrelaunchLanding } from "@/components/prelaunch/PrelaunchLanding";

export const metadata: Metadata = {
  title: "Devenir partenaire Mobembo — Sociétés de transport",
  description:
    "Digitalisez vos réservations et rejoignez les sociétés de transport partenaires de Mobembo.",
};

export default function PartnersLandingPage() {
  return (
    <PrelaunchLanding
      eyebrow="Programme partenaires"
      title="Faites voyager votre société"
      accent="dans l'ère digitale."
      description="Mobembo aide les transporteurs à rendre leurs trajets visibles, centraliser les réservations et mieux suivre les places vendues — sans remplacer leur marque."
      form={{
        source: "PARTNER",
        title: "Parlons de votre société",
        description:
          "Laissez vos coordonnées. Notre équipe vous contactera pour une démonstration et un onboarding pilote.",
        submitLabel: "Demander une démonstration",
        partner: true,
      }}
      highlights={[
        {
          icon: LayoutDashboard,
          title: "Back-office dédié",
          description:
            "Gérez bus, destinations, horaires et réservations depuis un espace centralisé.",
        },
        {
          icon: Bus,
          title: "Votre marque reste visible",
          description:
            "Votre logo, vos lignes et vos informations sont présentés aux voyageurs.",
        },
        {
          icon: BarChart3,
          title: "Meilleure visibilité",
          description:
            "Suivez l'activité et préparez vos départs avec des données plus fiables.",
        },
      ]}
      proofTitle="Un partenariat, pas une substitution"
      proofPoints={[
        "La société conserve son identité et le contrôle de son offre",
        "Les places sont suivies par horaire pour réduire les conflits",
        "Les paiements confirmés restent associés aux réservations",
        "Un accompagnement pilote prépare vos équipes avant l'ouverture",
      ]}
    />
  );
}
