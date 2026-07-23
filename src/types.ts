export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  shippingAddress?: ShippingAddress;
  orderHistory?: string[]; // Array of Order IDs
}

export interface ProductVariant {
  name?: string;
  color?: string;
  design?: string;
  stock?: number;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[]; // Image array (required by spec)
  rating: number;
  reviewsCount: number;
  stock: number;
  sizes: ('S' | 'M' | 'L' | 'XL' | string)[]; // Travel sizes
  colors?: string[];
  tags: string[];
  featured: boolean;
  inspiration: string; // The specific story or travel quote/wanderlust inspiration
  variants?: ProductVariant[];

  // Exact structured database catalog fields
  ID: string;
  Name: string;
  Category: string;
  Colour: string;
  Price: number;
  Sizes: string[];
  "Gender Preference": string;
  genderPreference?: string;
  referenceNumber?: string;
  fitAndStyle?: string;
  compositionAndCare?: string;
  originAndTraceability?: string;
  completeYourLook?: string[];

  // Two-Piece Sets/Bundles fields
  productType?: 'Single Item' | 'Two-Piece Set';
  topSizes?: string[];
  bottomSizes?: string[];
  topFitAndStyle?: string;
  topCompositionAndCare?: string;
  bottomFitAndStyle?: string;
  bottomCompositionAndCare?: string;
  collectionId?: string;

  // Richer product data schema (additive)
  breadcrumbs?: string[];
  merchandisingTag?: string;
  title?: string;
  sellingPrice?: number;
  mrp?: number | null;
  taxDisclaimer?: string;
  sizeGuideRef?: string;
  promoText?: string | null;
  activeOffers?: { code: string; description: string }[];
  freeShippingThreshold?: number;
  highlights?: { icon: string; label: string }[];
  specs?: Record<string, string>;
  returnsPolicy?: string;
  trustBadges?: { genuine: boolean; securePayment: boolean; easyReturns: boolean };
  ratingAvg?: number;
  ratingCount?: number;
  ratingDistribution?: Record<number, number>;
  reviews?: { userName: string; rating: number; date: string; comment: string }[];
  reviewsEnabled?: boolean;
  combos?: {
    images: string[];
    price: number;
    mrp: number;
    sellingPrice: number;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedVariant?: ProductVariant;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus: 'Pending' | 'Paid';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  paymentMethod: string;
  trackingNumber?: string;
  utr?: string;
  paymentOption?: 'prepaid' | 'cod';
  advancePaid?: number;
  remainingAmount?: number;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PaymentConfig {
  merchantId: string;
  secretKey?: string;
  saltKey?: string;
  upiVpa: string;
  intentEnabled: boolean;
  qrEnabled: boolean;
  prepaidEnabled: boolean;
  codEnabled: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  description: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  ordersProcessing: number;
  ordersDelivered: number;
  totalProductsListed: number;
  outOfStockCount: number;
  totalProductsSold: number;
  averageOrderValue: number;
  salesByCategory: { category: string; value: number }[];
  salesByDate: { date: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  layoutType: 'grid' | 'carousel';
  productIds: string[];
  isActive: boolean;
  sortOrder: number;
}

