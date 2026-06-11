"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase-Client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Get the redirect path from URL (e.g. ?redirect=/book)
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const redirectTo = searchParams.get("redirect") || "/book";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        // Optional: you can pass metadata here
        options: {
          emailRedirectTo: `${window.location.origin}/login?redirect=${redirectTo}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // After sign up, we may need email confirmation (depending on settings)
      alert("Check your email for a confirmation link. Then log in.");
      setLoading(false);
      setIsSignUp(false); // switch back to login mode
      return;
    } else {
      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Successful login → redirect back to the booking page
      router.push(redirectTo);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded border p-8 shadow">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? "Create Account" : "Log In"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isSignUp
              ? "Sign Up"
              : "Log In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-blue-600 underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-blue-600 underline"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}