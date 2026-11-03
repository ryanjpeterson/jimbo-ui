import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shell } from "./Shell";
import "./main.css";

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      {/* The route and its view state live in the URL (#/jimbo-ui?tab=type), so a refresh, Back or a
          shared link opens the same view. Hash routing, because the published page is one file. */}
      <HashRouter>
        <Shell />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
);
