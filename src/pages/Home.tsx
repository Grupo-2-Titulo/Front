import CardLink from '../components/CardLink'
import { ChatBubble, Clipboard} from '../icons/Icons'

export default function Home() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <div className="grid w-full place-items-center">
          <div className="w-280 h-280 flex items-center justify-center">
            <img
                src="https://invadelab.cl/wp-content/uploads/2019/06/logo-ucchristus.png"
                alt="Logo UC Christus"
                className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-3 max-w-xl text-center text-gray-700">
            Estamos aquí para ayudarte. Selecciona la opción que necesites.
          </p>
        </div>

        <section className="mt-10 space-y-4">
          <CardLink
            to="/dudas"
            title="Dudas"
            description="Resuelve tus preguntas frecuentes sobre el hospital"
            icon={<ChatBubble />}
          />
          <CardLink
            to="/solicitudes"
            title="Solicitudes"
            description="Realiza peticiones y trámites de manera sencilla"
            icon={<Clipboard />}
          />
          {/* <CardLink
            to="/felicitaciones-reclamos"
            title="Felicitaciones/Reclamos"
            description="Comparte tu experiencia con nosotros"
            icon={<Info />}
          /> */}
        </section>

        <p className="mt-10 text-center text-sm text-gray-500">
          Escanea el código QR para acceder desde tu dispositivo móvil
        </p>
      </main>
    </div>
  )
}
