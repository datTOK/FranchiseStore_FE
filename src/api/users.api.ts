import type { CreateUserPayload, CreateUserResponse, GetUsersParams, UsersListResponse } from '../types/users.type';
import axiosClient from './axiosClient';

export const userApi = {
  getAllUsers: (params?: GetUsersParams) => {
    return axiosClient.get<UsersListResponse>('/users', { params });
  },
  createUser: (data: CreateUserPayload) => {
    return axiosClient.post<CreateUserResponse>('/users', data);
  },
};
