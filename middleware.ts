// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Public (anonymous) routes — Clerk won't run auth checks here
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/take-test(.*)', // all /take-test paths stay anonymous
  '/api/tests/(.*)/take-test', // Public API route for test-taking
  '/api/tests/(.*)/participants/public', // Public participant creation
  '/api/tests/(.*)/submit', // Public test submission
  '/api/tests/:testId/take-test',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isPublicRoute(req)) {
    return; 
  }

  // Auth applies only for non-public routes
  const { userId } = await auth();

  if (!userId) {
    // Redirect unauthenticated users to sign-in
    const signInUrl = new URL('/', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * - _next (static files)
     * - static files like .png, .jpg, .ico, etc.
     */
    '/((?!_next|.*\\..*).*)',
  ],
};
