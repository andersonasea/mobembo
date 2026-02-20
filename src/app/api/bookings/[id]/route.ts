import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: {
              include: {
                company: { select: { name: true } },
              },
            },
            bus: { select: { model: true, plateNumber: true } },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    return NextResponse.json({
      ...booking,
      totalPrice: Number(booking.totalPrice),
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
