import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import "./index.css";

// HashRouter: GitHub Pages serves static files only, so deep links like /books/3 must live in the URL hash.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);
