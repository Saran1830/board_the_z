import React from "react";

interface StepIndicatorProps {
  current: number;
  total: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
    {Array.from({ length: total }, (_, i) => i + 1).map(n => {
      const style: React.CSSProperties = {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: 18,
        margin: '0 auto',
        border: '2px solid #e0e0e0',
        background: 'rgba(255,255,255,0.6)',
        color: '#888',
        transition: 'all 0.2s',
      };
      let numberColor = '#888';
      if (n === current) {
        style.border = '2px solid #0070f3';
        style.background = 'rgba(255,255,255,0.6)';
        style.color = '#0070f3';
        numberColor = '#0070f3';
      } else if (n < current) {
        style.border = '2px solid #0070f3';
        style.background = '#0070f3';
        style.color = '#fff';
        numberColor = '#fff';
      }
      // Next steps remain grey
      return (
        <div key={n} style={{ textAlign: 'center' }}>
          <div style={style}>{n}</div>
          <div style={{ fontSize: 14, marginTop: 4, color: numberColor }}>Step {n}</div>
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
