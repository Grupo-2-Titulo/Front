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
