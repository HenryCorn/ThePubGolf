// Deterministic XorShift32 — identical on server & client, no hydration mismatch
const STARS = (() => {
  let s = 42
  const rand = () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return (s >>> 0) / 4294967296
  }
  return Array.from({ length: 75 }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: rand() * 1.8 + 0.5,
    opacity: rand() * 0.5 + 0.08,
  }))
})()

export default function SceneBG() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: -1,
        overflow: 'hidden', pointerEvents: 'none',
      }}
    >
      {/* Base gradient — lighter at top like a deep-night sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0D1F3C 0%, #080F1C 50%, #040912 100%)',
      }} />

      {/* Primary glow — top centre, dominant blue */}
      <div style={{
        position: 'absolute',
        top: '-25%', left: '50%', transform: 'translateX(-50%)',
        width: '120vw', height: '80vh',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(22,102,196,0.30) 0%, rgba(14,64,153,0.12) 45%, transparent 70%)',
      }} />

      {/* Secondary glow — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '-20%', right: '-15%',
        width: '75vw', height: '65vh',
        background: 'radial-gradient(ellipse at 60% 60%, rgba(10,64,153,0.22) 0%, rgba(6,30,80,0.08) 55%, transparent 80%)',
      }} />

      {/* Accent glow — mid left, subtle brighter blue */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '-10%',
        width: '55vw', height: '45vh',
        background: 'radial-gradient(ellipse at 25% 40%, rgba(56,144,224,0.10) 0%, transparent 65%)',
      }} />

      {/* Golden accent — very faint top-right, like a distant sunrise */}
      <div style={{
        position: 'absolute',
        top: '0%', right: '-5%',
        width: '45vw', height: '35vh',
        background: 'radial-gradient(ellipse at 70% 10%, rgba(244,196,48,0.07) 0%, transparent 60%)',
      }} />

      {/* Star field */}
      {STARS.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: 'white',
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}
