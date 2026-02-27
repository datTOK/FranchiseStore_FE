import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

export default function RequireAuth() {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("accessToken"));
    };

    // tab khác login/logout
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "logoutAt") {
        syncToken();
      }
    };

    window.addEventListener("storage", onStorage);

    // mỗi lần đổi route trong cùng tab thì cũng check lại
    syncToken();

    return () => window.removeEventListener("storage", onStorage);
  }, [location.pathname]);

  const isAuthed = useMemo(() => {
    if (!token) return false;
    const t = token.trim();
    if (!t) return false;
    if (t === "undefined" || t === "null") return false;
    return true;
  }, [token]);

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}