import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ShutterbugWorld from "./shutterbug-world.jsx";
import "./index.css";

// ---- Boot splash: the Lotus logo on white, before the game's own splash --------
// A blank white screen with the Lotus logo centred: it fades IN from white over
// one second, holds for one, fades back OUT to white over the last second (three
// seconds in all), and then the white lifts to reveal the game's splash beneath.
//
// It sits OVER the app rather than before it, so the game's splash is already
// mounted underneath and the final second reads as a cross-fade into it rather than
// a cut. Click or press any key to skip — a forced screen must never trap anyone.
function BootSplash() {
  const [gone, setGone] = useState(false);
  const [logoIn, setLogoIn] = useState(false);
  const [lift, setLift] = useState(false);     // the white overlay lifts to reveal the splash
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLogoIn(true));       // 0s: start the fade-in
    const tOut = setTimeout(() => setLogoIn(false), 4000);          // 4s: fade the logo out
    const tLift = setTimeout(() => setLift(true), 5000);            // 5s: lift the white
    const tGone = setTimeout(() => setGone(true), 5750);            // remove once revealed
    const skip = () => setGone(true);
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(tOut); clearTimeout(tLift); clearTimeout(tGone);
      window.removeEventListener("keydown", skip);
    };
  }, []);
  if (gone) return null;
  const logo = `${import.meta.env.BASE_URL}assets/shutterbug-ui/lotus-logo.png`;
  return (
    <div onClick={() => setGone(true)} aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: lift ? 0 : 1, transition: "opacity 0.7s ease",
        pointerEvents: lift ? "none" : "auto", cursor: "pointer" }}>
      <img src={logo} alt="" style={{ maxWidth: "min(58vw, 440px)", height: "auto",
        opacity: logoIn ? 1 : 0, transition: "opacity 1s ease" }} />
    </div>
  );
}

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
              Something went wrong for a moment. Your saved travelers and passport are safe — tap below to pick up again.
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

// ---- Take a new build the FIRST time, not the second ------------------------
// vite.config.js already ships `registerType: "autoUpdate"` with skipWaiting +
// clientsClaim, so a new service worker installs and takes over the open page
// straight away. What it CANNOT do is change the HTML and JS the page already
// loaded — those came from the old precache. So a returning player sees the
// previous build until they happen to reload, which is exactly the "the subtitle
// is still the old blue one until I force a refresh" report.
//
// `controllerchange` fires at the moment the fresh worker claims this page. One
// reload there and the player is on the new build without knowing anything
// happened. The guard matters: without it, a reload that itself triggers another
// controllerchange would loop the page forever.
if ("serviceWorker" in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ShutterbugWorld />
    </ErrorBoundary>
    <BootSplash />
  </React.StrictMode>
);
