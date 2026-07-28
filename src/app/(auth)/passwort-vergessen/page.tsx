import type { Metadata } from "next";

import { RequestResetForm } from "@/components/recovery-forms";

export const metadata: Metadata = { title: "Passwort vergessen" };

export default function ForgotPasswordPage() {
  return <RequestResetForm />;
}
