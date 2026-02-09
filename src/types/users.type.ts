export interface Users {
  id: number;
  store_id: number;
  role: string;
  name: string;
  username: string;
  phone: string;
  dob: string;
}

export interface UsersListResponse {
  data: Users[];
}