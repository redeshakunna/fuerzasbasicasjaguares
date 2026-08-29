import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/**
 * Refresca la sesión en cada petición y protege las rutas de /plataforma
 * (excepto /plataforma/login) redirigiendo a usuarios no autenticados.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/plataforma/login";
  // Link público e independiente — un jugador/acudiente de Sub-15 lo llena sin sesión.
  const isPublicRegistrationRoute = pathname.startsWith("/plataforma/registrojugadores");
  const isPlataformaRoute = pathname.startsWith("/plataforma");

  if (isPlataformaRoute && !isLoginRoute && !isPublicRegistrationRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/plataforma/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/plataforma";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
