import { Suspense } from "react";
import { Outlet } from "react-router";

import NavMenu from "@/components/Navmenu";

export function AdminLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NavMenu />
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
  );
}
