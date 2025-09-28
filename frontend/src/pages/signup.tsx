import * as React from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase";


function AuthShellRegister({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[100vh] w-full flex items-center justify-center from-white to-pearl text-midBlue dark:text-lightPurple">
      <div className="w-full max-w-md m-6 rounded-2xl bg-white/50 dark:bg-darkBlue/50 border-1 border-accent/40 dark:border-darkPurple/40 backdrop-blur-3xl shadow-lg">
        <div className="px-8 pt-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-center items-center">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-sm text-center opacity-80">{subtitle}</p> : null}
        </div>
        <div className="p-8 pt-6">{children}</div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        
        const idToken = await result.user.getIdToken();
  
        const response = await fetch("http://127.0.0.1:8000/auth/google/login", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idToken }),
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Google login failed.");
        }
  
        localStorage.setItem("accessToken", data.access_token);
        navigate("/dashboard");
  
      } catch (err: any) {
        setError(err.message);
      }
    };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create account.");
      }
      
      navigate("/login");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthShellRegister title="Join us on Green Light" subtitle="Create your account!">
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-11 px-6 w-full flex items-center justify-center gap-2 hover:cursor-pointer"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </Button>

        <div className="flex items-center space-x-2 my-2">
          <div className="flex-grow border-b"></div>
          <span className="text-sm font-bold">or</span>
          <div className="flex-grow border-b"></div>
        </div>

        <form onSubmit={handleSignup} className="grid gap-4">
          {error && <p className="text-xs text-center text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">First name</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                <Input
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Last name</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                <Input
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </label>
          </div>

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
                minLength={6}
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

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Confirm password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-9 pr-10"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <Button type="submit" className="h-11 px-6 cursor-pointer bg-midBlue hover:bg-darkBlue dark:bg-lightPurple dark:text-darkBlue font-bold dark:hover:bg-lightPurple/90">Register</Button>
          <p className="text-xs text-center opacity-80">
          Already have an account? <Link to="/login" className="font-bold underline">Login </Link>
          </p>
         
        </form>
      </div>
    </AuthShellRegister>
  );
}
