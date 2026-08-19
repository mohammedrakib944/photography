"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsForm } from "@/features/admin/hooks/use-settings-form";

type Settings = {
  siteName: string;
  logoObjectKey?: string;
  tagline?: string;
  bioText?: string;
  contactEmail?: string;
  socialLinks?: Record<string, string>;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const {
    form,
    setForm,
    status,
    saving,
    handleSubmit,
    uploadingLogo,
    logoError,
    uploadLogo,
    removeLogo,
    logoInputRef,
  } = useSettingsForm(initial);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-lg flex-col gap-5 rounded-2xl border border-border p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
            {form.logoObjectKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/images/${encodeURIComponent(form.logoObjectKey)}`}
                alt="Logo preview"
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <span className="text-[10px] text-muted-foreground uppercase">No logo</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? "Uploading…" : form.logoObjectKey ? "Replace" : "Upload logo"}
              </Button>
              {form.logoObjectKey && (
                <Button type="button" variant="ghost" size="sm" onClick={removeLogo}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, or SVG. Leave empty to show the site name as text instead.
            </p>
            {logoError && <p className="text-xs text-destructive">{logoError}</p>}
          </div>
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadLogo(file);
            e.target.value = "";
          }}
        />
      </div>
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
