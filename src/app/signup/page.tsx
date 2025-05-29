
import { SignupForm } from "@/components/auth/SignupForm";
import { APP_NAME } from "@/lib/constants";
import NextLink from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
         <div className="text-center">
            <NextLink href="/" className="flex items-center justify-center gap-2 mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {APP_NAME}
                </h1>
            </NextLink>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Crie sua conta
          </h2>
          <p className="text-sm text-muted-foreground">
            É rápido e fácil. Comece a organizar suas finanças hoje mesmo.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
