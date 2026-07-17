import type { Metadata } from "next";
import { Armchair, MapPinned, TicketCheck } from "lucide-react";
import { PrelaunchLanding } from "@/components/prelaunch/PrelaunchLanding";

export const metadata: Metadata = {
  title: "Kinshasa–Kikwit bientôt sur Mobembo",
  description:
    "Inscrivez-vous pour être informé de l'ouverture des réservations Kinshasa–Kikwit sur Mobembo.",
};

export default function KinshasaKikwitLandingPage() {
  return (
    <PrelaunchLanding
      eyebrow="Trajet pilote · Kinshasa–Kikwit"
      title="Kinshasa vers Kikwit,"
      accent="sans place incertaine."
      description="Nous préparons l'ouverture de ce trajet pilote. Inscrivez-vous pour connaître les premiers départs disponibles et accéder prioritairement aux réservations."
      form={{
        source: "PILOT_KINSHASA_KIKWIT",
        title: "Être alerté à l'ouverture",
        description:
          "Recevez les informations sur les transporteurs, les horaires et l'ouverture des places Kinshasa–Kikwit.",
        submitLabel: "M'alerter pour ce trajet",
        routeSurvey: true,
      }}
      highlights={[
        {
          icon: MapPinned,
          title: "Un corridor ciblé",
          description:
            "Le pilote se concentre sur Kinshasa–Kikwit pour assurer une ouverture utile et maîtrisée.",
        },
        {
          icon: Armchair,
          title: "Places visibles",
          description:
            "Choisissez une place disponible plutôt que de découvrir la situation à la gare.",
        },
        {
          icon: TicketCheck,
          title: "Réservation confirmée",
          description:
            "Après paiement validé, votre billet numérique avec QR devient disponible.",
        },
      ]}
      proofTitle="Votre inscription aide à préparer le bon service"
      proofPoints={[
        "Mesurer la demande réelle entre Kinshasa et Kikwit",
        "Prioriser les horaires attendus par les voyageurs",
        "Préparer les sociétés partenaires avant l'ouverture",
        "Vous prévenir dès que les premières places sont disponibles",
      ]}
    />
  );
}
