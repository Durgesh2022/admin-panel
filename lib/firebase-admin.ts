import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizeEnvValue(value?: string) {
  if (!value) return undefined;

  let normalized = value.trim();

  if (normalized.endsWith(",")) {
    normalized = normalized.slice(0, -1).trim();
  }

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized;
}

function getPrivateKey() {
  const raw = normalizeEnvValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  if (!raw) return undefined;
  return raw.replace(/\\n/g, "\n");
}

function getServiceAccount() {
  const projectId = normalizeEnvValue(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = normalizeEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function getAdminDb() {
  const app = getAdminApp();
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getAdminApp();
  return getAuth(app);
}

function getAdminApp() {
  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminCredentialSource() {
  const projectId = normalizeEnvValue(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = normalizeEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);

  if (projectId || clientEmail) {
    return {
      mode: "env",
      value: `${projectId ?? "missing-project"} / ${clientEmail ?? "missing-email"}`,
    };
  }

  return {
    mode: "missing",
    value: "No Firebase Admin credentials detected.",
  };
}
