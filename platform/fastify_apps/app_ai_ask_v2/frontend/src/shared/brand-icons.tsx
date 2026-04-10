const FigmaIcon = ({ s = 20 }: {s?: number;}) =>
<svg viewBox="0 0 38 57" width={s} height={s} data-test-id="svg-b3115561">
    <path fill="#F24E1E" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
    <path fill="#FF7262" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" />
    <path fill="#1ABCFE" d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z" />
    <path fill="#0ACF83" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
    <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
  </svg>;

const GitHubIcon = ({ s = 20 }: {s?: number;}) =>
<svg viewBox="0 0 24 24" width={s} height={s} fill="#24292e" data-test-id="svg-f508e8d8">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2.02c-3.34.72-4.04-1.6-4.04-1.6-.54-1.37-1.33-1.74-1.33-1.74-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.06 1.82 2.79 1.3 3.47.99.1-.77.41-1.3.75-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>;

const JiraIcon = ({ s = 20 }: {s?: number;}) =>
<svg viewBox="0 0 32 32" width={s} height={s} data-test-id="svg-a3134ad0">
    <defs>
      <linearGradient id="jg2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2684FF" />
        <stop offset="100%" stopColor="#0052CC" />
      </linearGradient>
    </defs>
    <path fill="url(#jg2)" d="M16 2L2 16l6.9 6.9L16 16l7.1 6.9L30 16z" />
    <path fill="#2684FF" d="M16 9.1l-6.9 6.9L16 22.9l6.9-6.9z" opacity=".7" />
  </svg>;

const ConfluenceIcon = ({ s = 20 }: {s?: number;}) =>
<svg viewBox="0 0 32 32" width={s} height={s} data-test-id="svg-404983a4">
    <path
    fill="#2684FF"
    d="M3 22.4c-.3.4-.6 1-.5 1.4.1.4.5.7.9.8l6.2 1.8c.4.1.9 0 1.2-.3.2-.2 2.7-4 5.2-4s5 3.8 5.2 4c.3.4.8.5 1.2.3l6.2-1.8c.4-.1.8-.4.9-.8.1-.4-.2-1-.5-1.4C27.7 20.7 22.5 14 16 14s-11.7 6.7-13 8.4zM29 9.6c.3-.4.6-1 .5-1.4-.1-.4-.5-.7-.9-.8l-6.2-1.8c-.4-.1-.9 0-1.2.3-.2.2-2.7 4-5.2 4s-5-3.8-5.2-4c-.3-.4-.8-.5-1.2-.3L3.4 7.4c-.4.1-.8.4-.9.8-.1.4.2 1 .5 1.4C4.3 11.3 9.5 18 16 18s11.7-6.7 13-8.4z" />

  </svg>;

const SauceIcon = ({ s = 20 }: {s?: number;}) =>
<svg viewBox="0 0 32 32" width={s} height={s} data-test-id="svg-b64430c6">
    <circle cx="16" cy="16" r="14" fill="#E2231A" />
    <text x="16" y="21" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">S</text>
  </svg>;

const StatsigIcon = ({ s = 20 }: {s?: number;}) =>
<svg viewBox="0 0 32 32" width={s} height={s} data-test-id="svg-6d8cf071">
    <rect width="32" height="32" rx="6" fill="#1C2E4A" />
    <path d="M5 22l7-10 6 7 3-5 6 8" stroke="#4ADE80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


export { FigmaIcon, GitHubIcon, JiraIcon, ConfluenceIcon, SauceIcon, StatsigIcon };