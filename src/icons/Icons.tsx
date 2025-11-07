import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number }

// export const HeartCircle = ({ size = 88, ...props }: IconProps) => (
//   <svg viewBox="0 0 24 24" width={size} height={size} {...props}>
//     <circle cx="12" cy="12" r="11" fill="currentColor" opacity=".15" />
//     <path d="M12 18s-5-3.197-5-6.5A3.5 3.5 0 0 1 12 9a3.5 3.5 0 0 1 5 2.5c0 3.303-5 6.5-5 6.5Z"
//       fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
//   </svg>
// )

export const ChatBubble = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path fill="currentColor"
      d="M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
  </svg>
)

export const Clipboard = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path fill="currentColor"
      d="M9 3h6a2 2 0 0 1 2 2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2-2Zm0 2v2h6V5H9Z" />
  </svg>
)

export const Calendar = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path fill="currentColor"
      d="M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm2-4h2v2H5V4Zm12 0h2v2h-2V4Z" />
  </svg>
)

export const Info = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" />
    <path d="M12 8.5h.01M11 11h2v6h-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const ArrowLeft = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path fill="currentColor" d="M11 19 4 12l7-7v4h9v6h-9v4z" />
  </svg>
)

export const Location = ({ size = 18, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path fill="currentColor"
      d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
)

export const Settings = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path
      fill="currentColor"
      d="M19.4 13a7.7 7.7 0 0 0 0-2l2.1-1.6a.5.5 0 0 0 .1-.7l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.6 7.6 0 0 0-1.7-1L14 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5L9 5a7.6 7.6 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.7L4.6 11a7.7 7.7 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.7l2 3.5a.5.5 0 0 0 .6.2l2.5-1c.5.4 1.1.7 1.7 1l.5 2.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.5-2.5c.6-.3 1.2-.6 1.7-1l2.5 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.7L19.4 13ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
    />
  </svg>
)

export const AirConditioner = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <rect x="3" y="4" width="18" height="6" rx="2" ry="2" stroke="currentColor" fill="none" strokeWidth="1.6"/>
    <line x1="7" y1="14" x2="7" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="12" y1="14" x2="12" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="17" y1="14" x2="17" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export const TvRemote = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" fill="none" strokeWidth="1.6"/>
    <rect x="9" y="18" width="6" height="2" rx="1" fill="currentColor"/>
  </svg>
)

export const Bathroom = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <circle cx="7" cy="7" r="3" stroke="currentColor" fill="none" strokeWidth="1.6"/>
    <path d="M7 10v10h10v-6" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M14 5h4v4" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export const LightPlug = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <circle cx="12" cy="12" r="5" stroke="currentColor" fill="none" strokeWidth="1.6"/>
    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export const Furniture = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <rect x="3" y="10" width="18" height="6" rx="1" stroke="currentColor" fill="none" strokeWidth="1.6"/>
    <line x1="3" y1="16" x2="3" y2="20" stroke="currentColor" strokeWidth="1.6"/>
    <line x1="21" y1="16" x2="21" y2="20" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
)

export const Tools = ({ size = 22, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path d="M15 2a4 4 0 0 0-3 7l-7 7a2 2 0 0 0 0 3l2 2a2 2 0 0 0 3 0l7-7a4 4 0 0 0-2-7Z" 
      stroke="currentColor" fill="none" strokeWidth="1.6"/>
  </svg>
)

export const ThumbUp = ({ size = 20, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 10v10H3V10h3Zm3 10h8.3a2 2 0 0 0 2-1.6l1.2-6.8A2 2 0 0 0 18.6 9H15V5a2 2 0 0 0-2-2l-3 7Z"
    />
  </svg>
)

export const ThumbDown = ({ size = 20, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 14V4h3v10h-3Zm-3-10H6.7a2 2 0 0 0-2 1.6L3.5 12.4A2 2 0 0 0 5.4 15H9v4a2 2 0 0 0 2 2l3-7Z"
    />
  </svg>
)
