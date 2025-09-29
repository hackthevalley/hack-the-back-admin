import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { AuthProvider } from "./utils/auth.tsx";
import Apps from "./pages/Apps.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import ViewApplicant from "./pages/ViewApplicant.tsx";
import { ApplicantsProvider } from "./utils/ApplicantsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApplicantsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/:app_id" element={<ViewApplicant />} />
        </Routes>
      </ApplicantsProvider>
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  </BrowserRouter>
);
