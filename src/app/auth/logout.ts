import axiosClient from "../../api/axiosClient";

export function doLogout() {
  // 1) Xóa token/user
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("idToken");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");

  // 2) Xóa Authorization header (tránh axios giữ token cũ trong memory)
  delete (axiosClient.defaults.headers as Record<string, string>).Authorization;
  delete (axiosClient.defaults.headers as Record<string, string>).authorization;

  // 3) Bắn tín hiệu logout cho các tab khác
  localStorage.setItem("logoutAt", String(Date.now()));

  // 4) QUAN TRỌNG: reload trang để reset toàn bộ state SPA
  window.location.replace("/login");
}