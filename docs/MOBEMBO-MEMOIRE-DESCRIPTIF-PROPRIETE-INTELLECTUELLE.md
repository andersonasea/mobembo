# MÉMOIRE DESCRIPTIF — PLATEFORME MOBEMBO

**Document destiné à la protection de la propriété intellectuelle**  
*(dépôt de logiciel, enveloppe Soleau, description d’œuvre, dossier de présentation)*

---

## MÉTADONNÉES DU DÉPÔT

| Champ | Information |
|-------|-------------|
| **Titre de l’œuvre / du logiciel** | Mobembo — Plateforme de réservation et paiement de billets de transport interurbain par bus |
| **Version documentée** | 0.1.0 |
| **Date de rédaction** | 25 mai 2026 |
| **Langue** | Français |
| **Auteur(s) / Titulaire(s)** | *[À compléter : nom(s), adresse(s), qualité juridique]* |
| **Pays de conception / exploitation prévue** | République démocratique du Congo (RDC) et zone Afrique centrale |
| **Contact** | *[À compléter : email, téléphone]* |

---

## 1. RÉSUMÉ EXÉCUTIF

**Mobembo** est une application logicielle fullstack de **réservation en ligne de places de bus** pour le transport interurbain. Elle met en relation des **voyageurs** (clients) et des **sociétés de transport** via une interface web moderne, avec gestion des horaires, sélection de sièges, paiement par **mobile money** (M-Pesa, Airtel Money, Orange Money, Afri Money) via l’agrégateur **FlexPay**, et génération d’un **billet numérique avec code QR**.

L’architecture sépare volontairement un **frontend web** (Next.js) et une **API backend** (Express.js), ce qui permet une évolution vers des clients mobiles natifs tout en conservant une logique métier centralisée.

---

## 2. PROBLÉMATIQUE ADRESSÉE

### 2.1 Contexte

Dans de nombreuses régions d’Afrique, notamment en RDC, la réservation de billets de bus reste largement **manuelle** : files d’attente en gare, paiement cash, peu de visibilité sur les places disponibles, difficulté à comparer les offres des transporteurs.

### 2.2 Besoins identifiés

- Permettre au voyageur de **consulter**, **comparer** et **réserver** un trajet depuis un smartphone ou un ordinateur.
- Offrir aux sociétés de transport un **back-office** pour gérer flotte, lignes, horaires et réservations.
- Intégrer les **moyens de paiement locaux** (mobile money) adaptés au marché congolais.
- Garantir la **traçabilité** des transactions et des places attribuées.
- Préparer une **fidélisation** future des utilisateurs (programme de points / bonus).

### 2.3 Solution apportée par Mobembo

Mobembo centralise le catalogue des transporteurs, automatise la réservation avec **sélection de sièges en temps réel**, orchestre le paiement électronique et délivre une **preuve de réservation** (QR code) après confirmation du paiement.

---

## 3. OBJET DE LA PROTECTION DEMANDÉE

Ce document décrit l’**œuvre logicielle originale** Mobembo dans son ensemble, comprenant notamment :

- Le **code source** (frontend, backend, schéma de base de données, scripts).
- L’**architecture logicielle** et les choix d’intégration.
- Les **parcours utilisateur** et règles métier.
- L’**identité visuelle** et l’ergonomie de l’interface (charte orange / Mobembo).
- Les **spécifications fonctionnelles** détaillées ci-dessous.

*Note : selon la juridiction, la protection peut relever du **droit d’auteur sur le logiciel**, d’un **dépôt de code source**, d’une **marque** (nom « Mobembo »), ou d’autres titres. Ce mémoire constitue une base descriptive ; le déposant doit vérifier les formalités auprès de l’organisme compétent (ex. OMPI, INPI, office national congolais compétent).*

---

## 4. DESCRIPTION FONCTIONNELLE DÉTAILLÉE

### 4.1 Acteurs du système

| Acteur | Rôle |
|--------|------|
| **Client / Voyageur** | Consulte les offres, réserve des places, paie, reçoit son billet QR |
| **Administrateur (ADMIN)** | Gère sociétés, bus, routes, horaires, consulte les réservations |
| **Société de transport** | Entité métier référencée dans le système (données gérées par l’admin) |
| **Passerelle de paiement (FlexPay)** | Initie et confirme les paiements mobile money |
| **Système** | API backend, base PostgreSQL, authentification |

### 4.2 Modules fonctionnels

#### A. Portail public (voyageur)

