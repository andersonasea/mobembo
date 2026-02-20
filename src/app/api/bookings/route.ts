import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { scheduleId, seatsBooked } = parsed.data;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { route: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Horaire introuvable" }, { status: 404 });
    }

    if (schedule.status !== "ACTIVE") {
      return NextResponse.json({ error: "Cet horaire n'est plus disponible" }, { status: 400 });
    }

    if (schedule.availableSeats < seatsBooked) {
      return NextResponse.json(
        { error: `Seulement ${schedule.availableSeats} place(s) disponible(s)` },
        { status: 400 }
      );
    }

    const totalPrice = Number(schedule.route.price) * seatsBooked;

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          scheduleId,
          seatsBooked,
          totalPrice,
        },
      });

      await tx.schedule.update({
        where: { id: scheduleId },
        data: { availableSeats: { decrement: seatsBooked } },
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la réservation" }, { status: 500 });
  }
}
