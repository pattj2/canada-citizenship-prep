import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import { prisma } from './prisma'

const usernameSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Username',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Enter your username',
        },
      },
      async authorize(credentials) {
        const parsed = usernameSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { username } = parsed.data
        const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'

        let user = await prisma.user.findUnique({ where: { username } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              username,
              role: username === adminUsername ? 'ADMIN' : 'STUDENT',
            },
          })
        }

        return { id: user.id, name: user.username, role: user.role }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.username = user.name ?? ''
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.name = token.username
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}
