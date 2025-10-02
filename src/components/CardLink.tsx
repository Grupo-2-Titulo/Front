import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'


type Props = {
  to: string
  title: string
  description: string
  icon?: ReactNode
  className?: string
}

export default function CardLink({ to, title, description, icon, className }: Props) {
  return (
    <Link
      to={to}
      className={className || "block rounded-2xl border border-gray-200 bg-white/80 hover:bg-white transition shadow-sm hover:shadow-md p-5 md:p-6 w-full"}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex-none grid place-items-center w-12 h-12 rounded-full bg-purple-50 text-purple-700">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm md:text-base">{description}</p>
        </div>
      </div>
    </Link>
  )
}
