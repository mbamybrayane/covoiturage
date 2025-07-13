// app/auth/login/page.tsx
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car, Eye, EyeOff } from "lucide-react";
import { login } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

// Si l'utilisateur est déjà connecté, on le redirige automatiquement
export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    const home = session.isDriver
      ? `/dashboard/driver/${session.id}`
      : `/dashboard/passenger/${session.id}`;
    redirect(home);
  }

  async function handleLogin(formData: FormData) {
    "use server";
    await login({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">RideShare</span>
          </div>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Pas encore de compte ? </span>
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              S'inscrire
            </Link>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Demo : utilisez "driver@test.com" pour un compte chauffeur</p>
            <p>ou "passenger@test.com" pour un compte passager</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
