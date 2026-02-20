import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validations";

export async function GET() {
  try {
    const companies = await prisma.transportCompany.findMany({
      include: { _count: { select: { buses: true, routes: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(companies);
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
    const parsed = companySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const company = await prisma.transportCompany.create({
      data: parsed.data,
    });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
