import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { AuthProvider } from "./utils/auth.tsx";
import Apps from "./pages/Apps.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/apps" element={<Apps />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
