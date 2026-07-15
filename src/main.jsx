import React from "react";
import ReactDOM from "react-dom/client";
import ShutterbugWorld from "./shutterbug-world.jsx";
import "./index.css";

// A safety net so a render error in one screen can never blank the whole game.
// With no boundary, a single thrown error unmounts everything and leaves a void
// page — effectively ending the run. Instead we show a friendly recover card and
// remount the game on "try again" (saved profiles/passport live in localStorage,
// so nothing is lost).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, resetKey: 0 };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error, info) {
    console.error("Shutterbug crashed:", error, info);
  }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#12303A", background: "#b09669" }}>
          <div style={{ background: "#F4ECD8", border: "3px solid #C65B3E", borderRadius: 16, padding: "26px 24px", maxWidth: 420, textAlign: "center", boxShadow: "0 14px 44px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 44 }} aria-hidden="true">📷</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 6px" }}>Oops — the camera jammed!</h1>
            <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.85, margin: "0 0 16px" }}>
              Something went wrong for a moment. Your saved travellers and passport are safe — tap below to pick up again.
            </p>
            <button onClick={() => this.setState((s) => ({ failed: false, resetKey: s.resetKey + 1 }))}
              style={{ background: "#C65B3E", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 0 #A93A28" }}>
              Back to the desk 🧭
            </button>
          </div>
        </div>
      );
    }
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ShutterbugWorld />
    </ErrorBoundary>
  </React.StrictMode>
);
