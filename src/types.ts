export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  shippingAddress?: ShippingAddress;
  orderHistory?: string[]; // Array of Order IDs
  displayName?: string;
  phone?: string;
}

export interface ProductVariant {
  name?: string;
  color?: string;
  colorHex?: string;
  keywords?: string[];
  design?: string;
  stock?: number;
  images?: string[];
  sellingPrice?: number;
  mrp?: number;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[]; // Image array (required by spec)
  image?: string; // Legacy fallback
  color?: string;
  origin?: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  sizes: ('S' | 'M' | 'L' | 'XL' | string)[]; // Travel sizes
  colors?: string[];
  tags: string[];
  featured: boolean;
  inspiration: string; // The specific story or travel quote/wanderlust inspiration
  variants?: ProductVariant[];
  displayOrder?: number;
  sortOrder?: number;

  // Granular Filter Specifications
  brand?: string;
  Brand?: string;
  designPattern?: string;
  DesignPattern?: string;
  fitStyle?: string;
  FitStyle?: string;
  colorName?: string;
  colorHex?: string;
  colorSwatches?: { name: string; hex: string }[];

  // Exact structured database catalog fields
  ID?: string;
  Name?: string;
  Category?: string;
  Colour?: string;
  Price?: number;
  Sizes?: string[];
  "Gender Preference"?: string;
  genderPreference?: string;
  referenceNumber?: string;
  adminProductCode?: string;
  productCode?: string;
  fitAndStyle?: string | Record<string, any>;
  compositionAndCare?: string | Record<string, any>;
  originAndTraceability?: string | Record<string, any>;
  completeYourLook?: string[];

  // Two-Piece Sets/Bundles/Shoes fields
  productType?: 'Single Item' | 'Two-Piece Set' | 'Three-Piece Set' | 'Shoes';
  topSizes?: string[];
  bottomSizes?: string[];
  shoeSizes?: string[];
  topFitAndStyle?: string | Record<string, any>;
  topCompositionAndCare?: string | Record<string, any>;
  bottomFitAndStyle?: string | Record<string, any>;
  bottomCompositionAndCare?: string | Record<string, any>;
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
  specs?: Record<string, any> | string;
  specifications?: Record<string, any> | string;
  returnsPolicy?: string;
  trustBadges?: { genuine: boolean; securePayment: boolean; easyReturns: boolean };
  ratingAvg?: number;
  ratingCount?: number;
  ratingDistribution?: Record<number, number>;
  reviews?: { userName: string; rating: number; date: string; comment: string }[];
  reviewsEnabled?: boolean;
  combos?: {
    images?: string[];
    price?: number;
    mrp?: number;
    sellingPrice?: number;
    shirtSize?: string;
    pantSize?: string;
    trouserSize?: string;
    [key: string]: any;
  }[];
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedVariant?: ProductVariant;
}

export interface ShippingTimelineMilestone {
  statusTitle: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  country?: string;
  fullName?: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
    image?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus: 'Pending' | 'Paid' | 'Approved' | 'Rejected' | string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  paymentMethod: string;
  trackingNumber?: string;
  utr?: string;
  paymentOption?: 'prepaid' | 'cod';
  advancePaid?: number;
  remainingAmount?: number;
  tags?: string[];
  carrier?: string;
  estimatedDelivery?: string;
  shippingTimeline?: ShippingTimelineMilestone[];
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
  prepaidDeliveryCost?: number;
  codDeliveryCost?: number;
  freeShippingThreshold?: number;
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

