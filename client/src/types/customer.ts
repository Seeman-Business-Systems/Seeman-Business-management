export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string;
  companyName: string | null;
  altPhoneNumber: string | null;
  notes: string | null;
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phoneNumber: string;
  email?: string;
  companyName?: string;
  altPhoneNumber?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phoneNumber?: string;
  email?: string;
  companyName?: string;
  altPhoneNumber?: string;
  notes?: string;
}

export interface CustomerFilters {
  name?: string;
  phoneNumber?: string;
  email?: string;
  hasOutstandingBalance?: boolean;
}
