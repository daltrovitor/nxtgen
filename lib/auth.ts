import crypto from "crypto";
import { cookies } from "next/headers";

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

const DEFAULT_DEMO_USER = {
  id: "usr_demo_rafael",
  name: "Rafael Molina",
  email: "rafael.molina@nxtgen.app",
  nxtScore: 2150,
  nxtLevel: 3,
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80",
  walletBalance: 124.5,
};

// In-Memory User Store seeded with Rafael Molina
class UserStore {
  private users: Map<string, StoredUser> = new Map();

  constructor() {
    // Hash default demo user password
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = this.hashPassword("Nxtgen2026!", salt);

    // 1. Normal user (role: 'user')
    const initialUser: StoredUser = {
      id: DEFAULT_DEMO_USER.id,
      email: DEFAULT_DEMO_USER.email.toLowerCase(),
      fullName: DEFAULT_DEMO_USER.name,
      passwordHash,
      salt,
      role: "user",
      nxtScore: DEFAULT_DEMO_USER.nxtScore,
      nxtLevel: DEFAULT_DEMO_USER.nxtLevel,
      avatarUrl: DEFAULT_DEMO_USER.avatarUrl,
      walletBalance: DEFAULT_DEMO_USER.walletBalance,
      emailConfirmed: true, // No email confirmation required!
      createdAt: new Date().toISOString(),
    };
    this.users.set(initialUser.email, initialUser);

    // 2. Administrator account (role: 'admin') - verified role separation
    const adminSalt = crypto.randomBytes(16).toString("hex");
    const adminPassHash = this.hashPassword("AdminNxtgen2026!", adminSalt);
    const adminUser: StoredUser = {
      id: "usr_admin_master",
      email: "admin@ashens.store",
      fullName: "Administrador Master NXTGEN",
      passwordHash: adminPassHash,
      salt: adminSalt,
      role: "admin",
      nxtScore: 9999,
      nxtLevel: 5,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80",
      walletBalance: 15000.00,
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(adminUser.email, adminUser);
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

  getAllUsers(): StoredUser[] {
    return Array.from(this.users.values());
  }

  updateRole(idOrEmail: string, newRole: "user" | "admin"): StoredUser | null {
    const user = this.findByEmail(idOrEmail) || this.findById(idOrEmail);
    if (!user) return null;
    user.role = newRole;
    this.users.set(user.email, user);
    return user;
  }

  createUser(email: string, fullName: string, plainPassword: string): StoredUser {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = this.hashPassword(plainPassword, salt);
    const id = `usr_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;

    // All newly registered users strictly default to role: 'user'
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

  findOrCreateGoogleUser(email: string, fullName: string, avatarUrl?: string): StoredUser {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = this.users.get(normalizedEmail);
    if (existing) {
      if (avatarUrl && (!existing.avatarUrl || existing.avatarUrl.includes("unsplash"))) {
        existing.avatarUrl = avatarUrl;
      }
      return existing;
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = this.hashPassword(crypto.randomBytes(24).toString("hex"), salt);
    const id = `usr_g_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;

    const newUser: StoredUser = {
      id,
      email: normalizedEmail,
      fullName: fullName.trim() || normalizedEmail.split("@")[0],
      passwordHash,
      salt,
      role: "user",
      nxtScore: 300, // Welcome bonus score
      nxtLevel: 1,
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80",
      walletBalance: 0,
      emailConfirmed: true,
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
