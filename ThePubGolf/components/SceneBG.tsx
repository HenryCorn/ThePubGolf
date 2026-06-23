export default function SceneBG() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: -1,
        overflow: 'hidden', pointerEvents: 'none',
      }}
    >
      {/* Base: deep bottle-green */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #1B3A2D 0%, #152E23 45%, #0F2018 100%)',
      }} />

      {/* Paper grain via SVG feTurbulence — same output server+client, no hydration mismatch */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="pg" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="linearRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.68 0.68" numOctaves="3" seed="12" stitchTiles="stitch" result="n" />
            <feColorMatrix type="saturate" values="0" in="n" result="g" />
            <feBlend in="SourceGraphic" in2="g" mode="overlay" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="rgba(242,232,198,0.065)" filter="url(#pg)" />
      </svg>

      {/* Warm centre glow — pub lamplight */}
      <div style={{
        position: 'absolute',
        top: '8%', left: '50%', transform: 'translateX(-50%)',
        width: '80vw', height: '55vh',
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 65%)',
      }} />

      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(8,16,12,0.6) 100%)',
      }} />
    </div>
  )
}
