"use client";

import { BookOpen, Download, LayoutDashboard, LineChart, Users, Layers, Gift, Store, Wallet } from "lucide-react";

export default function AyudaPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 print:p-0 print:space-y-6 print:text-black print:bg-white text-[#f5efe6]">
      <div className="flex items-center justify-between border-b border-[#c6a96b]/20 print:border-gray-300 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#c6a96b] print:text-black font-serif flex items-center gap-3">
            <BookOpen className="w-8 h-8 print:text-gray-800" />
            Manual de Uso: FidelIA (Mandorla)
          </h1>
          <p className="text-[#f5efe6]/60 print:text-gray-600 mt-2 text-lg">
            Guía completa para la administración del programa de fidelización y recompensas.
          </p>
        </div>
        <button 
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 bg-[#c6a96b] text-[#1a0e0d] px-4 py-2 rounded-lg font-semibold hover:bg-[#d8bd80] transition-colors"
        >
          <Download className="w-5 h-5" />
          Descargar PDF
        </button>
      </div>

      <div className="space-y-12 print:space-y-8">
        
        {/* Introducción */}
        <section className="print:break-inside-avoid">
          <p className="text-lg leading-relaxed text-[#f5efe6]/80 print:text-gray-700">
            Bienvenido al panel administrativo <strong>FidelIA</strong>. Esta plataforma está diseñada para 
            gestionar de manera integral el sistema de puntos, niveles de clientes y canje de premios 
            de la marca Mandorla, todo bajo una estética premium y un control estricto de seguridad.
          </p>
        </section>

        {/* Sección 1: Métricas e Insights */}
        <section className="print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-[#c6a96b] print:text-black mb-4 flex items-center gap-2 font-serif border-b border-[#c6a96b]/10 print:border-gray-200 pb-2">
            <LayoutDashboard className="w-6 h-6" />
            1. Panel de Control (Métricas e Insights)
          </h2>
          <div className="bg-[#2a1a18] print:bg-transparent print:border-none rounded-xl border border-[#c6a96b]/20 p-6 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-[#f5efe6] print:text-black">
              <LineChart className="w-5 h-5 text-indigo-400 print:text-black" />
              Métricas e Insights
            </h3>
            <p className="text-[#f5efe6]/70 print:text-gray-700">
              Al ingresar a la plataforma, encontrarás dos pantallas principales de reporte:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#f5efe6]/80 print:text-gray-700 ml-4">
              <li><strong>Métricas Generales:</strong> Visualiza en tiempo real los puntos otorgados hoy y en el mes en curso, el saldo de la "bolsa" de presupuesto (si aplica), y la tabla general de clientes.</li>
              <li><strong>Insights:</strong> Analítica avanzada para conocer a tus clientes. Incluye gráficos de segmentación (VIP, Nuevos, En Riesgo, Inactivos), tasa de retención, y rankings (Top Premios Canjeados y Top Puntos de Promoción activos).</li>
            </ul>
          </div>
        </section>

        {/* Sección 2: Clientes */}
        <section className="print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-[#c6a96b] print:text-black mb-4 flex items-center gap-2 font-serif border-b border-[#c6a96b]/10 print:border-gray-200 pb-2">
            <Users className="w-6 h-6" />
            2. Gestión de Clientes
          </h2>
          <div className="bg-[#2a1a18] print:bg-transparent print:border-none rounded-xl border border-[#c6a96b]/20 p-6 space-y-4">
            <p className="text-[#f5efe6]/70 print:text-gray-700">
              Desde la pestaña "Clientes" accedes al directorio de tu base de datos.
            </p>
            <ul className="list-disc list-inside space-y-3 text-[#f5efe6]/80 print:text-gray-700 ml-4">
              <li><strong>Visualización de Saldos:</strong> Observa cuántos puntos ha ganado, cuántos ha gastado y su saldo neto actual.</li>
              <li><strong>Historial de Movimientos:</strong> Utiliza el ícono de descarga (verde) para ver cuándo y dónde sumó puntos. El ícono de regalo (morado) muestra el historial de premios reclamados.</li>
              <li><strong>Canje Manual de Premios:</strong> Al hacer clic en "Descontar / Canjear", puedes registrar manualmente cuando un cliente retire un producto. El sistema te sugerirá los premios a los que puede acceder según su saldo actual.</li>
            </ul>
          </div>
        </section>

        {/* Sección 3: Categorías y Productos */}
        <section className="print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-[#c6a96b] print:text-black mb-4 flex items-center gap-2 font-serif border-b border-[#c6a96b]/10 print:border-gray-200 pb-2">
            <Layers className="w-6 h-6" />
            3. Niveles (Categorías) y Premios
          </h2>
          <div className="bg-[#2a1a18] print:bg-transparent print:border-none rounded-xl border border-[#c6a96b]/20 p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-2 text-[#f5efe6] print:text-black">
                <Layers className="w-5 h-5 text-purple-400 print:text-black" />
                Categorías de Premios (Niveles)
              </h3>
              <p className="text-[#f5efe6]/80 print:text-gray-700">
                Los clientes avanzan de categoría a medida que acumulan puntos en su vida útil. Puedes crear niveles (ej. Bronce, Plata, Oro, Premium) definiendo cuántos puntos se requieren para alcanzarlos y asignándoles un color distintivo. 
                Los clientes serán clasificados automáticamente.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-2 text-[#f5efe6] print:text-black">
                <Gift className="w-5 h-5 text-orange-400 print:text-black" />
                Productos de Canje
              </h3>
              <p className="text-[#f5efe6]/80 print:text-gray-700">
                El catálogo de recompensas. Al crear un premio, se le asigna un costo en puntos, una imagen (opcional) y una categoría (nivel). 
                <strong>Regla importante:</strong> El sistema asume que los premios pertenecen a los niveles creados previamente, y los usuarios verán bloqueados aquellos premios cuyo nivel sea superior al suyo.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 4: Puntos de Promoción y Presupuesto */}
        <section className="print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-[#c6a96b] print:text-black mb-4 flex items-center gap-2 font-serif border-b border-[#c6a96b]/10 print:border-gray-200 pb-2">
            <Store className="w-6 h-6" />
            4. Generación de Puntos y Control (Presupuesto)
          </h2>
          <div className="bg-[#2a1a18] print:bg-transparent print:border-none rounded-xl border border-[#c6a96b]/20 p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-2 text-[#f5efe6] print:text-black">
                <Store className="w-5 h-5 text-green-400 print:text-black" />
                Puntos de Promoción (Generadores de QR)
              </h3>
              <p className="text-[#f5efe6]/80 print:text-gray-700">
                Aquí defines los lugares físicos o eventos que entregan puntos a los clientes. Al crear un Punto de Promoción, 
                el sistema generará un Código QR único, que puedes descargar e imprimir. Cuando los clientes lo escaneen, 
                recibirán puntos en su cuenta y el sistema sabrá exactamente de qué sucursal provinieron.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-2 text-[#f5efe6] print:text-black">
                <Wallet className="w-5 h-5 text-indigo-400 print:text-black" />
                Presupuesto de Puntos (Límites)
              </h3>
              <p className="text-[#f5efe6]/80 print:text-gray-700">
                Para controlar el gasto y los riesgos, la plataforma cuenta con un sistema de presupuestos. Puedes fijar 
                un límite total global ("Bolsa fija" de puntos) y/o un rango de fechas de validez. Si el presupuesto se agota 
                o vence la fecha, la entrega de puntos se pausa automáticamente para proteger a la marca.
              </p>
            </div>
          </div>
        </section>
        
        {/* Footer para Print */}
        <div className="hidden print:block text-center text-sm text-gray-500 pt-8 mt-8 border-t border-gray-300">
          Manual generado desde la plataforma FidelIA. Confidencial y de uso exclusivo interno.
        </div>
      </div>
    </div>
  );
}
