import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { login } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Anmelden" };

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