1. **Page d’accueil** — Présentation de Mobembo et liste des sociétés de transport actives.
2. **Fiche société** — Destinations et informations de la compagnie.
3. **Fiche destination / route** — Horaires disponibles pour un trajet (ville de départ → ville d’arrivée).
4. **Fiche horaire** — Détail du départ, bus assigné, prix, plan de sièges interactif.
5. **Sélection de places** — Choix d’un ou plusieurs numéros de siège ; vérification des conflits (siège déjà réservé).
6. **Réservation** — Création d’une réservation en statut `PENDING` avec verrouillage temporaire des places.
7. **Paiement** — Choix du opérateur mobile money, saisie du numéro, initiation du paiement FlexPay, suivi du statut.
8. **Confirmation** — Après paiement réussi : statut `CONFIRMED`, génération et affichage d’un **QR code** contenant les données du billet (téléchargeable).
9. **Authentification** — Inscription, connexion (email / mot de passe), session sécurisée.

#### B. Espace administration

1. **Tableau de bord** — Vue d’ensemble réservée aux utilisateurs `ADMIN`.
2. **Gestion des sociétés de transport** — CRUD (création, lecture, mise à jour, désactivation).
3. **Gestion des bus** — Immatriculation, modèle, capacité (`totalSeats`), rattachement à une société.
4. **Gestion des routes / destinations** — Couple départ–destination, prix, durée estimée.
5. **Gestion des horaires (schedules)** — Affectation bus + route + date/heure de départ, places disponibles.
6. **Consultation des réservations** — Liste des bookings et statuts associés.

#### C. API backend (services exposés)

- Santé : `GET /api/health`
- Authentification : `POST /api/auth/register`, `POST /api/auth/login`
- Ressources métier : sociétés, bus, routes, horaires, réservations
- Paiements : `POST /api/payments` (authentifié), webhook `POST /api/payments/webhook/flexpay`
- Versionnement : `/api/v1/...` (alias de compatibilité `/api/...`)
- Documentation interactive : Swagger / OpenAPI sur `/docs`

#### D. Évolutions prévues (conception)

- **Programme de fidélité** : compteur de points par utilisateur, historique des mouvements, utilisation au checkout, crédit après paiement confirmé.
- **Application mobile native** consommant la même API REST.

---

## 5. PARCOURS UTILISATEUR (FLUX MÉTIER)

### 5.1 Parcours client

```
Inscription / Connexion
    → Liste des sociétés de transport
    → Choix d'une société
    → Liste des destinations (routes)
    → Choix d'une destination
    → Liste des horaires (schedules)
    → Choix d'un horaire
    → Sélection des sièges sur le plan du bus
    → Création de la réservation (PENDING)
    → Page de paiement (mobile money)
    → Confirmation FlexPay (webhook)
    → Réservation CONFIRMED + billet QR
```

### 5.2 Parcours administrateur

```
Connexion (rôle ADMIN)
    → Dashboard admin
    → Gestion sociétés / bus / routes / horaires
    → Consultation des réservations
```

### 5.3 Règles métier importantes

- Une **place** ne peut être réservée qu’**une seule fois** par horaire (contrainte d’unicité `scheduleId + seatNumber`).
- Le paiement n’est initié que pour une réservation existante et authentifiée.
- Le passage en `CONFIRMED` est déclenché après **succès du paiement** (callback webhook ou réponse synchrone FlexPay).
- Les réservations `PENDING` peuvent expirer après un délai configurable (`BOOKING_PENDING_TTL_MINUTES`, défaut : 10 minutes).
- Deux rôles utilisateur : `CLIENT` et `ADMIN` ; les routes `/admin` et `/booking` sont protégées par middleware.

---

## 6. ARCHITECTURE TECHNIQUE

### 6.1 Stack logicielle

| Couche | Technologies |
|--------|----------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, composants UI (shadcn/ui) |
| Authentification web | NextAuth.js v5 (sessions JWT), provider Credentials |
| Backend API | Node.js, Express.js, TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma 7 (avec adaptateur `@prisma/adapter-pg`) |
| Validation | Zod |
| Sécurité mots de passe | bcryptjs (hachage cost 12) |
| Tokens API | JSON Web Token (JWT, durée 7 jours) |
| Paiement | FlexPay (agrégateur mobile money RDC) |
| Billet | Génération QR code (bibliothèque `qrcode`) |
| Documentation API | Swagger / OpenAPI |

### 6.2 Architecture en couches

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (navigateur / futur app mobile)                      │
│  Next.js — pages React, session NextAuth                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / fetch / Bearer JWT
┌──────────────────────────▼──────────────────────────────────┐
│  API BACKEND (Express — port 4000 par défaut)                │
│  Routes REST, auth JWT, webhooks FlexPay, Prisma             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  PostgreSQL — données persistantes                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  FlexPay — M-Pesa, Airtel Money, Orange Money, Afri Money    │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Organisation du code source

