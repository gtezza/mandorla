import QRCode from "react-qr-code";

export default function SimuladorPage() {
  // UUID falso/estático que representaría un sticker de QR en una mesa
  const STATIC_QR_TOKEN = "d2fe9131-1c25-4b64-9d65-d06ebed1d7d7";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const claimUrl = `${SITE_URL}/reclamar?token=${STATIC_QR_TOKEN}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Simulador de QR (Caja)</h1>
      <p className="text-gray-600 mb-8 max-w-md text-center">
        Este es el código QR estático que estaría impreso en la sucursal. Los clientes lo escanearán para obtener sus puntos.
      </p>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <QRCode
            value={claimUrl}
            size={256}
            level="H"
            fgColor="#1e3a8a" // Tailwind blue-900
          />
        </div>
        <p className="mt-6 text-sm text-gray-500 font-mono break-all text-center">
          {claimUrl}
        </p>
        
        <a 
          href={claimUrl} 
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors text-center"
        >
          Simular Escaneo Manual
        </a>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 max-w-sm text-center">
        Nota: Debes asegurarte de insertar manualmente el UUID {STATIC_QR_TOKEN} en la tabla qr_tokens para que funcione la simulación completa.
      </p>
    </div>
  );
}
