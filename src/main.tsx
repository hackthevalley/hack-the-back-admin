import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { ApplicantsProvider } from "./utils/ApplicantsContext.tsx";
import { AuthProvider } from "./utils/auth.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApplicantsProvider>
        <App />
      </ApplicantsProvider>
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  </BrowserRouter>,
);
