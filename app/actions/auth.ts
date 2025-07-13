/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Type pour les données de connexion
export type LoginData = {
  email: string;
  password: string;
};

// Type pour les données d'inscription
export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  isDriver: boolean;
};

// Fonction pour se connecter
export async function login(data: LoginData) {
  // Validation des données
  if (!data.email || !data.password) {
    return {
      success: false,
      message: "Veuillez remplir tous les champs",
    };
  }

  if (!isValidEmail(data.email)) {
    return {
      success: false,
      message: "Format d'email invalide",
    };
  }

  // Recherche de l'utilisateur et vérification du mot de passe
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }

    // Création de la session et stockage dans les cookies
    const sessionId = crypto.randomUUID();
    const cookieStore = await cookies();

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

    // Redirection vers le tableau de bord approprié
    const redirectPath = user.isDriver
      ? `/dashboard/driver/${user.id}/`
      : `/dashboard/passenger/${user.id}/`;
    redirect(redirectPath);
  } catch (error) {
    console.error("Erreur d'authentification :", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la connexion",
    };
  }
}

// Fonction pour valider le format de l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour s'inscrire
export async function signup(data: SignupData) {
  // 1) Vérification de l'email existant
  let newUser;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new Error("EMAIL_IN_USE");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    newUser = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: hashedPassword,
        isDriver: data.isDriver,
      },
    });
  } catch (error: any) {
    console.error("Erreur d'inscription :", error);
    return {
      success: false,
      message:
        error.message === "EMAIL_IN_USE"
          ? "Cet email est déjà utilisé"
          : "Une erreur est survenue lors de l'inscription",
    };
  }

  // 2) Création de la session et stockage dans les cookies
  const sessionId = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  cookieStore.set(
    "user_info",
    JSON.stringify({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isDriver: newUser.isDriver,
    }),
    {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  // 3) Redirection hors de tout bloc try/catch
  const redirectPath = newUser.isDriver
    ? `/dashboard/driver/${newUser.id}/`
    : `/dashboard/passenger/${newUser.id}/`;
  redirect(redirectPath);
}

// Fonction pour se déconnecter
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_id");
  cookieStore.delete("user_info");
  redirect("/");
}

// Fonction pour vérifier si l'utilisateur est connecté
export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  const userInfo = cookieStore.get("user_info")?.value;

  if (!sessionId || !userInfo) {
    return null;
  }

  try {
    return JSON.parse(userInfo);
  } catch {
    return null;
  }
}
