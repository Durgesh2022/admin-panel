import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_MS,
  createAdminSessionCookie,
  createProfileFromDecodedToken,
  isSignupAllowed,
} from "@/lib/admin-auth";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idToken?: string;
      name?: string;
      email?: string;
      signupSecret?: string;
    };

    const idToken = body.idToken?.trim();
    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    if (!isSignupAllowed(body.signupSecret)) {
      return NextResponse.json(
        { error: "Signup is restricted. Enter the correct admin signup code." },
        { status: 403 }
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const profile = await createProfileFromDecodedToken(decoded, {
      name: body.name,
      email: body.email,
    });
    const sessionCookie = await createAdminSessionCookie(idToken);

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
      error instanceof Error ? error.message : "Unable to complete admin signup.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
