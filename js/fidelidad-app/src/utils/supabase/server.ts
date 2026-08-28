import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(isAdminLogin = false) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (isAdminLogin) {
                // Remove maxAge and expires to make it a session cookie
                delete options.maxAge;
                delete options.expires;
              }
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Se ignora en Componentes Servidor
          }
        },
      },
    }
  );
}
