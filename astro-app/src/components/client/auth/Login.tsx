import { useState, useEffect, type FormEvent } from "react";

const ALLOWED_MESSAGES = {
  check_email_confirmation: "Please check your email to confirm your account.",
  access_denied: "Access denied.",
  otp_expired: "Email link is invalid or has expired.",
} as const;

type AllowedMessageKey = keyof typeof ALLOWED_MESSAGES;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const msgKey = searchParams.get("message");
    const errKey = searchParams.get("error");

    if (msgKey && msgKey in ALLOWED_MESSAGES) {
      setGlobalMessage(ALLOWED_MESSAGES[msgKey as AllowedMessageKey]);
    }

    if (errKey && errKey in ALLOWED_MESSAGES) {
      setGlobalError(ALLOWED_MESSAGES[errKey as AllowedMessageKey]);
    }

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hashParams.get("error");
    const hashErrorDesc = hashParams.get("error_description");

    if (hashError && hashErrorDesc) {
      setFormError(hashErrorDesc);
    }
  }, []);

  const clearErrors = () => {
    setFormError(null);
    setGlobalError(null);
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearErrors();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.error) {
        setFormError(json.error);
        setLoading(false);
        return;
      }

      if (json.redirect) {
        window.location.href = json.redirect;
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("provider", "google");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.redirect) {
        window.location.href = json.redirect;
      }
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>

        {globalMessage && (
          <div className="mt-4 text-sm text-center p-2 bg-green-200 border border-green-500 rounded-md">
            <p>{globalMessage}</p>
          </div>
        )}

        {globalError && (
          <div className="mt-4 text-sm text-center p-2 bg-red-200 border border-red-500 rounded-md">
            <p>{globalError}</p>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <form onSubmit={handleGoogleLogin}>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-semibold leading-6">
                  Sign in with Google
                </span>
              </button>
            </form>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFormError(null)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFormError(null)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {formError && (
              <div className="text-sm text-center p-2 bg-red-200 border border-red-500 rounded-md">
                <p>{formError}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary/80 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          <p className="text-sm text-center mt-2">
            Dont have an account?{" "}
            <a href="/register" className="hover:underline">
              Register here
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}