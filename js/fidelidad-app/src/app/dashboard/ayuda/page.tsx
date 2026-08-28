import { ShieldAlert, BarChart3, Users, Store, Wallet, PlayCircle, BookOpen } from "lucide-react";

export default function AyudaPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Manual de Administrador
          </h1>
          <p className="text-gray-500 mt-2">
            Guía rápida de acceso y uso del panel de control de CRM Mandorla
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Sección 1 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
            1. Inicio de Sesión y Acceso
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 text-gray-600">
            <p>
              Para acceder a las funciones administrativas y poder gestionar los puntos, presupuestos y clientes, 
              debes iniciar sesión con una cuenta autorizada a través de <strong className="text-gray-900">/admin/login</strong>.
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg text-sm text-orange-800">
              <strong>Nota de Seguridad (MVP):</strong> El sistema solo permite el acceso al panel a una lista específica 
              de correos electrónicos autorizados (como `gerardo@gtdata.com.ar`). Si ingresas con un correo no autorizado, 
              no podrás ver el panel y serás tratado como un cliente normal.
            </div>
            <p>Una vez validados tus datos, el sistema te redirigirá automáticamente al <strong>Dashboard (Métricas)</strong>.</p>
          </div>
        </section>

        {/* Sección 2 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Navegación por el Panel de Control
          </h2>
          
          <div className="grid gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Métricas (Resumen General)
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Tarjetas con el total de puntos entregados, límite de presupuesto (si aplica), puntos del día y total de clientes registrados.
                Incluye una tabla consolidada con el listado de todos los clientes y su saldo actual.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Clientes
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Gestor completo de tu base de datos de usuarios con buscador interactivo. Desde aquí puedes interactuar mediante iconos:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
                <li><strong>Flecha (Verde):</strong> Ver historial detallado de obtención de puntos.</li>
                <li><strong>Reloj (Morado):</strong> Ver historial de puntos canjeados.</li>
                <li><strong>Globo de Chat:</strong> Botón para enviar WhatsApp (Próximamente).</li>
                <li><strong>Regalo:</strong> Botón para descontar / canjear puntos manualmente cuando el cliente reclama un premio.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Store className="w-5 h-5 text-green-500" />
                Puntos de Promoción (PP)
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Lugar para dar de alta y gestionar los comercios o lugares físicos que entregan puntos.
                Podrás crear nuevos "PP" y el sistema generará automáticamente un <strong>Código QR Único e imprimible</strong> por cada uno.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-500" />
                Presupuesto de Puntos
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Herramienta de control de riesgos. Te permite crear topes (Bolsa de puntos máxima, rango de fechas, o ambas).
                Si el presupuesto se agota, el sistema avisará a los clientes al escanear que la promoción ha finalizado.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-green-500" />
            3. Flujo Sugerido de Prueba
          </h2>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-6">
            <ol className="list-decimal list-inside text-gray-700 space-y-4">
              <li>Ingresa a <strong>Puntos de Prom.</strong> y crea un nuevo punto. Guarda o imprime el código QR generado.</li>
              <li>Ingresa a <strong>Presupuesto</strong> y configura una bolsa límite de 100 puntos.</li>
              <li>Toma tu celular, escanea el QR e inicia sesión como un cliente normal. Completa el registro.</li>
              <li>Vuelve al panel de Administrador y revisa cómo suben las métricas y el historial en <strong>Clientes</strong>.</li>
              <li>Finalmente, en la pestaña de Clientes, pulsa el icono de <strong>Regalo</strong> para descontarte los puntos.</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
