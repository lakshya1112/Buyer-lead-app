// middleware.ts

export { default } from "next-auth/middleware";

export const config = {
  // This protects all routes except the ones specified in the matcher
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};