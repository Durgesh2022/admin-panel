import { redirect } from "next/navigation";
import { getOptionalAdminSession } from "@/lib/admin-auth";
import { AuthForm } from "../_components/auth-form";

export default async function LoginPage() {
  const session = await getOptionalAdminSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthForm
      mode="login"
      title="Admin Login"
      subtitle="Sign in with your admin email and password."
    />
  );
}
