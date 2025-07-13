// app/auth/login/actions.ts
"use server";

import { login } from "@/app/actions/auth";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  await login({ email, password });
}
