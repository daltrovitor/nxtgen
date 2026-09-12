import {
  Benefit,
  UserVoucher,
  PassMission,
  INITIAL_BENEFITS,
  INITIAL_VOUCHERS,
  PASS_MISSIONS,
} from "./pass-data";

export interface SystemVoucher extends UserVoucher {
  userEmail: string;
  userName: string;
  userId: string;
}

class PassStore {
  private benefits: Benefit[] = [];
  private missions: PassMission[] = [];
  private vouchers: SystemVoucher[] = [];

  constructor() {
    this.resetToDefaults();
  }

  resetToDefaults() {
    this.benefits = [];
    this.missions = [];
    this.vouchers = [];
  }

  // --- BENEFITS CRUD ---
  getBenefits(): Benefit[] {
    return this.benefits;
  }

  getBenefitById(id: string): Benefit | undefined {
    return this.benefits.find((b) => b.id === id);
  }

  createBenefit(data: Omit<Benefit, "id">): Benefit {
    const newId = `ben-${Date.now().toString(36)}`;
    const newBenefit: Benefit = {
      ...data,
      id: newId,
    };
    this.benefits.unshift(newBenefit);
    return newBenefit;
  }

  updateBenefit(id: string, updates: Partial<Benefit>): Benefit | null {
    const idx = this.benefits.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.benefits[idx] = { ...this.benefits[idx], ...updates, id };
    return this.benefits[idx];
  }

  deleteBenefit(id: string): boolean {
    const initialLen = this.benefits.length;
    this.benefits = this.benefits.filter((b) => b.id !== id);
    return this.benefits.length < initialLen;
  }

  // --- MISSIONS CRUD ---
  getMissions(): PassMission[] {
    return this.missions;
  }

  getMissionById(id: string): PassMission | undefined {
    return this.missions.find((m) => m.id === id);
  }

  createMission(data: Omit<PassMission, "id">): PassMission {
    const newId = `miss-${Date.now().toString(36)}`;
    const newMission: PassMission = {
      ...data,
      id: newId,
    };
    this.missions.push(newMission);
    return newMission;
  }

  updateMission(id: string, updates: Partial<PassMission>): PassMission | null {
    const idx = this.missions.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.missions[idx] = { ...this.missions[idx], ...updates, id };
    return this.missions[idx];
  }

  deleteMission(id: string): boolean {
    const initialLen = this.missions.length;
    this.missions = this.missions.filter((m) => m.id !== id);
    return this.missions.length < initialLen;
  }

  // --- VOUCHERS OPERATIONS ---
  getVouchers(): SystemVoucher[] {
    return this.vouchers;
  }

  getUserVouchers(userIdOrEmail: string): SystemVoucher[] {
    const lower = userIdOrEmail.toLowerCase();
    return this.vouchers.filter(
      (v) => v.userId === userIdOrEmail || v.userEmail.toLowerCase() === lower
    );
  }

  createVoucher(voucher: Omit<SystemVoucher, "id">): SystemVoucher {
    const newId = `vouch-${Date.now().toString(36)}`;
    const newVoucher: SystemVoucher = {
      ...voucher,
      id: newId,
    };
    this.vouchers.unshift(newVoucher);
    return newVoucher;
  }

  updateVoucherStatus(id: string, status: "valid" | "used"): SystemVoucher | null {
    const voucher = this.vouchers.find((v) => v.id === id);
    if (!voucher) return null;
    voucher.status = status;
    return voucher;
  }

  deleteVoucher(id: string): boolean {
    const initialLen = this.vouchers.length;
    this.vouchers = this.vouchers.filter((v) => v.id !== id);
    return this.vouchers.length < initialLen;
  }
}

// Attach to globalThis to preserve state across Fast Refresh & Hot Reload in Dev
const globalStore = (globalThis as unknown as { __nxtPassStore?: PassStore });

export const passStore = globalStore.__nxtPassStore || new PassStore();

if (process.env.NODE_ENV !== "production") {
  globalStore.__nxtPassStore = passStore;
}
