import React from "react";

export type Lang = "en" | "ar";

export type UserRecord = {
  [key: string]: unknown;
  role?: string;
  role_ar?: string;
  bio?: string;
  bio_ar?: string;
  location?: string;
  location_ar?: string;
  badges?: string[];
  badges_ar?: string[];
  tags?: string[];
  tags_ar?: string[];
};

export function translateUser(user: UserRecord, lang: Lang): UserRecord {
  if (!user) return user;
  const isAr = lang === "ar";

  const translated: UserRecord = { ...user };

  if (isAr && user.role_ar) translated.role = user.role_ar;
  
  if (isAr && user.bio_ar) translated.bio = user.bio_ar;
  
  if (isAr && user.location_ar) translated.location = user.location_ar;

  if (isAr && Array.isArray(user.badges_ar)) translated.badges = user.badges_ar;
  if (isAr && Array.isArray(user.tags_ar)) translated.tags = user.tags_ar;

  return translated;
}


export function useTranslatedUser(user: UserRecord | null, lang: Lang) {
  return React.useMemo(() => (user ? translateUser(user, lang) : null), [user, lang]);
}