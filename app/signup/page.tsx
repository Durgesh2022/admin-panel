import { redirect } from "next/navigation";
import { getOptionalAdminSession } from "@/lib/admin-auth";
import { AuthForm } from "../_components/auth-form";

export default async function SignupPage() {
  const session = await getOptionalAdminSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthForm
      mode="signup"
      title="Create Admin Account"
      subtitle="Create an admin account with your name, email, and password."
    />
  );
}
