// Inline stroke icons — one consistent 24px grid, currentColor, no icon font
// and no emoji (emoji render differently per-OS and can't take the ink tokens).

function Icon({ children, size = 18, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconDashboard = (p) => (
  <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Icon>
)
export const IconInbox = (p) => (
  <Icon {...p}><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M4.5 13 6 5.5A2 2 0 0 1 8 4h8a2 2 0 0 1 2 1.5L19.5 13v4A2.5 2.5 0 0 1 17 19.5H7A2.5 2.5 0 0 1 4.5 17z" /></Icon>
)
export const IconSend = (p) => (
  <Icon {...p}><path d="M21 3 10.5 13.5" /><path d="M21 3l-6.5 18-4-8-8-4z" /></Icon>
)
export const IconChat = (p) => (
  <Icon {...p}><path d="M20 12.5a7.5 7.5 0 0 1-10.9 6.7L4 20.5l1.4-4.6A7.5 7.5 0 1 1 20 12.5z" /><path d="M9 11h6M9 14.5h3.5" /></Icon>
)
export const IconStar = (p) => (
  <Icon {...p}><path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8z" /></Icon>
)
export const IconSettings = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></Icon>
)
export const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const IconTrash = (p) => (
  <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" /><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /></Icon>
)
export const IconDownload = (p) => (
  <Icon {...p}><path d="M12 3v12" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 20h16" /></Icon>
)
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></Icon>
export const IconSun = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
)
export const IconMoon = (p) => <Icon {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></Icon>
export const IconMenu = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
export const IconClose = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>
export const IconCheck = (p) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Icon>
export const IconAlert = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2v.1" /></Icon>
)
export const IconSparkles = (p) => (
  <Icon {...p}><path d="m12 3 1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7z" /><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></Icon>
)
export const IconPause = (p) => <Icon {...p}><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></Icon>
export const IconPlay = (p) => <Icon {...p}><path d="M7 5.5v13l11-6.5z" /></Icon>
export const IconRefresh = (p) => (
  <Icon {...p}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.5h-4.5" /></Icon>
)
export const IconUpload = (p) => (
  <Icon {...p}><path d="M12 16V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M4 20h16" /></Icon>
)
export const IconChevronRight = (p) => <Icon {...p}><path d="m9 5 7 7-7 7" /></Icon>
export const IconArrowUp = (p) => <Icon {...p}><path d="M12 20V5" /><path d="m6 11 6-6 6 6" /></Icon>
export const IconArrowDown = (p) => <Icon {...p}><path d="M12 4v15" /><path d="m6 13 6 6 6-6" /></Icon>
export const IconTable = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9.5h18M9 9.5V20" /></Icon>
)
export const IconChart = (p) => (
  <Icon {...p}><path d="M4 20h16" /><rect x="5" y="11" width="3.5" height="6" rx="1" /><rect x="10.5" y="7" width="3.5" height="10" rx="1" /><rect x="16" y="13" width="3.5" height="4" rx="1" /></Icon>
)
export const IconMail = (p) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 8 7.1 4.7a1.6 1.6 0 0 0 1.8 0L20 8" /></Icon>
)
export const IconPhone = (p) => (
  <Icon {...p}><path d="M8.5 3.5 10.5 8l-2 1.5a11 11 0 0 0 6 6L16 13.5l4.5 2v3A2 2 0 0 1 18.3 20.5 16.5 16.5 0 0 1 3.5 5.7 2 2 0 0 1 5.5 3.5z" /></Icon>
)
export const IconBolt = (p) => <Icon {...p}><path d="M13.5 2.5 4.5 13.5h6l-.5 8 9-11h-6z" /></Icon>
export const IconServer = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5v.01M7 16.5v.01" /></Icon>
)
export const IconDatabase = (p) => (
  <Icon {...p}><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></Icon>
)
export const IconLock = (p) => (
  <Icon {...p}><rect x="4.5" y="10" width="15" height="10.5" rx="2.5" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /><path d="M12 14v2.5" /></Icon>
)
export const IconUnlock = (p) => (
  <Icon {...p}><rect x="4.5" y="10" width="15" height="10.5" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 7.7-1.5" /><path d="M12 14v2.5" /></Icon>
)
export const IconKey = (p) => (
  <Icon {...p}><circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3.5M15.5 12v2.5" /></Icon>
)
export const IconFile = (p) => (
  <Icon {...p}><path d="M13 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M13 3v5h5" /></Icon>
)
export const IconGlobe = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M3.5 9.5h17M3.5 14.5h17" /><path d="M12 3c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9c2.5-2.4 3.8-5.4 3.8-9S14.5 5.4 12 3z" /></Icon>
)
export const IconCopy = (p) => (
  <Icon {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6" /></Icon>
)
export const IconClock = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></Icon>
)
export const IconEdit = (p) => (
  <Icon {...p}><path d="M4 20h4.5l9.4-9.4a2.1 2.1 0 0 0-3-3L5.5 17z" /><path d="M14.5 5.5 18.5 9.5" /></Icon>
)
export const IconArrowLeftCircle = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M13 8.5 9.5 12l3.5 3.5" /><path d="M9.5 12H15" /></Icon>
)
export const IconChevronDown = (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>
export const IconInfo = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8v.1" /></Icon>
)
export const IconRobot = (p) => (
  <Icon {...p}><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 4v4M9 13v1.5M15 13v1.5" /><path d="M2 13v3M22 13v3" /></Icon>
)
export const IconShield = (p) => (
  <Icon {...p}><path d="M12 3l7.5 3v5.6c0 4.4-3 8.2-7.5 9.4-4.5-1.2-7.5-5-7.5-9.4V6z" /><path d="m9 12 2 2 4-4" /></Icon>
)
