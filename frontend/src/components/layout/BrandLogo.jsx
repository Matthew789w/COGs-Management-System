function BrandLogo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="8" height="2.25" rx="1.125" fill="currentColor" opacity="0.5" />
      <rect x="3" y="11.75" width="8" height="2.25" rx="1.125" fill="currentColor" opacity="0.75" />
      <rect x="3" y="15.5" width="8" height="2.25" rx="1.125" fill="currentColor" />

      <path
        d="M13.5 14h2M14.5 12.5 16.25 14 14.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d="M18.5 10.5 22 13v9H18.5v-11.5Z" fill="currentColor" opacity="0.85" />
      <path d="M22 13h3l3 3.5V22H22V13Z" fill="currentColor" />
      <rect x="19.5" y="15" width="1.5" height="1.5" rx="0.25" fill="#1e1b4b" opacity="0.25" />
      <rect x="23.75" y="15" width="1.5" height="1.5" rx="0.25" fill="#1e1b4b" opacity="0.25" />

      <circle cx="24.25" cy="24.25" r="4" fill="currentColor" />
      <text
        x="24.25"
        y="25.35"
        textAnchor="middle"
        fill="#312e81"
        fontSize="5.25"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        ₱
      </text>
    </svg>
  )
}

export default BrandLogo
