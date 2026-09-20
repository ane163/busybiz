import { Suspense } from "react";
import Router from "./routes/Router";

// BusyBiz application shell.
// The existing page structure is preserved; this component only provides
// a consistent loading state while routes are being resolved.
function App() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#070707",
            color: "#d7b547",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>BusyBiz</div>
            <div style={{ color: "#777", fontSize: 13 }}>Loading your workspace…</div>
          </div>
        </div>
      }
    >
      <Router />
    </Suspense>
  );
}

export default App;
