import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

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

    // 2. Administrator accounts (role: 'admin') - verified role separation
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

    const adminUser2: StoredUser = {
      id: "usr_admin_nxtgen",
      email: "admin@nxtgen.app",
      fullName: "Admin NXTGEN",
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
    this.users.set(adminUser2.email, adminUser2);

    const adminUser3: StoredUser = {
      id: "6bbefe27-ecaa-4cd6-ab89-988d054dd5b3",
      email: "adminv@nxtgen.com",
      fullName: "Vitor Admin",
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
    this.users.set(adminUser3.email, adminUser3);

    // 3. Partner demo account (role: 'partner')
    const partnerSalt = crypto.randomBytes(16).toString("hex");
    const partnerPassHash = this.hashPassword("PartnerNxtgen2026!", partnerSalt);
    const partnerUser: StoredUser = {
      id: "usr_partner_demo",
      email: "partner@nxtgen.app",
      fullName: "Parceiro Oficial NXTGEN",
      passwordHash: partnerPassHash,
      salt: partnerSalt,
      role: "partner",
      nxtScore: 1500,
      nxtLevel: 3,
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&q=80",
      walletBalance: 0,
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
    };
    this.users.set(partnerUser.email, partnerUser);
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

  updateRole(idOrEmail: string, newRole: "user" | "partner" | "staff" | "admin"): StoredUser | null {
    const user = this.findByEmail(idOrEmail) || this.findById(idOrEmail);
    if (!user) return null;
    user.role = newRole;
    this.users.set(user.email, user);
    return user;
  }

  updateUser(
    idOrEmail: string,
    updates: Partial<Pick<StoredUser, "nxtLevel" | "nxtScore" | "role" | "walletBalance">>
  ): StoredUser | null {
    const user = this.findByEmail(idOrEmail) || this.findById(idOrEmail);
    if (!user) return null;
    if (updates.nxtLevel !== undefined) user.nxtLevel = Number(updates.nxtLevel);
    if (updates.nxtScore !== undefined) user.nxtScore = Number(updates.nxtScore);
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.walletBalance !== undefined) user.walletBalance = Number(updates.walletBalance);
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
 * Sign JWT session token with configurable expiration
 */
export function createSessionToken(user: StoredUser, maxAgeSeconds: number = 7 * 24 * 60 * 60): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
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
 * Get current authenticated user from cookies, querying Supabase first and falling back to memory
 */
export async function getCurrentUser(req?: NextRequest): Promise<StoredUser | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (!token) {
        const raw = req.headers.get("cookie") || "";
        const match = raw.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
        if (match) token = match[1];
      }
    }

    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      } catch {}
    }

    if (!token) return null;

    const verification = verifySessionToken(token);
    if (!verification.valid || !verification.payload?.sub) return null;

    const userId = verification.payload.sub;

    // 1. Try querying Supabase public.profiles if supabaseAdmin is available
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/client");
      if (supabaseAdmin) {
        const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        let profile = null;
        if (isUuid) {
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
          profile = data;
        }
        if (!profile && verification.payload.email) {
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", verification.payload.email.toLowerCase().trim())
            .maybeSingle();
          profile = data;
        }

        if (profile) {
          let userRole = (profile.role as any) || verification.payload.role || "user";
          const userEmail = (profile.email || verification.payload.email || "").toLowerCase().trim();
          if (
            userRole !== "admin" &&
            (userEmail === "adminv@nxtgen.com" ||
             userEmail === "admin@nxtgen.app" ||
             userEmail === "vitorrocketleague@gmail.com")
          ) {
            userRole = "admin";
          }
          if (userRole === "user" && isUuid) {
            try {
              const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
              if (authUser?.user?.user_metadata?.role) {
                userRole = authUser.user.user_metadata.role;
              }
            } catch {}
          }

          return {
            id: profile.id,
            email: profile.email || verification.payload.email || "",
            fullName: profile.full_name || profile.name || verification.payload.name || "Membro NXTGEN",
            passwordHash: "",
            salt: "",
            role: userRole,
            nxtScore: profile.nxt_score ?? 250,
            nxtLevel: profile.nxt_level ?? 1,
            avatarUrl: profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80",
            walletBalance: Number(profile.wallet_balance ?? 0),
            emailConfirmed: true,
            createdAt: profile.created_at || new Date().toISOString(),
          };
        }
      }
    } catch (dbErr) {
      console.warn("Supabase profile lookup notice:", dbErr);
    }

    // 2. Fallback to in-memory store (e.g. demo accounts or fallback mode)
    const user = userStore.findById(userId) || userStore.findByEmail(verification.payload.email);
    return user || null;
  } catch {
    return null;
  }
}

