import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.7)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      borderRadius: 24,
      padding: 32,
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.18)",
      ...style,
    }}
  >
    {children}
  </div>
);

export default GlassCard;
