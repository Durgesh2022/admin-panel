import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_MS,
  createAdminSessionCookie,
  touchAdminLogin,
  verifyAdminAccessFromIdToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body.idToken?.trim();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    const { profile } = await verifyAdminAccessFromIdToken(idToken);
    const sessionCookie = await createAdminSessionCookie(idToken);

    await touchAdminLogin(profile.uid);

    const response = NextResponse.json({
      ok: true,
      profile: {
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
      },
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_MS / 1000,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create admin session.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
