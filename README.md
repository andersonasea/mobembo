This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.







Architecture de l'Application ReservationBus

Vue d'ensemble

Application web fullstack utilisant Next.js 14+ (App Router) pour le frontend et l'API backend, PostgreSQL comme base de données avec Prisma comme ORM, et des intégrations de paiement mobile money.

graph TB
  subgraph client [Client - Navigateur]
    NextFrontend["Next.js Frontend (React)"]
  end

  subgraph server [Serveur Next.js]
    AppRouter["App Router (Pages + API Routes)"]
    AuthMiddleware["Middleware Auth (JWT)"]
    APIRoutes["API Routes (/api/*)"]
  end

  subgraph database [Base de Donnees]
    PostgreSQL["PostgreSQL"]
  end

  subgraph payments [Passerelles de Paiement]
    MPesa["M-Pesa API"]
    Airtel["Airtel Money API"]
    Orange["Orange Money API"]
    Afri["Afri Money API"]
  end

  NextFrontend -->|"Requetes HTTP"| AppRouter
  AppRouter --> AuthMiddleware
  AuthMiddleware --> APIRoutes
  APIRoutes -->|"Prisma ORM"| PostgreSQL
  APIRoutes -->|"Webhooks / API"| MPesa
  APIRoutes -->|"Webhooks / API"| Airtel
  APIRoutes -->|"Webhooks / API"| Orange
  APIRoutes -->|"Webhooks / API"| Afri

Stack Technique





Frontend : Next.js 14+ (App Router), React, Tailwind CSS, shadcn/ui



Backend : Next.js API Routes (Route Handlers)



ORM : Prisma



Base de donnees : PostgreSQL



Authentification : NextAuth.js (JWT)



Validation : Zod



Paiement : APIs mobile money via des librairies/REST

Structure du Projet

ReservationBus/
├── prisma/
│   ├── schema.prisma          # Schema de la BDD
│   └── seed.ts                # Donnees initiales
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (client)/
│   │   │   ├── page.tsx                    # Liste des societes
│   │   │   ├── company/[id]/page.tsx       # Destinations d'une societe
│   │   │   ├── destination/[id]/page.tsx   # Horaires d'une destination
│   │   │   ├── schedule/[id]/page.tsx      # Bus et places disponibles
│   │   │   ├── booking/page.tsx            # Recapitulatif et selection places
│   │   │   └── payment/page.tsx            # Page de paiement
│   │   ├── admin/
│   │   │   ├── page.tsx                    # Dashboard admin
│   │   │   ├── companies/page.tsx          # Gestion societes
│   │   │   ├── buses/page.tsx              # Gestion bus
│   │   │   ├── destinations/page.tsx       # Gestion destinations
│   │   │   └── schedules/page.tsx          # Affectation bus/destinations
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── companies/route.ts
│   │   │   ├── destinations/route.ts
│   │   │   ├── schedules/route.ts
│   │   │   ├── bookings/route.ts
│   │   │   └── payments/
│   │   │       ├── route.ts
│   │   │       └── webhook/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # Composants shadcn/ui
│   │   ├── BookingWizard.tsx   # Wizard etape par etape
│   │   ├── SeatPicker.tsx      # Selection de places
│   │   ├── PaymentForm.tsx     # Formulaire paiement
│   │   └── AdminSidebar.tsx    # Navigation admin
│   ├── lib/
│   │   ├── prisma.ts           # Client Prisma singleton
│   │   ├── auth.ts             # Config NextAuth
│   │   ├── payments/
│   │   │   ├── mpesa.ts
│   │   │   ├── airtel.ts
│   │   │   ├── orange.ts
│   │   │   └── afrimoney.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
├── .env
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts

Modele de Donnees (Schema Prisma)

