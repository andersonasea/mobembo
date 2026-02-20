import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        route: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        bus: {
          select: { plateNumber: true, model: true, totalSeats: true },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Horaire introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      ...schedule,
      route: {
        ...schedule.route,
        price: Number(schedule.route.price),
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
