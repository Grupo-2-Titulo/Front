import BackHeader from '../components/BackHeader'
import CardLink from '../components/CardLink'
import { AirConditioner, TvRemote, Bathroom, LightPlug, Furniture, Tools } from '../icons/Icons'
import { Link } from 'react-router-dom'

export default function Solicitudes() {
  const solicitudes = [
    { to: "/formulario/climatizacion", title: "Climatización", description: "Solicita revisión del aire", icon: <AirConditioner /> },
    { to: "/formulario/tv", title: "Televisión y Controles", description: "Problemas con TV o control", icon: <TvRemote /> },
    { to: "/formulario/bano", title: "Baño y Lavamanos", description: "Mantención en baño, ducha, lavamanos", icon: <Bathroom /> },
    { to: "/formulario/electricidad", title: "Electricidad e Iluminación", description: "Problemas con luces o enchufes", icon: <LightPlug /> },
    { to: "/formulario/mobiliario", title: "Mobiliario y Equipamiento", description: "Reparación de muebles", icon: <Furniture /> },
    { to: "/formulario/otros", title: "Otros Requerimientos", description: "Otro tipo de mantención", icon: <Tools /> },
  ]

  return (
    <div className="min-h-dvh bg-gray-50">
      <BackHeader title="Solicitudes" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-center text-gray-700 max-w-2xl mx-auto">
          Selecciona el tipo de solicitud que necesitas.
        </p>

        <section className="mt-8 max-w-2xl mx-auto flex flex-col gap-4">
          {solicitudes.map(s => (
            <Link key={s.to} to={s.to}>
              <CardLink
                to={s.to}
                title={s.title}
                description={s.description}
                icon={s.icon}
              />

            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
