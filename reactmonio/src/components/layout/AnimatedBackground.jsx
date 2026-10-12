// Reusable animated background — grid drift + floating doodles.
// Drop this behind your app content inside the light inner panel.
// Respects CSS variables so it adapts to your active theme.

export default function AnimatedBackground() {
	return (
		<div className="app-bg-layer">
			<style>{`
        .app-bg-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          border-radius: inherit;
        }
        .app-bg-grid {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image:
            linear-gradient(var(--bg-grid-line, rgba(45,212,191,0.14)) 1.5px, transparent 1.5px),
            linear-gradient(90deg, var(--bg-grid-line, rgba(45,212,191,0.14)) 1.5px, transparent 1.5px);
          background-size: 44px 44px;
          animation: appGridDrift 7s linear infinite;
          will-change: transform;
        }
        @keyframes appGridDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(44px, 44px); }
        }
        .app-bg-wash {
          position: absolute;
          inset: -20%;
          width: 140%;
          height: 140%;
          background:
            radial-gradient(ellipse 55% 38% at 15% 10%, var(--bg-wash-1, rgba(45,212,191,0.18)), transparent 60%),
            radial-gradient(ellipse 48% 38% at 90% 25%, var(--bg-wash-2, rgba(140,200,80,0.16)), transparent 60%),
            radial-gradient(ellipse 52% 42% at 30% 85%, var(--bg-wash-3, rgba(90,160,220,0.14)), transparent 60%),
            radial-gradient(ellipse 42% 32% at 85% 90%, var(--bg-wash-4, rgba(232,196,140,0.18)), transparent 60%);
          animation: appWashDrift 9s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes appWashDrift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, -3%) scale(1.05); }
          100% { transform: translate(-3%, 2%) scale(1); }
        }
        .app-doodle {
          position: absolute;
          animation: appFloaty 9s ease-in-out infinite;
          opacity: 0.5;
        }
        @keyframes appFloaty {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(8px,-14px) rotate(6deg); }
          50% { transform: translate(-6px,-6px) rotate(-4deg); }
          75% { transform: translate(-10px,10px) rotate(3deg); }
        }
        @keyframes appFloatySlow {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(-14px,16px) rotate(-8deg); }
        }
      `}</style>

			<div className="app-bg-grid" />
			<div className="app-bg-wash" />
      {/* App doodles scattered across viewport — all theme-reactive */}

      {/* Star (existing) */}
      <svg className="app-doodle" style={{ top: '6%', left: '4%', width: 24, animationDuration: '8s', animationDelay: '1s' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.6 6.6L21 9l-5 4.4L17.5 21 12 17.3 6.5 21 8 13.4 3 9l6.4-.4z" fill="var(--primary, #5aa0dc)" />
      </svg>

      {/* Pen (existing) */}
      <svg className="app-doodle" style={{ top: '80%', left: '6%', width: 22, animationDuration: '11s', animationDelay: '0.8s', animationName: 'appFloatySlow' }} viewBox="0 0 24 24" fill="none">
        <path d="M3 21l1.2-4.8L15.6 4.8a1.7 1.7 0 0 1 2.4 0l1.2 1.2a1.7 1.7 0 0 1 0 2.4L7.8 19.8 3 21z" fill="var(--primary-light, #2dd4bf)" />
      </svg>

      {/* Squiggle-heart line (existing) */}
      <svg className="app-doodle" style={{ top: '85%', right: '10%', width: 26, animationDuration: '9.5s' }} viewBox="0 0 24 24" fill="none">
        <path d="M4 15c2-3 3-5 5-8 1 1 2 2 3 2s1-1 2-2c1.5 2 2.5 4 4 6-1 1-2 1-3 0-1.5-1.5-2 1-3.5 0-1-1-1.5.5-3 0-1-.5-2.5 3-4.5 2z" stroke="var(--primary, #5aa0dc)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Sparkle (replaces heart 1) */}
      <svg className="app-doodle" style={{ top: '12%', right: '8%', width: 26, animationDuration: '10s' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 2c0 4-1 7-3 9s-5 3-9 3c4 0 7 1 9 3s3 5 3 9c0-4 1-7 3-9s5-3 9-3c-4 0-7-1-9-3s-3-5-3-9z" fill="var(--primary, #8CC850)" opacity="0.5" />
      </svg>

      
      {/* Pen 2 (new) */}
      <svg className="app-doodle" style={{ top: '30%', left: '8%', width: 24, animationDuration: '11s' }} viewBox="0 0 24 24" fill="none">
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="var(--primary, #8CC850)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Flipped M (new) */}
      <svg className="app-doodle" style={{ top: '45%', right: '14%', width: 22, animationDuration: '7s' }} viewBox="0 0 16 16" fill="none">
        <path d="M 5,12 L 6,4 L 8,8 L 10,4 L 12,12" stroke="var(--primary-light, #2dd4bf)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Star 2 (new) */}
      <svg className="app-doodle" style={{ top: '58%', left: '5%', width: 20, animationDuration: '6.5s', animationDelay: '0.6s' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.6 6.6L21 9l-5 4.4L17.5 21 12 17.3 6.5 21 8 13.4 3 9l6.4-.4z" fill="var(--primary-light, #e8c48c)" opacity="0.5" />
      </svg>

      {/* Diamond (replaces heart 2) */}
      <svg className="app-doodle" style={{ top: '65%', right: '20%', width: 20, animationDuration: '9s', animationDelay: '0.8s' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l6 10-6 10-6-10z" fill="var(--primary, #5aa0dc)" opacity="0.4" />
      </svg>

      {/* Pen 3 (new) */}
      <svg className="app-doodle" style={{ top: '38%', left: '20%', width: 22, animationDuration: '11s' }} viewBox="0 0 24 24" fill="none">
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="var(--primary, #8CC850)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Squiggle 1 (new) */}
      <svg className="app-doodle" style={{ top: '22%', left: '35%', width: 55, animationName: 'squiggleMove', animationDuration: '6s' }} viewBox="0 0 80 20" fill="none">
        <path d="M2 10c8-10 14 10 22 0s14 10 22 0 14 10 22 0" stroke="var(--primary-light, #2dd4bf)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      </svg>

      {/* Squiggle 2 (new) */}
      <svg className="app-doodle" style={{ top: '72%', left: '42%', width: 50, animationName: 'squiggleMove', animationDuration: '7s', animationDelay: '1s' }} viewBox="0 0 80 20" fill="none">
        <path d="M2 10c8-10 14 10 22 0s14 10 22 0 14 10 22 0" stroke="var(--primary-light, #e8c48c)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      </svg>
		</div>
	);
}