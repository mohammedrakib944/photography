"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  siteName: string;
  logoObjectKey?: string;
  tagline?: string;
  bioText?: string;
  contactEmail?: string;
  socialLinks?: Record<string, string>;
};

const LOGO_CONTENT_TYPES: Record<string, true> = {
  "image/png": true,
  "image/jpeg": true,
  "image/svg+xml": true,
};

/**
 * Local form state + save handler for the site settings form, plus the logo
 * upload flow: get a presigned PUT url, upload the file straight to object
 * storage, then just record the resulting object key on the form — nothing
 * is persisted until the form itself is submitted, same as every other
 * field here.
 */
export function useSettingsForm(initial: Settings) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function uploadLogo(file: File) {
    if (!LOGO_CONTENT_TYPES[file.type]) {
      setLogoError("Logo must be a PNG, JPG, or SVG image.");
      return;
    }
    setLogoError(null);
    setUploadingLogo(true);

    const urlRes = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type }),
    });
    if (!urlRes.ok) {
      setLogoError("Couldn't prepare the upload. Try again.");
      setUploadingLogo(false);
      return;
    }
    const { url, objectKey } = await urlRes.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      setLogoError("Upload failed. Try again.");
      setUploadingLogo(false);
      return;
    }

    setForm((f) => ({ ...f, logoObjectKey: objectKey }));
    setUploadingLogo(false);
  }

  function removeLogo() {
    setForm((f) => ({ ...f, logoObjectKey: undefined }));
  }

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

  return {
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
  };
}
