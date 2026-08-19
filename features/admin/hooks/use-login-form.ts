"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Submits admin login credentials and routes into the dashboard on success.
 */
export function useLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Login failed" }));
      setError(error);
      setSubmitting(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return { error, submitting, handleSubmit };
}
