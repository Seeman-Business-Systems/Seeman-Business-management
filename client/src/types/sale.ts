export const SaleStatus = {
  DRAFT: 'DRAFT',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
} as const;
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER',
  CREDIT: 'CREDIT',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface SaleLineItem {
  id: number;
  variantId: number;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface SalePayment {
  id: number;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string | null;
  notes: string | null;
  recordedAt: string;
}

export interface Sale {
  id: number;
  saleNumber: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus | null;
  paymentMethod: PaymentMethod | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes: string | null;
  soldAt: string;
  createdAt: string;
  customer: { id: number; name: string; phoneNumber: string; email: string } | null;
  soldBy: { id: number; firstName: string; lastName: string };
  branch: { id: number; name: string; address: string | null; city: string | null; state: string | null; phoneNumber: string | null };
  lineItems: SaleLineItem[];
  payments: SalePayment[];
  itemCount?: number;
}

export interface CreateSaleLineItemRequest {
  variantId: number;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface CreateSaleRequest {
  customerId?: number;
  branchId: number;
  paymentMethod: PaymentMethod | null;
  discountAmount?: number;
  notes?: string;
  lineItems: CreateSaleLineItemRequest[];
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface SaleFilters {
  customerId?: number;
  branchId?: number;
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  take?: number;
  skip?: number;
}

export interface PaginatedSalesResponse {
  data: Sale[];
  total: number;
}
