import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // FIX: Hapus @ts-expect-error yang unused. Pakai type assertion yang proper.
        // Sebelumnya pakai // @ts-expect-error yang sekarang dianggap error karena sudah tidak diperlukan.
        (token as any).role = (user as any).role;
        (token as any).id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  providers: [], // sengaja kosong, biar edge ringan
} satisfies NextAuthConfig;