export { AUTH_COOKIE_NAME };

/**
 * Universal verification for admin requests supporting req.cookies, headers, and next/headers
 */
export async function verifyAdminRequest(req?: NextRequest): Promise<{
  authorized: boolean;
  status: number;
  error?: string;
  adminUser?: any;
}> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  }
  if (!token && req) {
    const raw = req.headers.get("cookie") || "";
    const match = raw.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
    if (match) token = match[1];
  }
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {}
  }

  if (!token) {
    return { authorized: false, status: 401, error: "Não autenticado." };
  }

  const { valid, payload } = verifySessionToken(token);
  if (!valid || !payload) {
    return { authorized: false, status: 401, error: "Sessão inválida ou expirada." };
  }

  // 1. Direct role check
  let role = payload.role;

  // 2. Admin email whitelist
  const userEmail = (payload.email || "").toLowerCase().trim();
  if (
    userEmail === "adminv@nxtgen.com" ||
    userEmail === "admin@nxtgen.app" ||
    userEmail === "vitorrocketleague@gmail.com"
  ) {
    role = "admin";
  }

  // 3. Supabase profiles check
  if (role !== "admin") {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/client");
      if (supabaseAdmin) {
        const isUuid = payload.sub && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub);
        let p = null;
        if (isUuid) {
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", payload.sub)
            .maybeSingle();
          p = data;
        }
        if (!p && userEmail) {
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("email", userEmail)
            .maybeSingle();
          p = data;
        }

        if (p?.role === "admin") {
          role = "admin";
        } else if (isUuid) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(payload.sub);
          if (authUser?.user?.user_metadata?.role === "admin") {
            role = "admin";
          }
        }
      }
    } catch {}
  }

  // 4. In-memory userStore fallback
  if (role !== "admin") {
    const memUser = (payload.sub ? userStore.findById(payload.sub) : null) || (userEmail ? userStore.findByEmail(userEmail) : null);
    if (memUser?.role === "admin") {
      role = "admin";
    }
  }

  if (role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Acesso Negado. Requer privilégios de administrador (role = 'admin').",
    };
  }

  return { authorized: true, status: 200, adminUser: { ...payload, role: "admin" } };
}

/**
 * Universal verification for partner requests supporting req.cookies, headers, and next/headers
 */
export async function verifyPartnerRequest(req?: NextRequest): Promise<{
  authorized: boolean;
  status: number;
  error?: string;
  partnerUser?: any;
}> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  }
  if (!token && req) {
    const raw = req.headers.get("cookie") || "";
    const match = raw.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
    if (match) token = match[1];
  }
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {}
  }

  if (!token) {
    return { authorized: false, status: 401, error: "Não autenticado." };
  }

  const { valid, payload } = verifySessionToken(token);
  if (!valid || !payload) {
    return { authorized: false, status: 401, error: "Sessão inválida ou expirada." };
  }

  let role = payload.role;
  const userEmail = payload.email?.toLowerCase().trim();

  // 1. Fallback to Supabase if not yet partner
  if (role !== "partner" && payload.sub) {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/client");
      if (supabaseAdmin) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub);
        let p: any = null;
        if (isUuid) {
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", payload.sub)
            .maybeSingle();
          p = data;
        } else if (userEmail) {
          const { data } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("email", userEmail)
            .maybeSingle();
          p = data;
        }

        if (p?.role === "partner") {
          role = "partner";
        } else if (isUuid) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(payload.sub);
          if (authUser?.user?.user_metadata?.role === "partner") {
            role = "partner";
          }
        }
      }
    } catch {}
  }

  // 2. Fallback to in-memory userStore
  if (role !== "partner") {
    const memUser = (payload.sub ? userStore.findById(payload.sub) : null) || (userEmail ? userStore.findByEmail(userEmail) : null);
    if (memUser?.role === "partner") {
      role = "partner";
    }
  }

  if (role !== "partner") {
    return {
      authorized: false,
      status: 403,
      error: "Acesso Negado. Requer privilégios de parceiro (role = 'partner').",
    };
  }

  return { authorized: true, status: 200, partnerUser: { ...payload, role } };
}
