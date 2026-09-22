import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "@/App";
import { PrototypeIndex } from "@/PrototypeIndex";
import { ProfileDemo } from "@/demos/profile/ProfileDemo";
import { PublicationDemo } from "@/demos/publication/PublicationDemo";
import "@/index.css";

/*
  Declarative routing (react-router, no data APIs): the demos are static
  screens, so loaders and actions would buy nothing. `App` is the harness
  layout; the index lists the prototypes and each demo is a child route under
  it. Anything unrecognised falls back to the index rather than showing a dead
  page.
*/
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<PrototypeIndex />} />
          <Route path="publication" element={<PublicationDemo />} />
          <Route path="profile" element={<ProfileDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
