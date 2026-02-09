export type CategoryStatus = 0 | 1;

export interface Category {
  id: number;
  name: string;
  description: string;
  is_active: CategoryStatus;
}

export interface CategoryListResponse {
  data: Category[];
}
