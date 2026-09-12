import type { DefaultSession } from "next-auth";

type AppRole = "SUPER_ADMIN" | "KEPALA_SEKOLAH" | "OPERATOR" | "GURU";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
  }
}
