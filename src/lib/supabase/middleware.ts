import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and getClaims - required for session refresh
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const isSetupPage = request.nextUrl.pathname === "/admin/setup";
  const isForgotPasswordPage =
    request.nextUrl.pathname === "/admin/forgot-password";
  const isResetPasswordPage =
    request.nextUrl.pathname.startsWith("/admin/reset-password");
  const isPublicAdminPage =
    isLoginPage || isSetupPage || isForgotPasswordPage || isResetPasswordPage;

  if (isAdminRoute && !isPublicAdminPage && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirectResponse.cookies.set(name, value)
    );
    return redirectResponse;
  }

  if ((isLoginPage || isSetupPage || isForgotPasswordPage) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirectResponse.cookies.set(name, value)
    );
    return redirectResponse;
  }

  return supabaseResponse;
}
