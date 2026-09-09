export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  emoji: string;
  color: string;
}

export interface Benefit {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  discountLabel: string;
  discountType: "percentage" | "fixed_amount" | "vip_access";
  discountValue: number;
  originalPrice?: number;
  promotionalPrice?: number;
  terms: string;
  category: string;
  isActive: boolean;
  totalAvailable: number;
  totalUsed: number;
}

export interface Partner {
  id: string;
  name: string;
  companyName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  location: string;
  city: string;
  rating: number;
  reviewsCount: number;
  benefits: Benefit[];
  verified: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  hmacSignature: string;
  benefitId: string;
  benefitTitle: string;
  discountLabel: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  userId: string;
  userName: string;
  status: "valid" | "used" | "cancelled" | "expired";
  qrPayload: string;
  redeemedAt: string;
  validatedAt?: string;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "user" | "partner" | "staff" | "admin";
  nxtScore: number;
  nxtLevel: number;
  avatarUrl: string;
  phone: string;
  walletBalance: number;
}

export const CATEGORIES: Category[] = [
  { id: "gastronomia", name: "Gastronomia", icon: "Utensils", emoji: "🍔", description: "Hamburguerias, cafeterias e restaurantes selecionados", color: "from-amber-500/20 to-orange-500/10" },
  { id: "moda", name: "Moda & Sneaker", icon: "Shirt", emoji: "👟", description: "Streetwear, sneakers exclusivos e marcas autorais", color: "from-purple-500/20 to-pink-500/10" },
  { id: "tecnologia", name: "Tecnologia", icon: "Laptop", emoji: "💻", description: "Hardware, periféricos, setups e cursos tech", color: "from-cyan-500/20 to-blue-500/10" },
  { id: "viagens", name: "Viagens", icon: "Plane", emoji: "✈️", description: "Hostels, viagens de experiência e passagens", color: "from-emerald-500/20 to-teal-500/10" },
  { id: "educacao", name: "Educação", icon: "GraduationCap", emoji: "🎓", description: "Cursos de alta performance, inglês e empreendedorismo", color: "from-blue-500/20 to-indigo-500/10" },
  { id: "esportes", name: "Esportes & Fitness", icon: "Dumbbell", emoji: "🏋️", description: "Academias premium, arenas de beach tennis e crossfit", color: "from-red-500/20 to-rose-500/10" },
  { id: "entretenimento", name: "Entretenimento", icon: "Gamepad2", emoji: "🎮", description: "Festivais, cinema VIP, escape rooms e lounges gamer", color: "from-violet-500/20 to-fuchsia-500/10" },
  { id: "beleza", name: "Beleza & Estética", icon: "Sparkles", emoji: "💆", description: "Barbearias conceituais e spas modernos", color: "from-rose-500/20 to-pink-500/10" },
  { id: "saude-mental", name: "Saúde Mental", icon: "Brain", emoji: "🧠", description: "Terapia online especializada e mindfulness para jovens", color: "from-teal-500/20 to-cyan-500/10" },
  { id: "automoveis", name: "Automóveis", icon: "Car", emoji: "🚗", description: "Locação de esportivos, lavagem estética e mobilidade", color: "from-yellow-500/20 to-amber-500/10" },
  { id: "imoveis", name: "Imóveis & Co-living", icon: "Home", emoji: "🏠", description: "Studios para nômades digitais e moradias colaborativas", color: "from-sky-500/20 to-blue-500/10" },
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "CYBER BURGER LAB",
    companyName: "Cyber Burger Gastronomia Ltda",
    categoryId: "gastronomia",
    categoryName: "Gastronomia",
    description: "Burgers artesanais defumados em smash duplo com queijo gouda trufado e molhos autorais. Ambiente 100% Cyberpunk com iluminação neon.",
    logoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&h=600&fit=crop&q=80",
    location: "Vila Madalena, São Paulo - SP",
    city: "São Paulo",
    rating: 4.9,
    reviewsCount: 342,
    verified: true,
    benefits: [
      {
        id: "b1",
        partnerId: "p1",
        title: "Combo NXT Smash + Batata Rústica",
        description: "25% de desconto imediato em qualquer combo especial apresentando seu NXT PASS.",
        discountLabel: "25% OFF",
        discountType: "percentage",
        discountValue: 25,
        originalPrice: 68.0,
        promotionalPrice: 51.0,
        terms: "Válido de terça a domingo a partir das 18h. Não cumulativo com outras promoções.",
        category: "gastronomia",
        isActive: true,
        totalAvailable: 200,
        totalUsed: 87,
      },
      {
        id: "b2",
        partnerId: "p1",
        title: "Entrada Grátis de Buffalo Wings",
        description: "Na compra de qualquer burger principal, ganhe uma porção de asinhas picantes.",
        discountLabel: "VOUCHER GRÁTIS",
        discountType: "vip_access",
        discountValue: 100,
        originalPrice: 38.0,
        promotionalPrice: 0.0,
        terms: "Exclusivo para membros NXT Score nível 05 ou superior.",
        category: "gastronomia",
        isActive: true,
        totalAvailable: 50,
        totalUsed: 19,
      }
    ],
  },
  {
    id: "p2",
    name: "HYPEMAKER SNEAKERS & STREET",
    companyName: "Hypemaker Comércio de Calçados SA",
    categoryId: "moda",
    categoryName: "Moda & Sneaker",
    description: "A maior boutique de sneakers de tiragem limitada, streetwear importado e coleções exclusivas de criadores da Geração Z.",
    logoUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&h=300&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop&q=80",
    location: "Rua Oscar Freire, Jardins - SP",
    city: "São Paulo",
    rating: 5.0,
    reviewsCount: 512,
    verified: true,
    benefits: [
      {
        id: "b3",
        partnerId: "p2",
        title: "R$ 150 OFF em Sneakers Selecionados",
        description: "Desconto em lançamentos de marcas globais em compras acima de R$ 600.",
        discountLabel: "R$ 150 OFF",
        discountType: "fixed_amount",
        discountValue: 150,
        originalPrice: 799.0,
        promotionalPrice: 649.0,
        terms: "Válido para compras na loja física ou no e-commerce oficial aplicando o token NXT.",
        category: "moda",
        isActive: true,
        totalAvailable: 100,
        totalUsed: 43,
      }
    ],
  },
  {
    id: "p3",
    name: "NEXUS HARDWARE & WORKSPACE",
    companyName: "Nexus Tech Inovações Ltda",
    categoryId: "tecnologia",
    categoryName: "Tecnologia",
    description: "Periféricos mecânicos, monitores ultrawide, cadeiras ergonômicas e estações de trabalho de altíssimo desempenho para devs e criadores.",
    logoUrl: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200&h=600&fit=crop&q=80",
    location: "Av. Paulista, Bela Vista - SP",
    city: "São Paulo",
    rating: 4.8,
    reviewsCount: 198,
    verified: true,
    benefits: [
      {
        id: "b4",
        partnerId: "p3",
        title: "20% OFF em Monitores & Periféricos",
        description: "Desconto direto para equipar seu setup profissional com garantia estendida de 2 anos.",
        discountLabel: "20% OFF",
        discountType: "percentage",
        discountValue: 20,
        originalPrice: 1800.0,
        promotionalPrice: 1440.0,
        terms: "Limite de 1 utilização por membro NXT.",
        category: "tecnologia",
        isActive: true,
        totalAvailable: 80,
        totalUsed: 31,
      }
    ],
  },
  {
    id: "p4",
    name: "PULSE ARENA & RECOVERY",
    companyName: "Pulse Fitness e Saúde Ltda",
    categoryId: "esportes",
    categoryName: "Esportes & Fitness",
    description: "Complexo esportivo com quadras de Beach Tennis cobertas, musculação de alta tecnologia e câmara hiperbárica de recuperação muscular.",
    logoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&h=600&fit=crop&q=80",
    location: "Itaim Bibi, São Paulo - SP",
    city: "São Paulo",
    rating: 4.9,
    reviewsCount: 270,
    verified: true,
    benefits: [
      {
        id: "b5",
        partnerId: "p4",
        title: "1 Mês Passe Livre + Sessão Recovery",
        description: "Acesso total à academia, aulas coletivas e 1 sessão de crioterapia ou bota pneumática.",
        discountLabel: "35% OFF",
        discountType: "percentage",
        discountValue: 35,
        originalPrice: 380.0,
        promotionalPrice: 247.0,
        terms: "Sem taxa de matrícula para titulares do NXT PASS.",
        category: "esportes",
        isActive: true,
        totalAvailable: 150,
        totalUsed: 62,
      }
    ],
  },
  {
    id: "p5",
    name: "NOMAD CO-LIVING & STUDIOS",
    companyName: "Nomad Habitações Inteligentes SA",
    categoryId: "imoveis",
    categoryName: "Imóveis & Co-living",
    description: "Studios mobiliados com internet de 1Gbps, rooftop para eventos, academia e coworking 24/7 para nômades digitais e jovens profissionais.",
    logoUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=300&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=600&fit=crop&q=80",
    location: "Pinheiros, São Paulo - SP",
    city: "São Paulo",
    rating: 4.9,
    reviewsCount: 140,
    verified: true,
    benefits: [
      {
        id: "b6",
        partnerId: "p5",
        title: "Isenção de Caução + R$ 300 no 1º Mês",
        description: "Contrato flexível sem burocracia de fiador, com desconto exclusivo no primeiro aluguel.",
        discountLabel: "R$ 300 OFF",
        discountType: "fixed_amount",
        discountValue: 300,
        originalPrice: 2800.0,
        promotionalPrice: 2500.0,
        terms: "Válido para contratos com permanência mínima de 30 dias.",
        category: "imoveis",
        isActive: true,
        totalAvailable: 30,
        totalUsed: 12,
      }
    ],
  },
];

