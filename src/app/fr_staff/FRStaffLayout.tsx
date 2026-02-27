import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FRStaffSidebar from "../../components/FRStaffSidebar";
import FRStaffHeader from "../../components/FRStaffHeader";
import bg from "../../assets/staff-bg.jpg";

export default function FRStaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login", { replace: true });
      }
    };

    checkAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "logoutAt") {
        checkAuth();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      {/* Sidebar fixed (ẩn khi màn nhỏ) */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-[260px] z-40">
        <FRStaffSidebar />
      </div>

      {/* Content area (màn nhỏ không chừa 260px) */}
      <div className="ml-0 md:ml-[260px] min-h-screen relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${bg})` }}
        />

        <div className="relative flex min-h-screen flex-col">
          <div className="sticky top-0 z-30">
            <FRStaffHeader />
          </div>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}