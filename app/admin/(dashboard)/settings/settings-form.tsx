"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Settings = {
  siteName: string;
  tagline?: string;
  bioText?: string;
  contactEmail?: string;
  socialLinks?: Record<string, string>;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("Saving…");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "Saved" : "Failed to save");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="siteName">Site name</Label>
        <Input
          id="siteName"
          value={form.siteName}
          onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={form.tagline ?? ""}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bioText">Bio</Label>
        <Textarea
          id="bioText"
          value={form.bioText ?? ""}
          onChange={(e) => setForm({ ...form, bioText: e.target.value })}
          rows={6}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contactEmail">Contact email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={form.contactEmail ?? ""}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instagram">Instagram URL</Label>
        <Input
          id="instagram"
          value={form.socialLinks?.instagram ?? ""}
          onChange={(e) =>
            setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })
          }
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </div>
    </form>
  );
}
