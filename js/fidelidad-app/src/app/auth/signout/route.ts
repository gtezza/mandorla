import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Obtener la sesión antes de cerrarla para saber quién es
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  
  // Si venimos del dashboard, enviamos al admin login
  const referer = req.headers.get("referer");
  if (referer && referer.includes("/dashboard")) {
    return NextResponse.redirect(new URL("/admin/login", req.url), {
      status: 302,
    });
  }

  // Por defecto vuelve al inicio
  return NextResponse.redirect(new URL("/", req.url), {
    status: 302,
  });
}
