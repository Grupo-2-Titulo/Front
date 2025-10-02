import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "../icons/Icons"

export default function BackHeader({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  )
}
