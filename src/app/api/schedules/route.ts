import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");

    const schedules = await prisma.schedule.findMany({
      where: routeId ? { routeId } : undefined,
      include: {
        route: {
          include: { company: { select: { name: true } } },
        },
        bus: { select: { plateNumber: true, model: true, totalSeats: true } },
      },
      orderBy: { departureTime: "asc" },
    });
    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { routeId, busId, departureTime, arrivalTime } = parsed.data;

    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      return NextResponse.json({ error: "Bus introuvable" }, { status: 404 });
    }

    const schedule = await prisma.schedule.create({
      data: {
        routeId,
        busId,
        departureTime: new Date(departureTime),
        arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
        availableSeats: bus.totalSeats,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
