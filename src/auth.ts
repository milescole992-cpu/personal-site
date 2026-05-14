import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { syncUserFromSession } from "@/lib/data";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn({ user, account }) {
      await syncUserFromSession(
        user,
        account?.provider,
        account?.providerAccountId,
      );
    },
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
});
