import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { register } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Registrieren" };

export default function RegisterPage() {
  return <AuthForm mode="register" action={register} />;
}
