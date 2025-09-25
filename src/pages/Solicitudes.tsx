import BackHeader from '../components/BackHeader'
import CardLink from '../components/CardLink'
import { Calendar, Clipboard, Info } from '../icons/Icons'

export default function Solicitudes() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title="Solicitudes" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-center text-gray-700 max-w-2xl mx-auto">
          Realiza peticiones y trámites de manera sencilla.<br />
          Selecciona el tipo de solicitud que necesitas.
        </p>

        <section className="mt-8 space-y-4 max-w-2xl mx-auto">
          <CardLink
            to="#"
            title="Solicitud de documentos"
            description="Solicita copias de historias clínicas, resultados de exámenes"
            icon={<Clipboard />}
          />
          <CardLink
            to="#"
            title="Solicitud de reunión"
            description="Programa una cita con el médico tratante o especialista"
            icon={<Calendar />}
          />
          <CardLink
            to="#"
            title="Solicitud de información adicional"
            description="Obtén información sobre tratamientos, procedimientos"
            icon={<Info />}
          />
        </section>
      </main>
    </div>
  )
}
