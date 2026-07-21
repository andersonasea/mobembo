#!/usr/bin/env python3
"""Génère la Politique de confidentialité Mobembo en PDF."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent / "MOBEMBO-POLITIQUE-CONFIDENTIALITE.pdf"
LOGO = Path(__file__).resolve().parent.parent / "assets" / "newlogo.jpeg"
FONTS = Path(r"C:\Windows\Fonts")
UPDATED = "21 juillet 2026"


class PrivacyPDF(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=18)
        self.add_font("Body", "", str(FONTS / "arial.ttf"))
        self.add_font("Body", "B", str(FONTS / "arialbd.ttf"))
        self.add_font("Body", "I", str(FONTS / "ariali.ttf"))

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Body", "B", 9)
        self.set_text_color(234, 88, 12)
        self.cell(0, 8, "Mobembo — Politique de confidentialité", align="L")
        self.set_draw_color(234, 88, 12)
        self.line(10, 12, 200, 12)
        self.ln(8)

    def footer(self):
        self.set_y(-14)
        self.set_font("Body", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}} — Mise à jour : {UPDATED}", align="C")

    def cover(self):
        self.add_page()
        self.ln(28)
        if LOGO.exists():
            self.image(str(LOGO), x=55, w=100)
            self.ln(10)
        else:
            self.set_font("Body", "B", 36)
            self.set_text_color(234, 88, 12)
            self.cell(0, 18, "MOBEMBO", align="C", new_x="LMARGIN", new_y="NEXT")

        self.set_font("Body", "B", 20)
        self.set_text_color(15, 23, 42)
        self.cell(0, 12, "Politique de confidentialité", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("Body", "", 11)
        self.set_text_color(71, 85, 105)
        self.multi_cell(
            0,
            6.5,
            "Comment Mobembo collecte, utilise et protège vos données personnelles\n"
            f"Dernière mise à jour : {UPDATED}\n"
            "République Démocratique du Congo",
            align="C",
        )
        self.ln(14)
        self.set_draw_color(234, 88, 12)
        self.line(55, self.get_y(), 155, self.get_y())
        self.ln(14)
        self.set_font("Body", "", 10)
        self.set_text_color(51, 65, 85)
        self.multi_cell(
            0,
            6,
            "Document publié également sur le site : /confidentialite\n"
            "Ce texte est informatif et pourra être complété après validation juridique.",
            align="C",
        )

    def h1(self, text: str):
        self.ln(3)
        self.set_font("Body", "B", 13)
        self.set_text_color(234, 88, 12)
        self.multi_cell(0, 7, text)
        self.set_draw_color(251, 146, 60)
        self.line(10, self.get_y(), 55, self.get_y())
        self.ln(2.5)

    def h2(self, text: str):
        self.ln(1.5)
        self.set_font("Body", "B", 10.5)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 6, text)
        self.ln(0.8)

    def body(self, text: str):
        self.set_font("Body", "", 9.5)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.2, text)
        self.ln(1)

    def bullet(self, text: str):
        self.set_font("Body", "", 9.5)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin + 2)
        self.multi_cell(0, 5.1, f"-  {text}")
        self.ln(0.2)


def build():
    pdf = PrivacyPDF()
    pdf.alias_nb_pages()
    pdf.cover()

    pdf.add_page()
    pdf.h1("1. Qui est responsable du traitement ?")
    pdf.body(
        "Le responsable du traitement des données personnelles collectées via la plateforme "
        "Mobembo (site web et API associés) est l'éditeur de la plateforme Mobembo, opérée "
        "dans le cadre des activités liées à HBG Care / Mobembo en République Démocratique du Congo."
    )
    pdf.body(
        "Contact pour toute question relative à vos données personnelles : "
        "contact@hbgcare.io (à confirmer / remplacer par l'adresse officielle définitive). "
        "Site : https://mobembo-ten.vercel.app — API : https://api.hbgcare.io"
    )

    pdf.h1("2. Champ d'application")
    pdf.body(
        "La présente politique s'applique à l'utilisation de Mobembo : création de compte, "
        "recherche et réservation de places de bus, paiement Mobile Money, billet numérique "
        "avec code QR, espaces administrateur / société partenaire, ainsi que les pages de "
        "pré-lancement (/bientot, /partenaires, /kinshasa-kikwit)."
    )

    pdf.h1("3. Données que nous collectons")
    pdf.h2("3.1 Compte utilisateur")
    pdf.bullet("Nom, adresse e-mail, numéro de téléphone (optionnel à l'inscription)")
    pdf.bullet("Mot de passe (stocké sous forme hachée, jamais en clair)")
    pdf.bullet("Photo de profil (si vous en ajoutez une)")
    pdf.bullet("Rôle (voyageur, admin société, super admin) et société associée le cas échéant")

    pdf.h2("3.2 Réservations et passagers")
    pdf.bullet("Trajet, société de transport, horaire, sièges choisis, montant")
    pdf.bullet("Nom du passager, âge, genre (si renseigné), besoins d'assistance éventuels")
    pdf.bullet("Statut de la réservation et historique lié à votre compte")

    pdf.h2("3.3 Paiements")
    pdf.bullet("Moyen de paiement : M-Pesa, Airtel Money, Orange Money ou Afri Money")
    pdf.bullet("Numéro Mobile Money utilisé pour l'initiation du paiement")
    pdf.bullet("Montant, devise (CDF), référence de transaction, statut (en attente, succès, échec)")
    pdf.bullet(
        "Ces données sont transmises à notre prestataire de paiement FreshPay (PayDRC) "
        "pour exécuter la transaction"
    )

    pdf.h2("3.4 Pré-lancement / listes d'attente")
    pdf.bullet("Nom, téléphone, e-mail (optionnel), consentement obligatoire")
    pdf.bullet("Pour les partenaires : nom de société, message, trajet préféré le cas échéant")
    pdf.bullet("Source d'inscription (liste voyageurs, partenaires, trajet pilote Kinshasa–Kikwit)")

    pdf.h2("3.5 Données techniques")
    pdf.bullet("Journaux techniques (logs) nécessaires au fonctionnement et à la sécurité")
    pdf.bullet("Adresse IP et métadonnées de requête côté serveur (hébergement / sécurité)")
    pdf.bullet(
        "Cookies ou traceurs publicitaires (ex. Meta Pixel) uniquement s'ils sont activés "
        "lors de campagnes marketing — le cas échéant, information complémentaire sera fournie"
    )

    pdf.add_page()
    pdf.h1("4. Finalités (pourquoi nous utilisons vos données)")
    pdf.bullet("Créer et gérer votre compte, vous authentifier")
    pdf.bullet("Traiter vos réservations, l'attribution des sièges et l'émission du billet QR")
    pdf.bullet("Initier et confirmer les paiements Mobile Money via FreshPay")
    pdf.bullet("Assurer le support client et la résolution d'incidents")
    pdf.bullet("Informer les inscrits au pré-lancement (ouverture, trajets pilotes)")
    pdf.bullet("Permettre aux sociétés partenaires de gérer bus, horaires et réservations")
    pdf.bullet("Produire des statistiques agrégées (ex. fréquentation, démographie) pour l'admin")
    pdf.bullet("Sécuriser la plateforme (prévention fraude, abus, rate limiting)")
    pdf.body(
        "Nous n'utilisons pas vos données pour une finalité incompatible avec celles ci-dessus "
        "sans vous en informer et, le cas échéant, sans votre consentement."
    )

    pdf.h1("5. Bases du traitement")
    pdf.bullet("Exécution du contrat / service : compte, réservation, paiement, billet")
    pdf.bullet("Consentement : inscription pré-lancement, communications marketing si opt-in")
    pdf.bullet("Intérêt légitime : sécurité, amélioration du service, statistiques agrégées")
    pdf.bullet("Obligations légales : conservation limitée liée à la preuve de transactions")

    pdf.h1("6. Destinataires et sous-traitants")
    pdf.body("Selon les besoins du service, vos données peuvent être traitées par :")
    pdf.bullet("FreshPay (agrégateur Mobile Money) — initiation, statut et callbacks de paiement")
    pdf.bullet("Hébergeurs de l'application et de l'API (ex. Vercel pour le front, VPS / cloud pour l'API)")
    pdf.bullet("Fournisseur de base de données PostgreSQL (ex. Supabase / hébergeur cloud)")
    pdf.bullet("Sociétés de transport partenaires — uniquement les données nécessaires à votre trajet")
    pdf.body(
        "Nous ne vendons pas vos données personnelles. Les prestataires n'agissent que pour "
        "fournir le service et selon des instructions / contrats appropriés."
    )

    pdf.h1("7. Transferts")
    pdf.body(
        "Certains prestataires techniques peuvent héberger des données hors RDC "
        "(par exemple infrastructures cloud en Europe ou ailleurs). "
        "Dans ce cas, nous recherchons des mesures raisonnables de protection "
        "(chiffrement en transit HTTPS, contrôles d'accès)."
    )

    pdf.h1("8. Durées de conservation")
    pdf.bullet("Compte : tant que le compte est actif, puis suppression ou anonymisation sur demande / inactivité prolongée")
    pdf.bullet("Réservations et billets : durée nécessaire au service et à la preuve (ex. jusqu'à plusieurs mois après le trajet)")
    pdf.bullet("Paiements / références : alignées sur les besoins de réconciliation et de litiges")
    pdf.bullet("Leads pré-lancement : jusqu'au lancement puis période raisonnable, ou jusqu'au retrait du consentement")
    pdf.bullet("Logs techniques : durée limitée (sécurité et diagnostic)")

    pdf.add_page()
    pdf.h1("9. Sécurité")
    pdf.bullet("Communications chiffrées en HTTPS")
    pdf.bullet("Mots de passe hachés")
    pdf.bullet("Jetons d'authentification (JWT) pour l'API")
    pdf.bullet("Accès administrateur restreint par rôle")
    pdf.bullet("Secrets prestataires (FreshPay, base de données) stockés en variables d'environnement")
    pdf.body(
        "Aucune mesure n'est infaillible. En cas d'incident susceptible d'affecter vos droits, "
        "nous nous engageons à prendre des mesures raisonnables d'information et de remédiation."
    )

    pdf.h1("10. Vos droits")
    pdf.body("Sous réserve de la législation applicable et de vérifications d'identité, vous pouvez demander :")
    pdf.bullet("L'accès aux données vous concernant")
    pdf.bullet("La rectification de données inexactes")
    pdf.bullet("La suppression de votre compte / de certaines données (dans les limites légales et contractuelles)")
    pdf.bullet("L'opposition à certaines communications marketing")
    pdf.bullet("Le retrait du consentement pour les listes pré-lancement")
    pdf.body(
        "Pour exercer vos droits : contact@hbgcare.io (ou l'adresse officielle publiée sur le site), "
        "en précisant votre demande et un moyen de vous identifier (e-mail / téléphone du compte)."
    )

    pdf.h1("11. Mineurs")
    pdf.body(
        "Mobembo s'adresse principalement à des utilisateurs majeurs capables de contracter. "
        "Les données de passagers mineurs peuvent être saisies par un adulte responsable "
        "dans le cadre d'une réservation. Si vous estimez qu'un mineur nous a transmis des données "
        "sans autorisation, contactez-nous pour suppression."
    )

    pdf.h1("12. Cookies et publicité")
    pdf.body(
        "Le site peut utiliser des cookies techniques indispensables au fonctionnement "
        "(session, sécurité). Si des campagnes publicitaires (ex. Meta Ads) sont activées "
        "avec un pixel de mesure, des données d'usage limitées pourront être collectées "
        "pour mesurer l'efficacité des annonces. Vous pourrez alors gérer vos préférences "
        "selon les outils du navigateur / de la plateforme publicitaire."
    )

    pdf.h1("13. Modifications")
    pdf.body(
        f"Nous pouvons mettre à jour cette politique. La date de dernière mise à jour "
        f"({UPDATED}) figure en tête du document. En cas de changement significatif, "
        "une information pourra être affichée sur le site ou communiquée aux utilisateurs concernés."
    )

    pdf.h1("14. Contact")
    pdf.body(
        "Mobembo — Politique de confidentialité\n"
        "E-mail : contact@hbgcare.io\n"
        "Site : https://mobembo-ten.vercel.app\n"
        "Page web : /confidentialite"
    )
    pdf.ln(4)
    pdf.set_font("Body", "I", 8.5)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(
        0,
        4.8,
        "Avertissement : ce document décrit les pratiques actuelles de la plateforme Mobembo. "
        "Il ne constitue pas un avis juridique. Une validation par un conseil en RDC est recommandée "
        "avant toute diffusion contractuelle définitive.",
    )

    pdf.output(str(OUT))
    print(f"OK -> {OUT}")


if __name__ == "__main__":
    build()
