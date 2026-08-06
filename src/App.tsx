import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

const Home = lazy(() => import("./pages/Home.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Apps = lazy(() => import("./pages/Apps.tsx"));
const ViewApplicant = lazy(() => import("./pages/ViewApplicant.tsx"));
const Rank = lazy(() => import("./pages/Rank.tsx"));
const Food = lazy(() => import("./pages/Food.tsx"));
const Emails = lazy(() => import("./pages/Emails.tsx"));

export default function App() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </main>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/:app_id" element={<ViewApplicant />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/food" element={<Food />} />
        <Route path="/emails" element={<Emails />} />
      </Routes>
    </Suspense>
  );
}
