"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Camera, Loader2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiData, getApiErrorMessage } from "@/lib/api-response";

const PROFILE_API = "/api/users/me";
const PROFILE_WITH_IMAGE_API = "/api/users/me?includeImage=1";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  role: string;
};

const MAX_IMAGE_BYTES = 350_000;

async function readImageAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Veuillez choisir une image (JPEG, PNG ou WebP)");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image trop volumineuse (max 350 Ko)");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Impossible de lire l'image"));
    };
    reader.onerror = () => reject(new Error("Impossible de lire l'image"));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch(PROFILE_WITH_IMAGE_API)
      .then(async (res) => {
        let data: unknown;
        try {
          data = await res.json();
        } catch {
          setError("Réponse invalide du serveur");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError(getApiErrorMessage(data, "Impossible de charger le profil"));
          setLoading(false);
          return;
        }
        const user = getApiData<ProfileData>(data);
        setProfile(user);
        setName(user.name);
        setPhone(user.phone ?? "");
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger le profil");
        setLoading(false);
      });
  }, [session?.user, status]);

  async function saveProfile(payload: {
    name?: string;
    phone?: string;
    imageUrl?: string | null;
  }) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(PROFILE_API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getApiErrorMessage(data, "Erreur lors de la mise à jour"));
        return;
      }

      const updated = getApiData<ProfileData & { hasImage?: boolean }>(data);
      const imageUrl =
        updated.imageUrl !== undefined ? updated.imageUrl : (profile?.imageUrl ?? null);
      const nextProfile = { ...updated, imageUrl };
      setProfile(nextProfile);
      setName(nextProfile.name);
      setPhone(nextProfile.phone ?? "");
      await update({
        name: nextProfile.name,
        hasImage: !!nextProfile.imageUrl,
      });
      setSuccess("Profil mis à jour");
    } catch {
      setError("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await readImageAsDataUrl(file);
      await saveProfile({ imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'image");
    } finally {
      e.target.value = "";
    }
  }

  async function handleRemovePhoto() {
    await saveProfile({ imageUrl: null });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile({
      name: name.trim(),
      phone: phone.trim(),
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-gray-900">Mon profil</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            {profile?.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt="Photo de profil"
                className="h-24 w-24 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
                <User className="h-10 w-10 text-orange-600" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white shadow hover:bg-orange-700 disabled:opacity-50"
              aria-label="Changer la photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Choisir une photo"}
            </Button>
            {profile?.imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={handleRemovePhoto}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer la photo
              </Button>
            )}
            <p className="text-xs text-gray-500">JPEG, PNG ou WebP — max 350 Ko</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+243 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
