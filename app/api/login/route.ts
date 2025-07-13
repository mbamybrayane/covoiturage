import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Récupérer les données du corps de la requête
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Veuillez remplir tous les champs" },
        { status: 400 }
      );
    }

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Créer une session
    const sessionId = crypto.randomUUID();
    const cookieStore = await cookies();

    // Définir les cookies
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
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

    // Déterminer l'URL de redirection
    const redirectUrl = user.isDriver
      ? `/dashboard/driver/${user.id}/`
      : `/dashboard/passenger/${user.id}/`;

    // Retourner une réponse réussie avec l'URL de redirection
    return NextResponse.json({
      success: true,
      redirectUrl,
    });
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la connexion",
      },
      { status: 500 }
    );
  }
}