erDiagram
    User ||--o{ Booking : "effectue"
    TransportCompany ||--o{ Bus : "possede"
    TransportCompany ||--o{ Route : "propose"
    Route ||--o{ Schedule : "a"
    Schedule }o--|| Bus : "utilise"
    Schedule ||--o{ Booking : "concerne"
    Booking ||--|| Payment : "genere"

    User {
        string id PK
        string name
        string email
        string phone
        string password
        enum role "CLIENT ou ADMIN"
    }

    TransportCompany {
        string id PK
        string name
        string logo
        string phone
        string email
        boolean isActive
        datetime subscribedAt
    }

    Bus {
        string id PK
        string plateNumber
        int totalSeats
        string model
        string companyId FK
    }

    Route {
        string id PK
        string departure
        string destination
        decimal price
        int durationMinutes
        string companyId FK
    }

    Schedule {
        string id PK
        string routeId FK
        string busId FK
        datetime departureTime
        datetime arrivalTime
        int availableSeats
        enum status "ACTIVE CANCELLED COMPLETED"
    }

    Booking {
        string id PK
        string userId FK
        string scheduleId FK
        int seatsBooked
        decimal totalPrice
        enum status "PENDING CONFIRMED CANCELLED"
        datetime createdAt
    }

    Payment {
        string id PK
        string bookingId FK
        decimal amount
        enum method "MPESA AIRTEL ORANGE AFRIMONEY"
        enum status "PENDING SUCCESS FAILED"
        string transactionRef
        datetime paidAt
    }

Flux Utilisateur (Client)

flowchart LR
    A["Connexion / Inscription"] --> B["Liste des Societes"]
    B --> C["Choix Societe"]
    C --> D["Liste Destinations"]
    D --> E["Choix Destination"]
    E --> F["Horaires Disponibles"]
    F --> G["Choix Horaire"]
    G --> H["Selection Places"]
    H --> I["Recapitulatif"]
    I --> J["Paiement Mobile Money"]
    J --> K["Confirmation / Ticket"]

Flux Admin

flowchart TB
    AdminDash["Dashboard Admin"] --> GestionSocietes["Gerer Societes de Transport"]
    AdminDash --> GestionBus["Gerer Bus"]
    AdminDash --> GestionRoutes["Gerer Routes / Destinations"]
    AdminDash --> GestionHoraires["Gerer Horaires et Affectations"]
    AdminDash --> VoirReservations["Voir Reservations"]

    GestionSocietes --> CreerSociete["Creer / Modifier / Desactiver"]
    GestionBus --> AjouterBus["Ajouter Bus a une Societe"]
    GestionRoutes --> CreerRoute["Creer Depart - Destination + Prix"]
    GestionHoraires --> AffecterBus["Affecter Bus a Route + Horaire"]

Integration Paiement Mobile Money

Chaque fournisseur expose une API REST. Le flux general est :





L'utilisateur choisit son moyen de paiement et entre son numero de telephone



L'API backend initie une demande de paiement (push USSD vers le telephone)



L'utilisateur confirme sur son telephone



Le fournisseur envoie un webhook de confirmation a notre serveur



Le statut de la reservation passe de PENDING a CONFIRMED

Les APIs specifiques a integrer :





M-Pesa : via Vodacom M-Pesa API (ou aggregateur comme Flutterwave/PayUnit)



Airtel Money : via Airtel Money API



Orange Money : via Orange Money API



Afri Money : via Afri Money API



Pour simplifier, on peut utiliser un aggregateur de paiement comme Flutterwave, PayUnit ou MaxiCash qui supporte plusieurs de ces methodes en une seule integration.

Securite





Authentification via NextAuth.js avec sessions JWT



Middleware de protection des routes admin



Validation des entrees avec Zod sur chaque API route



Protection CSRF integree a Next.js



Variables sensibles dans .env (cles API paiement, secret JWT, DATABASE_URL)

Etapes d'Implementation

Les etapes sont organisees de facon incrementale : chaque etape produit quelque chose de fonctionnel.
