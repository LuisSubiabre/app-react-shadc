import { PasswordResetForm } from "@/components/password-reset-form";

export default function PasswordReset() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <PasswordResetForm />
      </div>
    </div>
  );
}
