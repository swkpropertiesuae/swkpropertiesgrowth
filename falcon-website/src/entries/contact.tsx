import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import Page from "../pages/contact";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
