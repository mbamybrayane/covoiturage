// app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Veuillez remplir tous les champs" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Créer la session
    const sessionId = crypto.randomUUID();
    const cookieStore = cookies();  // synchronique, ne pas faire await

    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set(
      "user_info",
      JSON.stringify({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        isDriver: user.isDriver,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    );

    const redirectUrl = user.isDriver
      ? `/dashboard/driver/${user.id}/`
      : `/dashboard/passenger/${user.id}/`;

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    );
  }
}
