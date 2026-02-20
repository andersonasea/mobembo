import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { busSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    const buses = await prisma.bus.findMany({
      where: companyId ? { companyId } : undefined,
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(buses);
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
    const parsed = busSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.create({
      data: parsed.data,
    });

    return NextResponse.json(bus, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
