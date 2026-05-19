"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Institution {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  motto?: string;
  website?: string;
  contactEmail?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000";

export default function BrandingPage() {
  const [inst, setInst] = useState<Institution | null>(null);
  const [form, setForm] = useState<Partial<Institution>>({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadInstitution() {
    try {
      const { data } = await api.get("/institutions/me");
      setInst(data.data);
      setForm(data.data);
    } catch {
      setMessage("Failed to load institution");
    }
  }

  useEffect(() => {
    loadInstitution();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!inst) return;
    setIsSaving(true);
    setMessage("");
    try {
      const { data } = await api.put(`/institutions/${inst.id}`, form);
      setInst(data.data);
      setMessage("Branding saved successfully");
    } catch (err: any) {
      setMessage(err.response?.data?.error?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!inst || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Logo must be under 2MB");
      return;
    }
    const fd = new FormData();
    fd.append("logo", file);
    setIsUploading(true);
    setMessage("");
    try {
      const { data } = await api.post(`/institutions/${inst.id}/logo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setInst(data.data);
      setForm(data.data);
      setMessage("Logo uploaded successfully");
    } catch (err: any) {
      setMessage(err.response?.data?.error?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!inst) {
    return <div className="text-muted-foreground">Loading institution...</div>;
  }

  const logoSrc = inst.logoUrl?.startsWith("http") ? inst.logoUrl : `${API_BASE}${inst.logoUrl}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Institution Branding</h1>
        <p className="text-muted-foreground">Customize the look and feel of your institution&apos;s portals</p>
      </div>

      {message && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">{message}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Public information about your institution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution Name</label>
                <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Short Name</label>
                  <Input value={form.shortName || ""} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="e.g. KNUST" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motto</label>
                <Input value={form.motto || ""} onChange={(e) => setForm({ ...form, motto: e.target.value })} placeholder="e.g. Nyansapo wosane no badwemma" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input type="email" value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.primaryColor || "#0f172a"}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="h-10 w-14 rounded border"
                    />
                    <Input value={form.primaryColor || ""} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} placeholder="#0f172a" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.accentColor || "#3b82f6"}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="h-10 w-14 rounded border"
                    />
                    <Input value={form.accentColor || ""} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} placeholder="#3b82f6" />
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>PNG/JPG/SVG up to 2MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-48 items-center justify-center rounded-md border-2 border-dashed">
              {inst.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt="Institution logo" className="max-h-44 max-w-full object-contain" />
              ) : (
                <p className="text-sm text-muted-foreground">No logo uploaded</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
              {isUploading ? "Uploading..." : inst.logoUrl ? "Replace Logo" : "Upload Logo"}
            </Button>

            <div className="rounded-md border p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Preview</p>
              <div
                className="flex items-center gap-3 rounded p-3"
                style={{ backgroundColor: form.primaryColor || "#0f172a", color: "white" }}
              >
                {inst.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt="Logo preview" className="h-8 w-8 rounded bg-white p-1 object-contain" />
                )}
                <div>
                  <p className="font-semibold">{form.name || "Institution Name"}</p>
                  {form.motto && <p className="text-xs opacity-80">{form.motto}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
