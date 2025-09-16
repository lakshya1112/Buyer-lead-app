// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This is where we'll define our demo login logic
      async authorize(credentials) {
        // If credentials are not provided, return null
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // --- DEMO USER LOGIC ---
        // In a real app, you'd look this user up in your database.
        // Here, we're just hardcoding a single demo user.
        if (
          credentials.email === "user@example.com" &&
          credentials.password === "password"
        ) {
          // Any object returned here will be saved in the session token.
          // We don't have a user in the DB yet, so we'll just return a mock object.
          return { id: "1", name: "Demo User", email: "user@example.com" };
        } else {
          // If credentials do not match, return null to indicate failure.
          return null;
        }
      },
    }),
  ],
});

export { handler as GET, handler as POST };
export const { auth } = handler;