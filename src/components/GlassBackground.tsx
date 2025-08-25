import React from "react";

const GlassBackground: React.FC = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      background: "rgba(255,255,255,0.35)",
      backdropFilter: "blur(18px)",
      pointerEvents: "none"
    }}
  />
);

export default GlassBackground;
