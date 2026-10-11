import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Implenix, AI Receptionist for Local Businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#070538',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`v${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(i + 1) * 100}px`,
                width: '1px',
                background: 'rgba(61,250,255,0.06)',
              }}
            />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`h${i}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(i + 1) * 90}px`,
                height: '1px',
                background: 'rgba(61,250,255,0.06)',
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontSize: 36,
                  color: '#ffffff',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                }}
              >
                <span style={{ color: '#3dfaff' }}>i</span>mplenix
              </span>
              <svg
                width="44"
                height="44"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g fill="#3dfaff" transform="rotate(6 50 50)">
                  <rect x="34" y="10" width="58" height="16" rx="8" />
                  <rect x="76" y="14" width="16" height="50" rx="8" />
                  <rect x="8" y="50" width="58" height="16" rx="8" />
                  <rect x="50" y="54" width="16" height="40" rx="8" />
                </g>
              </svg>
            </div>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
                color: '#3dfaff',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                border: '1px solid rgba(61,250,255,0.4)',
                padding: '6px 12px',
              }}
            >
              <span style={{ width: 8, height: 8, background: '#3dfaff' }} />
              AI Voice Agents
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 76,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              <div style={{ display: 'flex', gap: 22 }}>
                <span>The AI that</span>
                <span style={{ color: '#bb00ff' }}>answers,</span>
                <span>qualifies,</span>
              </div>
              <div style={{ display: 'flex', gap: 22 }}>
                <span>and</span>
                <span style={{ color: '#3dfaff' }}>books.</span>
                <span>Every call.</span>
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.7)',
                maxWidth: 900,
              }}
            >
              We build and deploy AI voice agents for local businesses.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 16,
              color: 'rgba(255,255,255,0.55)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              borderTop: '1px solid rgba(187,0,255,0.25)',
              paddingTop: 24,
            }}
          >
            <span>implenix.net</span>
            <span>We Automate the Call. You Close the Deal.</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