```
mobembo/
├── prisma/                 # Schéma et migrations PostgreSQL
├── src/                    # Frontend Next.js
│   ├── app/                # Pages et routes API Next
│   ├── components/         # Composants UI réutilisables
│   ├── lib/                # Auth, Prisma client, utilitaires API
│   └── types/              # Extensions TypeScript (session, JWT)
├── backend/                # API Express autonome
│   └── src/
│       ├── server.ts       # Point d'entrée, auth, paiements
│       ├── routes/         # Routes métier modulaires
│       ├── services/       # Intégration FlexPay
│       └── models/         # Schémas de validation Zod
└── docs/                   # Documentation projet
```

### 6.4 Format des échanges API

Réponses normalisées pour faciliter l’interopérabilité :

- **Succès** : `{ "data": <payload>, "meta": { ... } }`
- **Erreur** : `{ "error": { "code": "CODE", "message": "...", "details": ... } }`

---

## 7. MODÈLE DE DONNÉES

### 7.1 Entités principales

| Entité | Description |
|--------|-------------|
| **User** | Utilisateur (client ou admin) : identité, email unique, téléphone, mot de passe haché |
| **TransportCompany** | Société de transport : nom, logo, contacts, statut actif |
| **Bus** | Véhicule : plaque, modèle, nombre de sièges, lien société |
| **Route** | Ligne : départ, destination, prix, durée, lien société |
| **Schedule** | Départ programmé : route + bus + horaires + places disponibles + statut |
| **Booking** | Réservation : utilisateur, horaire, nombre de places, prix total, statut |
| **SeatSelection** | Siège précis réservé pour un booking et un horaire |
| **Payment** | Paiement lié 1:1 à une réservation : montant, méthode, statut, référence transaction |

### 7.2 Énumérations métier

- **Role** : `CLIENT`, `ADMIN`
- **BookingStatus** : `PENDING`, `CONFIRMED`, `CANCELLED`
- **PaymentMethod** : `MPESA`, `AIRTEL_MONEY`, `ORANGE_MONEY`, `AFRI_MONEY`
- **PaymentStatus** : `PENDING`, `SUCCESS`, `FAILED`
- **ScheduleStatus** : `ACTIVE`, `CANCELLED`, `COMPLETED`

### 7.3 Relations clés

- Un utilisateur effectue plusieurs réservations (`User` 1—N `Booking`).
- Une société possède plusieurs bus et routes.
- Un horaire (`Schedule`) regroupe une route et un bus ; il reçoit plusieurs réservations.
- Chaque réservation peut avoir plusieurs `SeatSelection` et un seul `Payment`.

---

## 8. SÉCURITÉ ET AUTHENTIFICATION

### 8.1 Double couche d’authentification

1. **NextAuth (frontend)** — Session utilisateur côté Next.js après validation des identifiants.
2. **JWT backend** — Lors du login, le backend renvoie un `token` stocké dans la session sous le nom `backendToken`, utilisé pour les appels API protégés (`Authorization: Bearer`).

### 8.2 Mesures de sécurité

- Mots de passe hachés (bcrypt, facteur 12).
- Routes admin protégées par middleware (`role === ADMIN`).
- Routes de réservation et paiement réservées aux utilisateurs connectés.
- Validation des entrées avec Zod sur le backend.
- CORS configurable (`ALLOWED_ORIGINS`) ; requêtes sans `Origin` autorisées pour clients mobiles natifs.
- Secret webhook FlexPay pour authentifier les callbacks de paiement.
- Variables sensibles exclusivement en variables d’environnement (`.env`).

---

## 9. INTÉGRATION PAIEMENT (FLEXPAY)

### 9.1 Flux de paiement

1. Le client choisit un opérateur mobile money et saisit son numéro de téléphone.
2. Le backend appelle l’API FlexPay pour initier une demande de paiement (push USSD / confirmation mobile).
3. FlexPay notifie Mobembo via **webhook** (`/api/payments/webhook/flexpay`) ou réponse synchrone.
4. En cas de succès : mise à jour `Payment.status = SUCCESS`, `Booking.status = CONFIRMED`, enregistrement de la référence transaction et de la date de paiement.

### 9.2 Devise et marché

- Affichage des prix en **franc congolais (CDF)** via formatage localisé (`fr-CD`).
- Contexte d’exploitation : transport interurbain (exemples de lignes seed : Kinshasa — Lubumbashi).

---

## 10. BILLET NUMÉRIQUE (QR CODE)

