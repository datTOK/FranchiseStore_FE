import axios from "axios"
import type { AxiosError } from "axios"

export function getAxiosErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    return axiosError.response?.data?.message ?? fallback
  }
  return fallback
}