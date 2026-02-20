import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    const routes = await prisma.route.findMany({
      where: companyId ? { companyId } : undefined,
      include: { company: { select: { name: true } } },
      orderBy: { departure: "asc" },
    });

    return NextResponse.json(
      routes.map((r) => ({ ...r, price: Number(r.price) }))
    );
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
    const parsed = routeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const route = await prisma.route.create({
      data: parsed.data,
    });

    return NextResponse.json(route, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
