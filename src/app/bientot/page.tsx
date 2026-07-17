import type { Metadata } from "next";
import { Armchair, QrCode, Smartphone } from "lucide-react";
import { PrelaunchLanding } from "@/components/prelaunch/PrelaunchLanding";

export const metadata: Metadata = {
  title: "Mobembo arrive bientôt — Réservation de bus en ligne",
  description:
    "Rejoignez le pré-lancement Mobembo et soyez parmi les premiers à réserver votre place de bus en ligne en RDC.",
};

export default function ComingSoonPage() {
  return (
    <PrelaunchLanding
      eyebrow="Mobembo arrive bientôt"
      title="Votre prochain voyage commence"
      accent="avant la gare."
      description="Fini les longues files et les places incertaines. Mobembo prépare une façon plus simple de choisir votre transporteur, réserver votre siège et payer avec votre téléphone."
      form={{
        source: "GENERAL",
        title: "Rejoindre la liste prioritaire",
        description:
          "Recevez la date d'ouverture, les trajets pilotes et les avantages réservés aux premiers voyageurs.",
        submitLabel: "Je rejoins la liste prioritaire",
        routeSurvey: true,
      }}
      highlights={[
        {
          icon: Armchair,
          title: "Votre siège, clairement",
          description:
            "Consultez les places disponibles et choisissez votre siège avant de vous déplacer.",
        },
        {
          icon: Smartphone,
          title: "Paiement Mobile Money",
          description:
            "Payez depuis votre téléphone avec les moyens utilisés au quotidien en RDC.",
        },
        {
          icon: QrCode,
          title: "Billet QR",
          description:
            "Recevez une preuve numérique après confirmation de votre paiement.",
        },
      ]}
      proofTitle="Un parcours pensé pour gagner du temps"
      proofPoints={[
        "Des sociétés de transport partenaires réunies dans une interface unique",
        "Un plan de sièges qui rend les disponibilités visibles",
        "Une réservation traçable jusqu'à la confirmation du paiement",
        "Un lancement d'abord concentré sur des trajets réellement demandés",
      ]}
    />
  );
}
