import type { Category, CategoryListResponse } from '../types/category.type';
import axiosClient from './axiosClient';

export const categoryApi = {
  getAll: () => {
    return axiosClient.get<CategoryListResponse>('/categories');
  },
  createCategory: (body: Pick<Category, 'name' | 'description'>) => {
    return axiosClient.post('/categories', body)
  },
  updateCategory: (
    id: number,
    body: Pick<Category, 'name' | 'description'>
  ) => {
    return axiosClient.patch(`/categories/${id}`, body)
  },

  deleteCategory: (id: number) => {
    return axiosClient.delete(`/categories/${id}`)
  },
};
