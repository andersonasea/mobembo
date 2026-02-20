import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(9, "Numéro de téléphone invalide").optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const companySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const busSchema = z.object({
  plateNumber: z.string().min(3, "Numéro de plaque invalide"),
  model: z.string().optional(),
  totalSeats: z.coerce.number().int().min(1, "Le nombre de places doit être supérieur à 0"),
  companyId: z.string().min(1, "Société de transport requise"),
});

export const routeSchema = z.object({
  departure: z.string().min(2, "Lieu de départ requis"),
  destination: z.string().min(2, "Destination requise"),
  price: z.coerce.number().positive("Le prix doit être positif"),
  durationMinutes: z.coerce.number().int().positive().optional(),
  companyId: z.string().min(1, "Société de transport requise"),
});

export const scheduleSchema = z.object({
  routeId: z.string().min(1, "Trajet requis"),
  busId: z.string().min(1, "Bus requis"),
  departureTime: z.string().min(1, "Heure de départ requise"),
  arrivalTime: z.string().optional(),
});

export const bookingSchema = z.object({
  scheduleId: z.string().min(1, "Horaire requis"),
  seatsBooked: z.coerce.number().int().min(1, "Au moins 1 place requise"),
});

export const paymentSchema = z.object({
  bookingId: z.string().min(1, "Réservation requise"),
  method: z.enum(["MPESA", "AIRTEL_MONEY", "ORANGE_MONEY", "AFRI_MONEY"]),
  phoneNumber: z.string().min(9, "Numéro de téléphone invalide"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type BusInput = z.infer<typeof busSchema>;
export type RouteInput = z.infer<typeof routeSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
