// NCC Symbol — used as a watermark background on the landing page
export default function NCCSymbol({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="200" cy="200" r="185" fill="none" stroke="currentColor" strokeWidth="8" />
      <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeWidth="2" />

      {/* Star burst / rays */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const x1 = 200 + 140 * Math.cos(angle);
        const y1 = 200 + 140 * Math.sin(angle);
        const x2 = 200 + 168 * Math.cos(angle);
        const y2 = 200 + 168 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" />;
      })}

      {/* Inner shield */}
      <path
        d="M200 80 L270 120 L270 200 Q270 260 200 300 Q130 260 130 200 L130 120 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* NCC Text */}
      <text
        x="200"
        y="185"
        textAnchor="middle"
        fontSize="48"
        fontWeight="900"
        fontFamily="Inter, sans-serif"
        fill="currentColor"
        letterSpacing="4"
      >
        NCC
      </text>

      {/* Unity and Discipline */}
      <text
        x="200"
        y="220"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
        fill="currentColor"
        letterSpacing="2"
      >
        UNITY
      </text>
      <text
        x="200"
        y="240"
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        fontFamily="Inter, sans-serif"
        fill="currentColor"
        letterSpacing="3"
      >
        &amp; DISCIPLINE
      </text>

      {/* Bottom decorative arc text */}
      <path id="bottomArc" d="M 60 200 A 140 140 0 0 0 340 200" fill="none" />
      <text fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600" fill="currentColor" letterSpacing="4">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
          NATIONAL CADET CORPS
        </textPath>
      </text>

      {/* Three wings dots */}
      <circle cx="165" cy="270" r="8" fill="currentColor" />
      <circle cx="200" cy="278" r="8" fill="currentColor" />
      <circle cx="235" cy="270" r="8" fill="currentColor" />
    </svg>
  );
}