export const DEMO_USER: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "rafael.molina@nxtgen.app",
  name: "Rafael Molina",
  role: "user",
  nxtScore: 8420,
  nxtLevel: 7,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80",
  phone: "(11) 98765-4321",
  walletBalance: 1250.00,
};

// In-Memory Database Store for Instant Offline & Playwright Testing
class MockDatabase {
  private partners: Partner[] = [...INITIAL_PARTNERS];
  private vouchers: Voucher[] = [];
  private currentUser: UserProfile = { ...DEMO_USER };

  getPartners(category?: string, query?: string): Partner[] {
    return this.partners.filter((p) => {
      const matchCategory = !category || category === "all" || p.categoryId === category;
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.benefits.some(b => b.title.toLowerCase().includes(query.toLowerCase()));
      return matchCategory && matchQuery;
    });
  }

  getPartnerById(id: string): Partner | undefined {
    return this.partners.find((p) => p.id === id);
  }

  getBenefitById(id: string): { benefit: Benefit; partner: Partner } | undefined {
    for (const p of this.partners) {
      const b = p.benefits.find((item) => item.id === id);
      if (b) return { benefit: b, partner: p };
    }
    return undefined;
  }

  getUserProfile(): UserProfile {
    return this.currentUser;
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.currentUser = { ...this.currentUser, ...updates };
    return this.currentUser;
  }

  createVoucher(voucher: Voucher): Voucher {
    this.vouchers.unshift(voucher);
    return voucher;
  }

  getUserVouchers(userId: string): Voucher[] {
    return this.vouchers.filter((v) => v.userId === userId);
  }

  getVoucherByCode(code: string): Voucher | undefined {
    return this.vouchers.find((v) => v.code === code);
  }

  validateVoucher(code: string, partnerId: string): { success: boolean; error?: string; voucher?: Voucher } {
    const voucher = this.vouchers.find((v) => v.code === code);
    if (!voucher) {
      return { success: false, error: "Voucher não encontrado ou inexistente." };
    }
    if (voucher.partnerId !== partnerId) {
      return { success: false, error: "Este benefício pertence a outro parceiro credenciado." };
    }
    if (voucher.status === "used") {
      return { success: false, error: "Este voucher já foi utilizado anteriormente!" };
    }
    if (voucher.status === "cancelled" || voucher.status === "expired") {
      return { success: false, error: `Voucher com status inválido: ${voucher.status}` };
    }

    voucher.status = "used";
    voucher.validatedAt = new Date().toISOString();
    return { success: true, voucher };
  }
}

export const mockDb = new MockDatabase();
