export interface Category {
  id: string;
  name: string;
  verticalCode: string;
}

export interface Benefit {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  partnerBanner: string;
  partnerLocation: string;
  categoryId: string;
  title: string;
  description: string;
  discountLabel: string;
  minNxtLevel: number;
  terms: string[];
  originalPrice?: number;
  promotionalPrice?: number;
}

export interface UserVoucher {
  id: string;
  code: string;
  benefitId: string;
  benefitTitle: string;
  partnerId: string;
  partnerName: string;
  discountLabel: string;
  status: "valid" | "used";
  qrPayload: string;
  redeemedAt: string;
  terms: string;
}

export interface PassMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  total: number;
  isCompleted: boolean;
}

// Catálogo Oficial de Categorias (11 Verticais)
export const NXT_CATEGORIES: Category[] = [
  { id: "all", name: "Todos", verticalCode: "ALL" },
  { id: "gastronomia", name: "Gastronomia", verticalCode: "BITE" },
  { id: "moda", name: "Moda & Sneaker", verticalCode: "STYLE" },
  { id: "tecnologia", name: "Tecnologia", verticalCode: "GEAR" },
  { id: "viagens", name: "Viagens & Hostels", verticalCode: "ROAM" },
  { id: "educacao", name: "Educação", verticalCode: "CREATE" },
  { id: "esportes", name: "Esportes", verticalCode: "MOVE" },
  { id: "entretenimento", name: "Eventos & Shows", verticalCode: "PLAY" },
  { id: "beleza", name: "Beleza", verticalCode: "GLOW" },
  { id: "saude-mental", name: "Saúde Mental", verticalCode: "MINDSPACE" },
  { id: "automoveis", name: "Mobilidade", verticalCode: "DRIVE" },
  { id: "imoveis", name: "Co-living", verticalCode: "NEST" },
];

// Iniciar com dados vazios para carregar apenas os reais criados pelo administrador
export const INITIAL_BENEFITS: Benefit[] = [];
export const INITIAL_VOUCHERS: UserVoucher[] = [];
export const PASS_MISSIONS: PassMission[] = [];
