import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error
        token.role = user.role;
        // @ts-expect-error
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error
        session.user.id = token.id as string;
        // @ts-expect-error
        session.user.role = token.role as any;
      }
      return session;
    },
  },
  providers: [], // sengaja kosong, biar edge ringan
} satisfies NextAuthConfig;