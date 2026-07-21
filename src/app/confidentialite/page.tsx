import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Mobembo",
  description:
    "Comment Mobembo collecte, utilise et protège vos données personnelles (compte, réservations, paiements, pré-lancement).",
};

const UPDATED = "21 juillet 2026";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function ConfidentialitePage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-sm font-medium text-orange-600">Mobembo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-slate-600">
          Dernière mise à jour : {UPDATED}. République Démocratique du Congo.
        </p>
        <p className="mt-4 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-slate-700">
          Ce document décrit les pratiques actuelles de la plateforme. Il pourra être
          complété après validation juridique. Contact données :{" "}
          <a className="font-medium text-orange-700 underline" href="mailto:info@hbgcare.io">
            info@hbgcare.io
          </a>
          .
        </p>

        <div className="mt-10 space-y-10">
          <Section id="responsable" title="1. Qui est responsable du traitement ?">
            <p>
              Le responsable du traitement des données collectées via Mobembo (site et API) est
              l&apos;éditeur de la plateforme Mobembo, opérée dans le cadre des activités liées à
              HBG Care / Mobembo en RDC.
            </p>
            <p>
              Site :{" "}
              <a className="text-orange-700 underline" href="https://mobembo-ten.vercel.app">
                mobembo-ten.vercel.app
              </a>
              {" · "}
              API :{" "}
              <a className="text-orange-700 underline" href="https://api.hbgcare.io">
                api.hbgcare.io
              </a>
            </p>
          </Section>

          <Section id="champ" title="2. Champ d'application">
            <p>
              Cette politique s&apos;applique à : création de compte, recherche et réservation de
              bus, paiement Mobile Money, billet QR, espaces admin / partenaires, et pages de
              pré-lancement (
              <Link href="/bientot" className="text-orange-700 underline">
                /bientot
              </Link>
              ,{" "}
              <Link href="/partenaires" className="text-orange-700 underline">
                /partenaires
              </Link>
              ,{" "}
              <Link href="/kinshasa-kikwit" className="text-orange-700 underline">
                /kinshasa-kikwit
              </Link>
              ).
            </p>
          </Section>

          <Section id="donnees" title="3. Données que nous collectons">
            <h3 className="font-semibold text-slate-900">Compte</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nom, e-mail, téléphone (optionnel), mot de passe haché</li>
              <li>Photo de profil (si fournie), rôle et société associée le cas échéant</li>
            </ul>
            <h3 className="font-semibold text-slate-900">Réservations</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Trajet, société, horaire, sièges, montant, statut</li>
              <li>Nom passager, âge, genre (si renseigné), besoins d&apos;assistance</li>
            </ul>
            <h3 className="font-semibold text-slate-900">Paiements</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Opérateur (M-Pesa, Airtel Money, Orange Money, Afri Money)</li>
              <li>Numéro Mobile Money, montant (CDF), référence, statut</li>
              <li>Transmission à FreshPay pour exécuter le paiement</li>
            </ul>
            <h3 className="font-semibold text-slate-900">Pré-lancement</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nom, téléphone, e-mail optionnel, consentement</li>
              <li>Pour partenaires : société, message, trajet préféré</li>
            </ul>
            <h3 className="font-semibold text-slate-900">Technique</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Logs serveur, métadonnées de requête nécessaires à la sécurité</li>
              <li>Cookies / pixels publicitaires uniquement s&apos;ils sont activés pour des campagnes</li>
            </ul>
          </Section>

          <Section id="finalites" title="4. Finalités">
            <ul className="list-disc space-y-1 pl-5">
              <li>Gérer le compte et l&apos;authentification</li>
              <li>Traiter réservations, sièges et billet QR</li>
              <li>Initier et confirmer les paiements via FreshPay</li>
              <li>Support, sécurité, statistiques agrégées admin</li>
              <li>Informer les inscrits au pré-lancement</li>
              <li>Permettre aux transporteurs de gérer bus, horaires et réservations</li>
            </ul>
          </Section>

          <Section id="bases" title="5. Bases du traitement">
            <ul className="list-disc space-y-1 pl-5">
              <li>Exécution du service (compte, billet, paiement)</li>
              <li>Consentement (pré-lancement, marketing si opt-in)</li>
              <li>Intérêt légitime (sécurité, amélioration, stats agrégées)</li>
              <li>Obligations liées à la preuve des transactions</li>
            </ul>
          </Section>

          <Section id="destinataires" title="6. Destinataires">
            <p>Selon le besoin du service :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>FreshPay (paiements Mobile Money)</li>
              <li>Hébergeurs front / API (ex. Vercel, VPS)</li>
              <li>Base de données PostgreSQL (ex. Supabase / cloud)</li>
              <li>Sociétés partenaires — données nécessaires au trajet</li>
            </ul>
            <p>Nous ne vendons pas vos données personnelles.</p>
          </Section>

          <Section id="transferts" title="7. Transferts">
            <p>
              Des prestataires techniques peuvent héberger des données hors RDC. Nous appliquons
              des mesures raisonnables (HTTPS, contrôles d&apos;accès).
            </p>
          </Section>

          <Section id="conservation" title="8. Durées de conservation">
            <ul className="list-disc space-y-1 pl-5">
              <li>Compte : tant qu&apos;actif, puis suppression / anonymisation sur demande ou inactivité</li>
              <li>Réservations / billets : durée du service et de la preuve</li>
              <li>Paiements : réconciliation et litiges</li>
              <li>Leads pré-lancement : jusqu&apos;au lancement + période raisonnable, ou retrait du consentement</li>
              <li>Logs : durée limitée</li>
            </ul>
          </Section>

          <Section id="securite" title="9. Sécurité">
            <ul className="list-disc space-y-1 pl-5">
              <li>HTTPS, mots de passe hachés, JWT API</li>
              <li>Accès admin par rôle</li>
              <li>Secrets prestataires en variables d&apos;environnement</li>
            </ul>
          </Section>

          <Section id="droits" title="10. Vos droits">
            <p>Sous réserve de la loi applicable et d&apos;une vérification d&apos;identité :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Accès, rectification, suppression (dans les limites légales)</li>
              <li>Opposition au marketing, retrait du consentement pré-lancement</li>
            </ul>
            <p>
              Écrivez à{" "}
              <a className="text-orange-700 underline" href="mailto:info@hbgcare.io">
                info@hbgcare.io
              </a>{" "}
              avec votre e-mail / téléphone de compte.
            </p>
          </Section>

          <Section id="mineurs" title="11. Mineurs">
            <p>
              Mobembo s&apos;adresse surtout aux majeurs. Les données d&apos;un passager mineur
              peuvent être saisies par un adulte responsable. Contactez-nous pour toute
              suppression.
            </p>
          </Section>

          <Section id="cookies" title="12. Cookies et publicité">
            <p>
              Cookies techniques de session / sécurité. Si un pixel publicitaire (ex. Meta) est
              activé pour des campagnes, des données d&apos;usage limitées pourront servir à
              mesurer les annonces.
            </p>
          </Section>

          <Section id="modifications" title="13. Modifications">
            <p>
              Nous pouvons mettre à jour cette politique. La date de mise à jour ({UPDATED}) figure
              en tête de page. Un changement important pourra être signalé sur le site.
            </p>
          </Section>

          <Section id="contact" title="14. Contact">
            <p>
              Mobembo — confidentialité
              <br />
              <a className="text-orange-700 underline" href="mailto:info@hbgcare.io">
                info@hbgcare.io
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
