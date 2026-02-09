import type { UsersListResponse } from '../types/users.type';
import axiosClient from './axiosClient';

export const userApi = {
  getAllUsers: () => {
    return axiosClient.get<UsersListResponse>('/users');
  },
};
