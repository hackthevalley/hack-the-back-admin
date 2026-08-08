import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { ApplicantsProvider } from "./context/applicants-provider.tsx";
import { AuthProvider } from "./context/auth.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");

createRoot(root).render(
  <BrowserRouter>
    <AuthProvider>
      <ApplicantsProvider>
        <App />
      </ApplicantsProvider>
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  </BrowserRouter>,
);
