import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const message = params.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
        <div className="text-center mb-6 sm:mb-8 mt-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Portal de Administración</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Acceso restringido al personal autorizado.
          </p>
        </div>

        <form action={loginAdmin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo de Administrador
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@dominio.com"
              required
              className="w-full px-4 py-4 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all text-base"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-4 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all text-base"
            />
          </div>

          {message && (
            <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all active:scale-[0.98] text-lg mt-4"
          >
            Ingresar al Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
