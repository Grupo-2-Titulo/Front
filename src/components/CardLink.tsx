import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'


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
      className={
        className ||
        'block w-full rounded-2xl border border-purple-100 bg-white/80 p-5 shadow-sm transition hover:border-purple-200 hover:bg-white hover:shadow-md md:p-6'
      }
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-purple-100 text-purple-700">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 md:text-base">{description}</p>
        </div>
      </div>
    </Link>
  )
}
