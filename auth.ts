import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8lHiWNJ4y9zZ4t0v4h.8p4v6z9V.Qi";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        const passwordValid = await bcrypt.compare(
          password,
          user?.passwordHash ?? DUMMY_HASH
        );
        if (!user || !user.isActive || !passwordValid) return null;

        prisma.user
          .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
          .catch((err) => console.error("Gagal update lastLoginAt:", err));

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
});