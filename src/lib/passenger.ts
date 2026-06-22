export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface PassengerInput {
  seatNumber: number;
  passengerName?: string;
  gender?: Gender;
  age: number | "";
  needsAssistance: boolean;
  assistanceNotes?: string;
}

export interface PassengerDetails {
  seatNumber: number;
  passengerName?: string | null;
  gender?: Gender | null;
  age?: number | null;
  needsAssistance?: boolean;
  assistanceNotes?: string | null;
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
  { value: "OTHER", label: "Autre" },
  { value: "PREFER_NOT_TO_SAY", label: "Ne pas préciser" },
];

export function genderLabel(gender?: Gender | null) {
  return GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? "—";
}

export function validatePassengers(
  selectedSeats: number[],
  passengers: Record<number, PassengerInput>
): string | null {
  for (const seat of selectedSeats) {
    const passenger = passengers[seat];
    if (!passenger || passenger.age === "" || passenger.age < 0 || passenger.age > 120) {
      return `Âge requis pour la place ${seat}`;
    }
    if (passenger.needsAssistance && !passenger.assistanceNotes?.trim()) {
      return `Précisez le type d'assistance pour la place ${seat}`;
    }
  }
  return null;
}
