import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CKStaffSidebar from "../../components/CKStaffSidebar";
import CKStaffHeader from "../../components/CKStaffHeader";


export default function CKStaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login", { replace: true });
      }
    };

    // Check ngay khi vào layout & mỗi lần đổi route
    checkAuth();

    // Logout/Login ở tab khác -> localStorage đổi -> tự đá về login
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "logoutAt") {
        checkAuth();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen w-full bg-transparent">
      {/* Sidebar fixed */}
      <div id="ckstaff-sidebar" className="hidden md:block fixed left-0 top-0 h-screen w-[260px] z-40">
  <CKStaffSidebar />
</div>

      {/* Content area (chừa chỗ sidebar) */}
      <div id="ckstaff-content-shell" className="ml-0 md:ml-[260px] min-h-screen relative">
        

        <div className="relative flex min-h-screen flex-col">
          {/* Header cố định trên top */}
          <div className="sticky top-0 z-30">
            <CKStaffHeader />
          </div>

          {/* Chỉ main cuộn */}
          <main id="ckstaff-main" className="relative flex-1 overflow-y-auto p-6">
            {/* Background */}
<div
  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: 'url("/anhnen.png")' }}
  aria-hidden="true"
/>

{/* Overlay làm ảnh đậm */}
<div className="absolute inset-0 z-0 bg-black/15" aria-hidden="true" />
            <div className="relative z-10">
  <Outlet />
</div>
          </main>
        </div>
      </div>
    </div>
  );
}