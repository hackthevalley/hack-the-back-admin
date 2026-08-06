import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import { AdminLayout } from "./components/AdminLayout.tsx";
import { routeModules } from "./routeModules.ts";

const Home = lazy(routeModules.home);
const Login = lazy(routeModules.login);
const Apps = lazy(routeModules.apps);
const ViewApplicant = lazy(routeModules.viewApplicant);
const Rank = lazy(routeModules.rank);
const Food = lazy(routeModules.food);
const Emails = lazy(routeModules.emails);

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoading fullScreen />}>
            <Login />
          </Suspense>
        }
      />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/:app_id" element={<ViewApplicant />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/food" element={<Food />} />
        <Route path="/emails" element={<Emails />} />
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
