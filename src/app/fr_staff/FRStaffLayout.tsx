import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FRStaffSidebar from "../../components/FRStaffSidebar";
import FRStaffHeader from "../../components/FRStaffHeader";


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
      
      <div className="hidden md:block fixed left-0 top-0 h-screen w-[260px] z-40">
        <FRStaffSidebar />
      </div>

      
      <div className="ml-0 md:ml-[260px] min-h-screen relative">
        

        <div className="relative flex min-h-screen flex-col">
          <div className="sticky top-0 z-30">
            <FRStaffHeader />
          </div>

          <main className="relative flex-1 overflow-y-auto p-6">
            
<div
  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: 'url("/anhnen.png")' }}
  aria-hidden="true"
/>


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