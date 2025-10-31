import { useNavigate } from "react-router-dom"

import { ArrowLeft } from "../icons/Icons"

export default function BackHeader({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="-ml-2 rounded-full p-2 text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  )
}
