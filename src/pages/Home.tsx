import CardLink from '../components/CardLink'
import { ChatBubble, Clipboard } from '../icons/Icons'
import { Location } from '../icons/Icons'

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 via-white to-white">
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <div className="grid w-full place-items-center">
          <div className="flex h-56 w-full max-w-[40rem] items-center justify-center rounded-3xl">
            <img
              src="https://invadelab.cl/wp-content/uploads/2019/06/logo-ucchristus.png"
              alt="Logo UC Christus"
              className="h-48 w-full max-w-[34rem] object-contain"
            />
          </div>
          <div className="mt-6 max-w-2xl text-center">
            <h1 className="text-3xl font-semibold text-gray-900 md:text-3xl">
              Bienvenido al portal de asistencia UC Christus
            </h1>
            <p className="mt-3 text-base text-gray-600 md:text-lg">
              Encuentra respuestas inmediatas con nuestro asistente virtual o genera solicitudes personalizadas
              en unos pocos pasos.
            </p>
          </div>
        </div>

        <section className="mt-10 space-y-4">
          <CardLink
            to="/dudas"
            title="Asistente Virtual"
            description="Consulta al instante con la IA"
            icon={<ChatBubble />}
          />
          <CardLink
            to="/solicitudes"
            title="Solicitudes"
            description="Gestiona requerimientos y trámites"
            icon={<Clipboard />}
            className="block w-full rounded-2xl border border-purple-100 bg-white/90 p-5 shadow-sm transition hover:border-purple-200 hover:bg-white hover:shadow-md md:p-6"
          />
        </section>

        <section className="mt-10 space-y-3 bg-white/70 px-6 py-8 text-center text-sm text-gray-500">
          <p>Escanea el código QR en tu habitación para acceder desde tu dispositivo móvil.</p>
          <p className="text-xs text-gray-400">
            Portal UC Christus - Asistencia a un clic de distancia.
          </p>
        </section>
        <div className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-gray-600">
          <Location />  Av. Vicuña Mackenna 4686, Macul, Región Metropolitana
        </div>
      </main>
    </div>
  )
}
