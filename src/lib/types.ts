export type FaqItem = { q: string; a: string };

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  images: string[];
  shortDesc: string;
  description: string;
  included: string[];
  benefits: string[];
  forWho: string;
  howItWorks: string;
  faq: FaqItem[];
  active: boolean;
  views: number;
  createdAt: number;
};

export type Review = {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  name: string;
  photo?: string;
  verified: boolean;
  createdAt: number;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover?: string;
  createdAt: number;
};

export type CartItem = { productId: string; name: string; price: number; qty: number; image?: string };

export type Order = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment: "pix" | "cartao";
  coupon?: string;
  status: "pendente" | "pago" | "entregue" | "cancelado";
  createdAt: number;
};

export type Coupon = { code: string; percent: number; active: boolean };

export type Banner = { id: string; title: string; image: string; link: string };

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  role: "cliente" | "admin";
  createdAt: number;
};

export type ActivityLog = { id: string; who: string; what: string; createdAt: number };

export type Settings = {
  slogan: string;
  impact: string;
  description: string;
  about: string;
  differentials: string[];
  whatsapp: string;
  email: string;
  adminCode: string;
  heroVideo: string;
  visits: number;
  views: number;
};

export const defaultSettings: Settings = {
  slogan: "Excelência que se vê no detalhe",
  impact: "A marca que transforma padrão em referência.",
  description:
    "A MARIMAX desenvolve produtos e serviços com acabamento premium, entrega rápida e suporte de verdade — do primeiro contato ao pós-venda.",
  about:
    "Somos uma empresa focada em qualidade real: seleção rigorosa, processos claros e atendimento humano. Cada entrega passa por conferência antes de chegar até você.",
  differentials: [
    "Padrão de acabamento premium",
    "Atendimento direto pelo WhatsApp",
    "Pagamento por PIX ou cartão",
    "Garantia e suporte pós-venda",
  ],
  whatsapp: "",
  email: "contato@marimax.com",
  adminCode: "MARIMAX-ADM",
  heroVideo: "",
  visits: 0,
  views: 0,
};

export const CATEGORIES_FALLBACK = ["Geral"];

export const BLOG_CATEGORIES = [
  "Notícias",
  "Novos produtos",
  "Projetos",
  "Bastidores",
  "Dicas",
  "Atualizações",
  "Empreendedorismo",
];

export function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
