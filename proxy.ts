import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables in proxy');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: any) {
                    // Update the response with new cookies
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }: any) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    // Allow these routes to be accessed without authentication
    const publicRoutes = ['/login', '/unauthorized'];
    
    if (publicRoutes.includes(pathname)) {
        // Don't redirect authenticated users away from login page
        // Let the client-side handle redirects after login
        // This prevents redirect loops
        return response;
    }

    // Handle root path - redirect based on auth status
    if (pathname === '/') {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Let the page.tsx handle the redirect to /dashboard
        return response;
    }

    // Protected routes - redirect to login if not authenticated
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check user profile exists
    let profile;
    try {
        const { data, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            // If it's a network/database error, don't redirect (would cause loop)
            // Allow the request through and let the page handle it
            if (profileError.code === 'PGRST116' || profileError.message?.includes('not found')) {
                // Profile truly doesn't exist - redirect to login
                return NextResponse.redirect(new URL('/login', request.url));
            }
            // Other errors - allow through
            return response;
        }

        profile = data;
        if (!profile) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    } catch (error) {
        console.error('Error checking profile:', error);
        // On error, allow request through to prevent loops
        return response;
    }

    // Super admin routes
    if (pathname.startsWith('/admin')) {
        if ((profile as any).role !== 'super_admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Company admin only routes - super admin should not access these
    if (pathname.startsWith('/pos') || pathname.startsWith('/dashboard') || pathname.startsWith('/items') || pathname.startsWith('/orders') || pathname.startsWith('/reports')) {
        if ((profile as any).role === 'super_admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
