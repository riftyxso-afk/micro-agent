export interface ProductSpecs {
  chipset: string;
  ram: string;
  storage: string;
  camera: string;
  battery: string;
  display: string;
  os: string;
  features: string[];
}

export interface Product {
  name: string;
  image: string;
  avgPrice: number;
  specs: ProductSpecs;
}

export interface StoreListing {
  marketplace: "Shopee" | "Tokopedia" | "Bukalapak" | "Blibli" | "Lazada";
  storeName: string;
  price: number;
  shipping: string;
  rating: number;
  badge?: string;
  url: string;
}

export interface ComparisonData {
  productA: Product;
  productB: Product;
  stores: {
    productA: StoreListing[];
    productB: StoreListing[];
  };
  aiInsight: string;
  images: string[];
}

export const MARKETPLACE_COLORS: Record<string, string> = {
  Shopee: "#EE4D2D",
  Tokopedia: "#42B549",
  Bukalapak: "#E31E52",
  Blibli: "#0066CC",
  Lazada: "#0F146D",
};

export const MARKETPLACE_LOGOS: Record<string, string> = {
  Shopee: "🛒",
  Tokopedia: "🟢",
  Bukalapak: "🔴",
  Blibli: "🔵",
  Lazada: "💜",
};
