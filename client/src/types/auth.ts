export interface BaseStaff {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Role {
  id: number;
  name: string;
  isManagement: boolean;
  createdBy: BaseStaff | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  status: string;
  phoneNumber: string;
  code: string;
  altPhoneNumber: string;
  isHeadOffice: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role | null;
  branch: Branch | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  staff: Staff;
}

export interface AuthState {
  user: Staff | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}