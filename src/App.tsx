import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import { AdminLayout } from "./components/AdminLayout.tsx";
import { ROUTES, ROUTE_MODULES } from "./routes.ts";

const Home = lazy(ROUTE_MODULES.home);
const Login = lazy(ROUTE_MODULES.login);
const Apps = lazy(ROUTE_MODULES.apps);
const ViewApplicant = lazy(ROUTE_MODULES.applicant);
const Rank = lazy(ROUTE_MODULES.rank);
const Food = lazy(ROUTE_MODULES.food);
const Emails = lazy(ROUTE_MODULES.emails);

export default function App() {
  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={
          <Suspense fallback={<PageLoading fullScreen />}>
            <Login />
          </Suspense>
        }
      />
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.apps} element={<Apps />} />
        <Route path={ROUTES.applicant} element={<ViewApplicant />} />
        <Route path={ROUTES.rank} element={<Rank />} />
        <Route path={ROUTES.food} element={<Food />} />
        <Route path={ROUTES.emails} element={<Emails />} />
      </Route>
    </Routes>
  );
}

function PageLoading({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <main
      className={`${fullScreen ? "min-h-screen" : "flex-1"} flex items-center justify-center text-sm text-muted-foreground`}
    >
      Loading…
    </main>
  );
}
