export interface Users {
  id: number;
  store_id: number;
  role: string;
  name: string;
  username: string;
  phone: string;
  dob: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  data: Users[];
}

export interface GetUsersParams {
  role?: string;
  status?: boolean;
}

export interface CreateUserPayload {
  store_id: number;
  role: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  dob: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: {
    id: number;
    username: string;
    role: string;
    store_id: number;
    is_active: boolean;
    created_at: string;
  };
  message: string;
}

export type Role = "ADMIN" | "FR_STAFF" | "CK_STAFF" | "MANAGER" | "SC_COORDINATOR"

export interface UserProfile {
  id: number
  name: string
  username: string
  phone: string
  dob: string
  role: Role
  store_id: number | null
  is_active: number
}