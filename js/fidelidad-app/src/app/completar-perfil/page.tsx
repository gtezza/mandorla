import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { saveProfile } from "./actions";

export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || "/";
  const error = params.error;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  }

  // Si ya tiene el perfil completo, mandarlo de vuelta al claim
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", authData.user.id)
    .single();

  if (profile) {
    redirect(returnTo);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-2">¡Hola!</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Antes de darte tus puntos, cuéntanos un poco sobre ti. Solo te pediremos esto una vez.
          </p>
        </div>

        <form action={saveProfile} className="space-y-4">
          <input type="hidden" name="return_to" value={returnTo} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico (Validado)
            </label>
            <input
              type="email"
              value={authData.user.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-base cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Ej. Juan Pérez"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-base"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (WhatsApp)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              defaultValue={authData.user.phone || "+54 9 "}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-base"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Calle Falsa 123"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-base"
            />
          </div>

          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Cumpleaños
            </label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-base"
            />
            <p className="text-xs text-gray-400 mt-1">¡Te enviaremos sorpresas en tu día!</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-md transition-all active:scale-[0.98] mt-6 text-lg"
          >
            Guardar y Cobrar
          </button>
        </form>
      </div>
    </div>
  );
}
