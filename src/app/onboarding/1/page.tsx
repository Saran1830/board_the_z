"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import GlassCard from "../../../components/GlassCard";
import StepIndicator from "../../../components/StepIndicator";

// You may want to use environment variables for these values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export default function Onboarding1() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const router = useRouter();

  function validateEmail(email: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }
  function validatePassword(password: string) {
    // At least 8 chars, one letter, one number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(password);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters, include a letter and a number.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
      let authResult;
      if (mode === "signup") {
        authResult = await supabase.auth.signUp({ email, password });
        if (!authResult.error && authResult.data?.user) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
          if (!existingUser) {
            await supabase
              .from('users')
              .insert({
                email,
                current_step: 1,
                is_completed: false,
              });
          }
        }
      } else {
        authResult = await supabase.auth.signInWithPassword({ email, password });
        if (!authResult.error && authResult.data?.user) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
          let userId;
          if (!existingUser) {
            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .insert({
                email,
                current_step: 1,
                is_completed: false,
              })
              .select('id')
              .single();
            if (insertError) {
              setError('Failed to create user record');
              return;
            }
            userId = insertedUser?.id;
          } else {
            userId = existingUser.id;
          }
          if (userId) {
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', userId)
              .single();
            if (!existingProfile) {
              await supabase
                .from('user_profiles')
                .insert({ user_id: userId });
            }
          }
        }
      }
      setLoading(false);
      if (authResult.error) {
        setError(authResult.error.message || "Unknown error");
        if (
          mode === "signup" &&
          authResult.error.message?.toLowerCase().includes("already registered")
        ) {
          alert("Email already exists. Please sign in.");
          setMode("signin");
          setError("");
        }
      } else {
        setSuccess(
          mode === "signup"
            ? "Signed up successfully!"
            : "Signed in successfully!"
        );
        window.location.href = '/onboarding/2';
      }
    } catch {
      setLoading(false);
      setError("Network or server error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `url('/background.jpg') center/cover no-repeat, linear-gradient(120deg, #f8faff 0%, #f7e9f7 100%)`,
        transition: "background 0.3s",
      }}
    >
      <GlassCard style={{ maxWidth: 420, width: "100%", margin: "auto" }}>
        <StepIndicator current={1} total={3} />
        <h2 style={{ textAlign: "center", fontWeight: 700, fontSize: 28, marginBottom: 8 }}>{mode === "signup" ? "Sign Up" : "Sign In"}</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, display: "block" }}>Email Address</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 16, padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: "rgba(255,255,255,0.6)", outline: "none" }}
          />
          <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, display: "block" }}>Password</label>
          <input
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 16, padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: "rgba(255,255,255,0.6)", outline: "none" }}
          />
          {mode === "signup" && (
            <>
              <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, display: "block" }}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", marginBottom: 16, padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #e0e0e0', background: "rgba(255,255,255,0.6)", outline: "none" }}
              />
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 14, fontSize: 18, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 8, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            {loading ? (mode === "signup" ? "Signing Up..." : "Signing In...") : (mode === "signup" ? "Sign Up" : "Sign In")}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          style={{ width: "100%", padding: 12, fontSize: 16, background: '#f7f7f7', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
        >
          {mode === "signup" ? "Already have an account? Sign In" : "New user? Sign Up"}
        </button>
        {error && <div style={{ color: "#e00", marginTop: 12, textAlign: "center" }}>{error}</div>}
        {success && <div style={{ color: "#090", marginTop: 12, textAlign: "center" }}>{success}</div>}
      </GlassCard>
    </div>
  );
}
