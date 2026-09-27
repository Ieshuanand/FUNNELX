import React, { useEffect } from 'react';

/**
 * CleanRocketTransition
 * 
 * Compact, fast cyber rocket with launch ignition boom.
 * Leaves zero trace marks or persistent lines after completion.
 * 
 * @param {string} direction - 'right' (default) or 'left'
 * @param {number} duration - Total animation time in ms (default: 700ms)
 * @param {function} onComplete - Callback when animation finishes
 */
export default function CleanRocketTransition({
  direction = 'right',
  duration = 700,
  onComplete
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const isReverse = direction === 'left';

  return (
    <div
      className="clean-rocket-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Ignition Launch Boom Flash at launch edge */}
      <div className={`ignition-boom-burst ${isReverse ? 'launch-right' : 'launch-left'}`} />

      {/* Flight Track & Small Agile Rocket */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '60px',
          marginTop: '-30px',
        }}
      >
        <div
          className={isReverse ? 'rocket-fly-anim-left' : 'rocket-fly-anim-right'}
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '150px',
            height: '60px',
            animationDuration: `${duration}ms`,
            animationTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            animationFillMode: 'forwards',
            willChange: 'transform',
          }}
        >
          <svg
            width="150"
            height="60"
            viewBox="0 0 150 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 0 18px #00ff66) drop-shadow(0 0 35px #00f0ff)',
            }}
          >
            {/* Dynamic Particle Streaks trailing behind rocket nozzle */}
            <line x1="10" y1="26" x2="45" y2="26" stroke="#00ff66" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />
            <line x1="-5" y1="30" x2="40" y2="30" stroke="#00f0ff" strokeWidth="3.5" strokeDasharray="10 6" opacity="1" />
            <line x1="15" y1="34" x2="48" y2="34" stroke="#00ff66" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.9" />
            <line x1="0" y1="20" x2="35" y2="20" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.75" />
            <line x1="5" y1="40" x2="38" y2="40" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.75" />

            {/* Trailing Sonic Rings attached to tail */}
            <ellipse cx="40" cy="30" rx="9" ry="22" stroke="#00f0ff" strokeWidth="2" opacity="0.85" strokeDasharray="4 4" />

            {/* Rocket Exhaust Plume / Flames */}
            <path
              d="M 52 30 C 35 24, 15 26, 0 30 C 15 34, 35 36, 52 30 Z"
              fill="url(#flameOuterSmallV2)"
              className="clean-rocket-flame"
            />
            <path
              d="M 52 30 C 40 26, 25 28, 12 30 C 25 32, 40 34, 52 30 Z"
              fill="url(#flameInnerSmallV2)"
            />
            <path
              d="M 52 30 C 46 28, 32 29, 24 30 C 32 31, 46 32, 52 30 Z"
              fill="#ffffff"
            />

            {/* Thruster Nozzle */}
            <path d="M 48 24 L 54 26 L 54 34 L 48 36 Z" fill="#09090b" stroke="#00ff66" strokeWidth="2" />
            <circle cx="53" cy="30" r="7" fill="#00ff66" opacity="0.8" filter="blur(3px)" />

            {/* Top Delta Wing / Fin */}
            <path d="M 66 24 L 50 10 L 64 10 L 86 24 Z" fill="#050505" stroke="#00ff66" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 56 14 L 62 14 L 78 24 L 70 24 Z" fill="#00ff66" opacity="0.6" />

            {/* Bottom Delta Wing / Fin */}
            <path d="M 66 36 L 50 50 L 64 50 L 86 36 Z" fill="#050505" stroke="#00ff66" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 56 46 L 62 46 L 78 36 L 70 36 Z" fill="#00ff66" opacity="0.6" />

            {/* Main Fuselage */}
            <path
              d="M 52 25 C 70 22, 110 21, 138 30 C 110 39, 70 38, 52 35 Z"
              fill="#050505"
              stroke="#00ff66"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Fuselage Inner Plating */}
            <path
              d="M 58 27 C 76 25, 105 24, 126 30 C 105 36, 76 35, 58 33 Z"
              fill="#121214"
            />

            {/* Neon Cyan Accent Stripe */}
            <path
              d="M 64 30 C 82 29, 104 29, 122 30"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cockpit Glass Canopy */}
            <path
              d="M 92 27 C 104 25, 116 25, 122 30 C 116 32, 104 32, 92 30 Z"
              fill="#00f0ff"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <ellipse cx="106" cy="28.5" rx="7" ry="1.5" fill="#ffffff" opacity="0.95" />

            {/* High-Energy Nose Cone Tip */}
            <path
              d="M 132 29 C 137 29.5, 144 30, 146 30 C 144 30, 137 30.5, 132 31 Z"
              fill="#ffffff"
            />
            <circle cx="145" cy="30" r="4" fill="#00ff66" filter="blur(2px)" />

            {/* Gradients */}
            <defs>
              <linearGradient id="flameOuterSmallV2" x1="52" y1="30" x2="0" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00ff66" stopOpacity="1" />
                <stop offset="30%" stopColor="#00f0ff" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="flameInnerSmallV2" x1="52" y1="30" x2="12" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="45%" stopColor="#00f0ff" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#00ff66" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00ff66" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
