import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "./firebase-admin";

export const ADMIN_USERS_COLLECTION = "admin_users";
export const ADMIN_SESSION_COOKIE = "traqo_admin_session";
export const ADMIN_SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
}

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const candidate = value as { toDate?: () => Date };
    return candidate.toDate?.() ?? null;
  }
  return null;
}

function mapAdminProfile(uid: string, data?: DocumentData): AdminProfile | null {
  if (!data) return null;

  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    name: typeof data.name === "string" ? data.name : "",
    active: data.active !== false,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lastLoginAt: toDate(data.lastLoginAt),
  };
}

export async function getAdminProfileByUid(uid: string) {
  const snapshot = await getAdminDb().collection(ADMIN_USERS_COLLECTION).doc(uid).get();
  return mapAdminProfile(uid, snapshot.data());
}

export async function createAdminProfile(params: {
  uid: string;
  email: string;
  name: string;
}) {
  const db = getAdminDb();
  const now = new Date();

  await db
    .collection(ADMIN_USERS_COLLECTION)
    .doc(params.uid)
    .set(
      {
        uid: params.uid,
        email: params.email,
        name: params.name,
        active: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      },
      { merge: true }
    );

  return getAdminProfileByUid(params.uid);
}

export async function touchAdminLogin(uid: string) {
  await getAdminDb().collection(ADMIN_USERS_COLLECTION).doc(uid).set(
    {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

export function isSignupAllowed(secret?: string) {
  const configuredSecret = process.env.ADMIN_SIGNUP_SECRET?.trim();

  if (!configuredSecret) {
    return true;
  }

  return secret?.trim() === configuredSecret;
}

export async function createAdminSessionCookie(idToken: string) {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: ADMIN_SESSION_MAX_AGE_MS,
  });
}

export async function verifyAdminAccessFromIdToken(idToken: string) {
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const profile = await getAdminProfileByUid(decoded.uid);

  if (!profile || !profile.active) {
    throw new Error("This account is not allowed to access the admin panel.");
  }

  return { decoded, profile };
}

export async function getOptionalAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const profile = await getAdminProfileByUid(decoded.uid);

    if (!profile || !profile.active) {
      return null;
    }

    return { decoded, profile };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getOptionalAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function createProfileFromDecodedToken(
  decoded: DecodedIdToken,
  params: { email?: string; name?: string }
) {
  const email = params.email?.trim() || decoded.email || "";
  const name = params.name?.trim() || decoded.name || email.split("@")[0] || "Admin";

  if (!email) {
    throw new Error("A valid email address is required for admin signup.");
  }

  const profile = await createAdminProfile({
    uid: decoded.uid,
    email,
    name,
  });

  if (!profile) {
    throw new Error("Unable to create the admin profile.");
  }

  return profile;
}
