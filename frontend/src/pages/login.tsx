import * as React from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[100vh] w-full flex items-center justify-center from-white to-pearl text-midBlue">
      <div className="w-full max-w-md m-6 rounded-2xl bg-white/50 border-2 border-accent/40 backdrop-blur-3xl shadow-lg">
        <div className="px-8 pt-8">
          <h1 className="text-3xl font-extrabold text-center tracking-tight">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-sm text-center opacity-80">{subtitle}</p> : null}
        </div>
        <div className="p-8 pt-6">{children}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <AuthShell title="Welcome back!" subtitle="Log in to your account!">
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-11 px-6 w-full flex items-center justify-center gap-2"
          onClick={() => console.log("Login with Google clicked")}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Login with Google
        </Button>

        <div className="flex items-center space-x-2 my-2">
          <div className="flex-grow border-b"></div>
          <span className="text-sm font-bold">or</span>
          <div className="flex-grow border-b"></div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <Button type="submit" className="h-11 px-6">Sign in</Button>
          <p className="text-xs text-center opacity-80">
            Don't have an account? <Link to="/signup" className="font-bold underline">Register</Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
