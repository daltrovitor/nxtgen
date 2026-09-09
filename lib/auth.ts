import crypto from "crypto";
import { cookies } from "next/headers";
import { DEMO_USER, UserProfile, mockDb } from "./store/mock-db";

const JWT_SECRET = process.env.JWT_SECRET_OR_HMAC_KEY || "nxtgen_production_hardened_secret_9988_xyz";
const AUTH_COOKIE_NAME = "nxtgen_session";

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  salt: string;
  role: "user" | "partner" | "staff" | "admin";
  nxtScore: number;
  nxtLevel: number;
  avatarUrl: string;
  walletBalance: number;
  emailConfirmed: boolean;
  createdAt: string;
}

// In-Memory User Store seeded with Rafael Molina
class UserStore {
  private users: Map<string, StoredUser> = new Map();

  constructor() {
    // Hash default demo user password
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = this.hashPassword("Nxtgen2026!", salt);

    const initialUser: StoredUser = {
      id: DEMO_USER.id,
      email: DEMO_USER.email.toLowerCase(),
      fullName: DEMO_USER.name,
      passwordHash,
      salt,
      role: "user",
      nxtScore: DEMO_USER.nxtScore,
      nxtLevel: DEMO_USER.nxtLevel,
      avatarUrl: DEMO_USER.avatarUrl,
      walletBalance: DEMO_USER.walletBalance,
      emailConfirmed: true, // No email confirmation required!
      createdAt: new Date().toISOString(),
    };

    this.users.set(initialUser.email, initialUser);
  }

  hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  }

  findByEmail(email: string): StoredUser | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  findById(id: string): StoredUser | undefined {
    return Array.from(this.users.values()).find((u) => u.id === id);
  }

  createUser(email: string, fullName: string, plainPassword: string): StoredUser {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = this.hashPassword(plainPassword, salt);
    const id = `usr_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;

    const newUser: StoredUser = {
      id,
      email: normalizedEmail,
      fullName: fullName.trim(),
      passwordHash,
      salt,
      role: "user",
      nxtScore: 250, // Welcome bonus score
      nxtLevel: 1,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80",
      walletBalance: 0,
      emailConfirmed: true, // Auto-confirm without email confirmation!
      createdAt: new Date().toISOString(),
    };

    this.users.set(normalizedEmail, newUser);
    return newUser;
  }
}

export const userStore = new UserStore();

/**
 * Sign JWT session token
 */
export function createSessionToken(user: StoredUser): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify JWT session token
 */
export function verifySessionToken(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return { valid: false };
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return { valid: true, payload: decodedPayload };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * Get current authenticated user from cookies
 */
export async function getCurrentUser(): Promise<StoredUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const verification = verifySessionToken(token);
    if (!verification.valid || !verification.payload?.sub) return null;

    const user = userStore.findById(verification.payload.sub);
    return user || null;
  } catch {
    return null;
  }
}

export { AUTH_COOKIE_NAME };
