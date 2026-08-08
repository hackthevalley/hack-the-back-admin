import { Suspense, useContext } from "react";
import { Navigate, Outlet } from "react-router";

import NavMenu from "@/components/Navmenu";
import { UserContext } from "@/utils/auth";

export function AdminLayout() {
  const auth = useContext(UserContext);

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NavMenu />
      <div className="flex min-w-0 flex-1 pt-20 lg:pt-0">
        <Suspense
          fallback={
            <main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading…
            </main>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
