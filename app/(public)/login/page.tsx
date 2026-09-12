import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
      <div className="w-full">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
