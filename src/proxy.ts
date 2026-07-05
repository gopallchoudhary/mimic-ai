import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/chat/(.*)'])
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export const proxy = clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // If signed-in user tries to visit auth pages, send them home
  if (userId && isAuthRoute(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If unauthenticated user tries to visit a protected route, redirect to sign-in
  if (!userId && isProtectedRoute(request)) {
    return (await auth()).redirectToSignIn({ returnBackUrl: request.url })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}