Après confirmation du paiement, le système génère un **code QR** encodant un payload JSON structuré comprenant notamment :

- Identifiant de la réservation
- Informations du trajet (départ, destination, société, horaire)
- Sièges réservés
- Référence de paiement

Le voyageur peut **télécharger** l’image QR comme preuve de voyage. Ce mécanisme constitue un élément distinctif de l’œuvre Mobembo par rapport à une simple confirmation par email.

---

## 11. ÉLÉMENTS ORIGINAUX ET VALEUR AJOUTÉE

Les éléments suivants caractérisent l’**originalité** de la solution Mobembo :

1. **Conception unifiée** pour le marché congolais : mobile money multi-opérateurs, devise CDF, parcours en français.
2. **Séparation frontend / API** permettant le déploiement web immédiat et l’extension mobile sans duplication de la logique métier.
3. **Sélection granulaire des sièges** avec contrainte d’intégrité en base (unicité par horaire).
4. **Chaîne complète** : découverte transporteur → réservation → paiement → billet QR, dans un seul produit.
5. **Contrat API homogène** (enveloppe `data` / `error`) et documentation OpenAPI intégrée.
6. **Architecture de fidélisation** prévue (points, historique, intégration au cycle de paiement) comme extension naturelle du modèle `User` / `Booking` / `Payment`.

---

## 12. ENVIRONNEMENT D’EXÉCUTION

| Composant | Configuration type |
|-----------|-------------------|
| Frontend | `http://localhost:3000` (développement) |
| Backend API | `http://localhost:4000` |
| Base de données | PostgreSQL (URL via `DATABASE_URL`) |
| Variables | `AUTH_SECRET`, `JWT_SECRET`, `API_URL`, clés FlexPay, `ALLOWED_ORIGINS` |

Commandes de démarrage documentées :

- Frontend : `npm run dev`
- Backend : `npm run dev:backend`
- Migrations : `npm run db:migrate`
- Données initiales : `npm run db:seed`

---

## 13. JALONS DE DÉVELOPPEMENT (ÉTAT AU DÉPÔT)

| Fonctionnalité | État |
|----------------|------|
| Catalogue sociétés / routes / horaires | Implémenté |
| Sélection de sièges | Implémenté |
| Réservation + statuts | Implémenté |
| Authentification client / admin | Implémenté |
| Paiement FlexPay + webhook | Implémenté |
| Billet QR | Implémenté |
| Back-office admin | Implémenté |
| Programme fidélité (points) | Conçu, non implémenté |
| Application mobile native | Prévu (API prête) |

---

## 14. DÉCLARATION DE Paternité ET ORIGINALITÉ

Je soussigné(e) *[Nom, prénom]*, déclare être l’auteur / les auteurs de l’œuvre logicielle décrite sous le nom **Mobembo**, créée originalement à partir de *[lieu, date de création]*, et que cette œuvre ne constitue pas une copie non autorisée d’un logiciel tiers, sous réserve des bibliothèques open source listées dans les fichiers `package.json` (Next.js, React, Prisma, Express, etc.), utilisées conformément à leurs licences respectives.

**Co-auteur(s) éventuel(s)** : *[À compléter]*

**Signature** : _________________________  
**Date** : _________________________

---

## 15. PIÈCES JOINTES RECOMMANDÉES POUR LE DÉPÔT

Lors de la constitution du dossier auprès de l’organisme de protection, joindre si possible :

1. Ce mémoire descriptif (version signée).
2. **Extraits représentatifs du code source** (fichiers clés : `schema.prisma`, `server.ts`, pages de réservation/paiement) sur support numérique ou impression.
3. **Captures d’écran** des interfaces (accueil, sélection sièges, paiement, billet QR, admin).
4. **Schéma d’architecture** (diagramme fourni section 6.2).
5. **Liste des dépendances** (`package.json` racine et `backend/package.json`).
6. **Hash / archive** du dépôt Git à une date donnée (optionnel, pour preuve d’antériorité).

---

## 16. AVERTISSEMENT JURIDIQUE

Ce document est un **mémoire technique descriptif** rédigé pour faciliter la compréhension de l’œuvre Mobembo par un tiers (examinateur, conseil, organisme de dépôt). Il **ne constitue pas un avis juridique** et ne remplace pas les formalités spécifiques à chaque pays (INPI, OMPI, OBPIC, etc.). Le déposant est invité à consulter un professionnel du droit de la propriété intellectuelle pour choisir la forme de protection adaptée (droit d’auteur, marque, dépôt de code, etc.).

---

*Document généré à partir de l’analyse du dépôt source Mobembo v0.1.0 — usage confidentiel du titulaire.*
