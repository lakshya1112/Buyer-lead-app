// lib/auth.ts
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { value: "user@example.com" },
        password: { value: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "user@example.com" &&
          credentials?.password === "password"
        ) {
          let user = await prisma.user.findUnique({
            where: { email: "user@example.com" },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: "user@example.com",
                name: "Demo User",
              },
            });
          }
          return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};