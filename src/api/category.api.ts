import type { CategoryListResponse } from '../types/category.type';
import axiosClient from './axiosClient';

export const categoryApi = {
  getAll: () => {
    return axiosClient.get<CategoryListResponse>('/categories');
  },
};
