import { createRoot } from "react-dom/client";

import "./index.css";
import AppShell from "./app/AppShell";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(<AppShell />);
