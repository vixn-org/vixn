import type { NextAuthConfig } from "next-auth";

export type UserRole = "admin" | "subadmin";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole })?.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      const isApiRoute = request.nextUrl.pathname.startsWith("/api");

      // Don't protect API routes here
      if (isApiRoute) return true;

      // Allow login page access
      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", request.nextUrl));
        }
        return true;
      }

      // Protect admin routes
      if (isAdminRoute) {
        if (!isLoggedIn) return false;

        const userRole = (session?.user as { role?: UserRole })?.role;
        if (
          userRole === "subadmin" &&
          request.nextUrl.pathname.startsWith("/admin/blogs")
        ) {
          return Response.redirect(new URL("/admin/models", request.nextUrl));
        }

        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
