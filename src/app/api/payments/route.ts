import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { bookingId, method, phoneNumber } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    if (booking.payment) {
      return NextResponse.json({ error: "Un paiement existe déjà pour cette réservation" }, { status: 400 });
    }

    // TODO: Intégrer l'API réelle du fournisseur de paiement (M-Pesa, Airtel, etc.)
    // Pour l'instant, on simule la création du paiement
    const transactionRef = `MOB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          bookingId,
          amount: booking.totalPrice,
          method: method as "MPESA" | "AIRTEL_MONEY" | "ORANGE_MONEY" | "AFRI_MONEY",
          phoneNumber,
          transactionRef,
          status: "PENDING",
        },
      });

      // Simule la confirmation immédiate (en production, attendre le webhook)
      await tx.payment.update({
        where: { id: newPayment.id },
        data: { status: "SUCCESS", paidAt: new Date() },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });

      return newPayment;
    });

    return NextResponse.json({
      ...payment,
      amount: Number(payment.amount),
      status: "SUCCESS",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors du paiement" }, { status: 500 });
  }
}
