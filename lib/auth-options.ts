import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? ""
    }),
    CredentialsProvider({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          homeId: user.homeId
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing && account?.provider !== "credentials") {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: Role.GUEST
          }
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (!email) return token;

      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) return token;

      token.sub = dbUser.id;
      token.role = dbUser.role;
      token.homeId = dbUser.homeId;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role | undefined) ?? Role.GUEST;
        session.user.homeId = (token.homeId as string | null | undefined) ?? null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/"
  }
};
