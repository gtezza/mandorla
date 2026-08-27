import { loginWithEmail } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || "/";
  const success = params.success === "true";
  const message = params.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Ingresar</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {success
              ? "Revisa tu bandeja de entrada"
              : "Ingresa tu correo para recibir un enlace de acceso seguro. No necesitas contraseña."}
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center font-medium border border-green-200 text-sm sm:text-base">
            ¡Correo enviado! Revisa tu email y haz clic en el enlace mágico para continuar.
          </div>
        ) : (
          <form action={loginWithEmail} className="space-y-4">
            <input type="hidden" name="return_to" value={returnTo} />
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-4 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-base"
              />
            </div>

            {message && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all active:scale-[0.98] text-lg"
            >
              Enviar Enlace Mágico
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
