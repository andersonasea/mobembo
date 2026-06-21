"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { getApiData } from "@/lib/api-response";

const PROFILE_API = "/api/users/me?includeImage=1";

type UserAvatarProps = {
  className?: string;
  iconClassName?: string;
};

export function UserAvatar({ className = "h-8 w-8", iconClassName = "h-4 w-4" }: UserAvatarProps) {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setImageUrl(null);
      return;
    }

    let cancelled = false;
    fetch(PROFILE_API)
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const user = getApiData<{ imageUrl: string | null }>(data);
        if (!cancelled) setImageUrl(user.imageUrl);
      })
      .catch(() => {
        if (!cancelled) setImageUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user, session?.user?.hasImage]);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`rounded-full border object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-orange-100 ${className}`}>
      <User className={`text-orange-600 ${iconClassName}`} />
    </div>
  );
}
